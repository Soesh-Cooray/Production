from django.core.management.base import BaseCommand
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from accounts.models import NotificationSettings
from django.conf import settings
import datetime

class Command(BaseCommand):
    help = 'Send reminder emails to users'

    def handle(self, *args, **options):
        now = timezone.now()
        # Vercel cron might run at UTC, so we should handle timezones carefully.
        # For simplicity, we'll assume the user's reminder_time is in UTC or we compare just the hour.
        # Ideally, we'd store the user's timezone, but we don't have that.
        # We'll assume the input time is roughly what they expect in their timezone, 
        # but without timezone info, we can only match against server time.
        # Let's just match the hour for now.
        
        current_time = now.time()
        self.stdout.write(f"Running reminders check at {now}")
        
        notification_settings = NotificationSettings.objects.exclude(reminder_frequency='none')
        
        for setting in notification_settings:
            if not setting.reminder_time:
                continue
                
            should_send = False
            
            # Check if hour matches (simple check)
            if setting.reminder_time.hour == current_time.hour:
                if setting.reminder_frequency == 'daily':
                    should_send = True
                elif setting.reminder_frequency == 'weekly':
                    # 0 is Monday
                    if now.weekday() == 0:
                        should_send = True
            
            if should_send:
                try:
                    self.send_email(setting.user)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to send email to {setting.user.email}: {e}"))

    def send_email(self, user):
        subject = "Time to update your BudgetMaster!"
        context = {
            'user': user,
            'site_name': getattr(settings, 'SITE_NAME', 'BudgetMaster'),
            'domain': getattr(settings, 'DOMAIN', 'budget-master-app.vercel.app'),
            'protocol': 'https',
        }
        
        html_content = render_to_string('registration/reminder_email.html', context)
        text_content = render_to_string('registration/reminder_email.txt', context)
        
        msg = EmailMultiAlternatives(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            [user.email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        self.stdout.write(self.style.SUCCESS(f'Sent reminder to {user.email}'))

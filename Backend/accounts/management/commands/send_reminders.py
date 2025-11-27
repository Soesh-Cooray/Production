from django.core.management.base import BaseCommand
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from accounts.models import NotificationSettings
from django.conf import settings
import datetime
from datetime import timedelta
import re

class Command(BaseCommand):
    help = 'Send reminder emails to users'

    def parse_timezone_offset(self, tz_string):
        """
        Parse timezone string like 'GMT+5:30' or 'GMT-8:00' and return timedelta offset.
        """
        if tz_string == 'UTC':
            return timedelta(0)
        
        # Match GMT+/-HH:MM or GMT+/-H:MM
        match = re.match(r'GMT([+-])(\d{1,2}):(\d{2})', tz_string)
        if not match:
            # Fallback to UTC if parsing fails
            return timedelta(0)
        
        sign = match.group(1)
        hours = int(match.group(2))
        minutes = int(match.group(3))
        
        offset = timedelta(hours=hours, minutes=minutes)
        if sign == '-':
            offset = -offset
        
        return offset

    def convert_local_to_utc(self, local_time, timezone_str):
        """
        Convert local time to UTC time.
        local_time: datetime.time object
        timezone_str: string like 'GMT+5:30'
        Returns: datetime.time object in UTC
        """
        offset = self.parse_timezone_offset(timezone_str)
        
        # Create a datetime object for today with the local time
        today = datetime.date.today()
        local_datetime = datetime.datetime.combine(today, local_time)
        
        # Subtract the offset to get UTC time
        utc_datetime = local_datetime - offset
        
        return utc_datetime.time()

    def handle(self, *args, **options):
        now = timezone.now()
        current_utc_time = now.time()
        current_hour = current_utc_time.hour
        current_minute = current_utc_time.minute
        
        self.stdout.write(f"Running reminders check at {now} UTC")
        self.stdout.write(f"Current UTC time: {current_hour:02d}:{current_minute:02d}")
        
        notification_settings = NotificationSettings.objects.exclude(reminder_frequency='none')
        
        for setting in notification_settings:
            if not setting.reminder_time:
                continue
            
            # Convert user's local time to UTC
            user_timezone = setting.timezone or 'UTC'
            utc_reminder_time = self.convert_local_to_utc(setting.reminder_time, user_timezone)
            
            self.stdout.write(f"User {setting.user.email}: Local time {setting.reminder_time} ({user_timezone}) -> UTC {utc_reminder_time}")
            
            should_send = False
            
            # Check if the current hour and minute match (within a 5-minute window)
            # This allows for cron jobs that run every 5-10 minutes
            time_diff = abs((utc_reminder_time.hour * 60 + utc_reminder_time.minute) - 
                           (current_hour * 60 + current_minute))
            
            if time_diff <= 5:  # Within 5 minutes
                if setting.reminder_frequency == 'daily':
                    should_send = True
                elif setting.reminder_frequency == 'weekly':
                    # 0 is Monday
                    if now.weekday() == 0:
                        should_send = True
            
            if should_send:
                try:
                    self.send_email(setting.user)
                    self.stdout.write(self.style.SUCCESS(f'Sent reminder to {setting.user.email}'))
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

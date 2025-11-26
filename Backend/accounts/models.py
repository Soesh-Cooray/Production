from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class NotificationSettings(models.Model):
    FREQUENCY_CHOICES = [
        ('none', 'None'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    reminder_frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='none')
    reminder_time = models.TimeField(null=True, blank=True)
    timezone = models.CharField(max_length=20, default='UTC', help_text='Timezone in GMT format (e.g., GMT+5:30)')
    
    def __str__(self):
        return f"{self.user.username} - {self.reminder_frequency}"

@receiver(post_save, sender=User)
def create_user_notification_settings(sender, instance, created, **kwargs):
    if created:
        NotificationSettings.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_notification_settings(sender, instance, **kwargs):
    instance.notification_settings.save()

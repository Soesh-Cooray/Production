from django.urls import path, include
from .views import NotificationSettingsView, CronReminderView

urlpatterns = [
    path('settings/notifications/', NotificationSettingsView.as_view(), name='notification-settings'),
    path('cron/send-reminders/', CronReminderView.as_view(), name='cron-send-reminders'),
    path('', include('djoser.urls')),
    path('', include('djoser.urls.jwt')),
]

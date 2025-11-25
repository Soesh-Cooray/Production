from django.urls import path, include
from .views import UserCreateView, NotificationSettingsView, CronReminderView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='user-register'),
    path('settings/notifications/', NotificationSettingsView.as_view(), name='notification-settings'),
    path('cron/send-reminders/', CronReminderView.as_view(), name='cron-send-reminders'),
    path('', include('djoser.urls')),
    path('', include('djoser.urls.jwt')),
]

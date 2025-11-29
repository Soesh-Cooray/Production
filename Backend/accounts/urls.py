from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationSettingsView, CronReminderView
from .viewsets import UserViewSet

# Create custom router for Djoser with our UserViewSet
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('settings/notifications/', NotificationSettingsView.as_view(), name='notification-settings'),
    path('cron/send-reminders/', CronReminderView.as_view(), name='cron-send-reminders'),
    path('', include(router.urls)),  # Our custom UserViewSet
    path('', include('djoser.urls.jwt')),  # JWT endpoints
]

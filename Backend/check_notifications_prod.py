"""
Check notification settings in PRODUCTION database
Run with: python check_notifications_prod.py
"""
import os
import django

# Use production settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'personal_budget_manager.settings_production')
django.setup()

from accounts.models import NotificationSettings
from django.contrib.auth.models import User

print("=== Notification Settings Check (PRODUCTION DATABASE) ===\n")

# Get all users
users = User.objects.all()
print(f"Total users: {users.count()}\n")

# Get all notification settings
settings = NotificationSettings.objects.all()
print(f"Total notification settings: {settings.count()}\n")

if settings.count() == 0:
    print("⚠️  No notification settings found!")
    print("   Users need to save their settings in the Settings page.\n")
else:
    print("Notification Settings:")
    print("-" * 80)
    for s in settings:
        print(f"User: {s.user.email}")
        print(f"  Frequency: {s.reminder_frequency}")
        print(f"  Time: {s.reminder_time}")
        print(f"  Timezone: {s.timezone}")
        print(f"  Will send? {s.reminder_frequency != 'none' and s.reminder_time is not None}")
        print()

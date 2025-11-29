import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'personal_budget_manager.settings')
django.setup()

from accounts.serializers import UserCreateSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

def test_registration():
    email = "test_register_user@example.com"
    password = "testpassword123"
    username = "test_register_user"
    first_name = "Test"

    # Clean up if exists
    if User.objects.filter(email=email).exists():
        User.objects.get(email=email).delete()
        print(f"Deleted existing user {email}")

    data = {
        'username': username,
        'email': email,
        'password': password,
        're_password': password,
        'first_name': first_name
    }
    
    serializer = UserCreateSerializer(data=data)
    
    try:
        if serializer.is_valid():
            print("Serializer is valid. Attempting to save...")
            user = serializer.save()
            print(f"Registration Successful! User ID: {user.id}")
        else:
            print("Registration Failed Validation!")
            print("Errors:", serializer.errors)
    except Exception as e:
        with open('traceback.txt', 'w') as f:
            import traceback
            traceback.print_exc(file=f)
        print(f"An error occurred during registration: {e}")

if __name__ == "__main__":
    test_registration()

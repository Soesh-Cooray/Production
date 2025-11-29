from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from djoser.serializers import UserSerializer
from djoser.serializers import UserCreateSerializer as DjoserUserCreateSerializer
import logging

logger = logging.getLogger(__name__)
logger.info("🔍 DEBUG: accounts.serializers module loaded")

# Reference to the custom or default User model
User = get_user_model()


# Serializer for creating a new user, including password validation and confirmation
# IMPORTANT: Must inherit from Djoser's UserCreateSerializer for proper integration
class UserCreateSerializer(DjoserUserCreateSerializer):
    re_password = serializers.CharField(
        style={'input_type': 'password'},
        write_only=True,
        required=True
    )

    def __init__(self, *args, **kwargs):
        logger.info(f"🔍 DEBUG: UserCreateSerializer.__init__ called! Instance being created.")
        super().__init__(*args, **kwargs)
        logger.info(f"🔍 DEBUG: UserCreateSerializer.__init__ completed")
    
    class Meta(DjoserUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'password', 're_password')

    def validate(self, attrs):
        logger.info(f"🔍 DEBUG: UserCreateSerializer.validate called with keys: {attrs.keys()}")
        if 're_password' in attrs:
            re_password = attrs.pop('re_password')
            password = attrs.get('password')
            if password != re_password:
                from rest_framework import serializers
                raise serializers.ValidationError({"re_password": "Passwords must match."})
        
        result = super().validate(attrs)
        logger.info("🔍 DEBUG: UserCreateSerializer.validate completed")
        return result
    
    # Override create (not perform_create) to ensure username is passed correctly
    def create(self, validated_data):
        logger.info(f"🔍 DEBUG: UserCreateSerializer.create called with: {validated_data.keys()}")
        # Remove re_password before creating user
        validated_data.pop('re_password', None)
        
        # Ensure username is set (Djoser requires it)
        logger.info(f"🔍 DEBUG: Creating user with username={validated_data.get('username')}, email={validated_data.get('email')}")
        user = User.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            first_name=validated_data.get('first_name', ''),
            password=validated_data.get('password')
        )
        logger.info(f"🔍 DEBUG: User created successfully: {user.id}")
        return user


# Custom serializer for updating user details (used by Djoser's /auth/users/me/ endpoint)
class CustomUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'first_name')
        read_only_fields = ('username',)  # Username cannot be changed


from .models import NotificationSettings

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = ('reminder_frequency', 'reminder_time', 'timezone')

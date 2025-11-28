from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make username optional since we might login with email
        self.fields[self.username_field].required = False
        # Add email field if not present (though we access it from initial_data usually, better to have it in fields)
        from rest_framework import serializers
        self.fields['email'] = serializers.EmailField(required=False)

    def validate(self, attrs):
        # If email is provided but username is not, try to find the user by email
        # Note: attrs will contain 'email' if we added it to fields, or we check initial_data
        
        email = attrs.get('email')
        username = attrs.get(self.username_field)

        if email and not username:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(email=email)
                attrs[self.username_field] = user.get_username()
            except User.DoesNotExist:
                # Let the super class handle the failure (it will fail on missing username or auth)
                pass
        
        # We need to ensure username is in attrs for super().validate()
        # If it's still missing, super().validate() might raise validation error or fail auth
        
        data = super().validate(attrs)

        # Add custom claims
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['first_name'] = self.user.first_name
        
        return data

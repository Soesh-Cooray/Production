from djoser.views import UserViewSet as DjoserUserViewSet
from .serializers import UserCreateSerializer

class UserViewSet(DjoserUserViewSet):
    """Custom UserViewSet that explicitly uses our UserCreateSerializer"""
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return super().get_serializer_class()

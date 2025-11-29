from djoser.views import UserViewSet as DjoserUserViewSet
from .serializers import UserCreateSerializer
import logging

logger = logging.getLogger(__name__)

class UserViewSet(DjoserUserViewSet):
    """Custom UserViewSet that explicitly uses our UserCreateSerializer"""
    
    def get_serializer_class(self):
        if self.action == 'create':
            logger.info("🔍 DEBUG: UserViewSet.get_serializer_class() returning UserCreateSerializer for create action")
            return UserCreateSerializer
        return super().get_serializer_class()

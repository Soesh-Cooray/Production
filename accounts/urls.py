from django.urls import path, include
from .views import UserCreateView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='user-register'),
    path('', include('djoser.urls')),
    path('', include('djoser.urls.jwt')),
]

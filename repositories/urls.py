# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RepositoryViewSet

router = DefaultRouter()
router.register(r'repositories', RepositoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
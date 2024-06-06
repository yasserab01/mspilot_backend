from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SectionViewSet
from django.urls import get_resolver

router = DefaultRouter()
router.register(r'sections', SectionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import HomeUserView

router = DefaultRouter()
router.register(r'reports', HomeUserView, basename='home')

urlpatterns = [
    path('/home', views.HomeUserView.as_view(), name='home'),
]

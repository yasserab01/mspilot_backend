from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, PDFReport

router = DefaultRouter()
router.register(r'reports', ReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('pdf-report/', PDFReport.as_view(), name='pdf-report'),
]

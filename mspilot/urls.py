from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import get_resolver

from companies.views import CompanyViewSet
from reports.views import ReportViewSet, PDFReport
from repositories.views import RepositoryViewSet
from sections.views import SectionViewSet
from users.views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'repositories', RepositoryViewSet)
router.register(r'reports', ReportViewSet)

urlpatterns = [
                  # Include Django admin
                  path('admin/', admin.site.urls),
                  # Include Django auth
                  path('api-auth/', include('rest_framework.urls'), name='login'),
                  path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
                  path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
                  path('api/pdf-report/', PDFReport.as_view(), name='pdf-report'),
                  path('api/', include(router.urls)),
                  ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


"""Root of the public REST API (mounted at /api/)."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.core.views import AboutView
from apps.inquiries.views import InquiryCreateView
from apps.portfolio.views import ProjectCategoryViewSet, ProjectViewSet
from apps.services.views import ServiceViewSet

app_name = "api"

router = DefaultRouter(trailing_slash=True)
router.register("services", ServiceViewSet, basename="service")
router.register("portfolio/categories", ProjectCategoryViewSet, basename="project-category")
router.register("portfolio/projects", ProjectViewSet, basename="project")

urlpatterns = [
    path("about/", AboutView.as_view(), name="about"),
    path("inquiries/", InquiryCreateView.as_view(), name="inquiry-create"),
    path("", include(router.urls)),
]

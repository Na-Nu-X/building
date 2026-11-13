from django.db.models import Count, Q
from rest_framework import viewsets

from .models import Project, ProjectCategory
from .serializers import ProjectCategorySerializer, ProjectSerializer


class ProjectCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Categories that contain at least one published project."""

    serializer_class = ProjectCategorySerializer
    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self):
        return (
            ProjectCategory.objects.annotate(
                project_count=Count("projects", filter=Q(projects__is_published=True))
            )
            .filter(project_count__gt=0)
            .order_by("order", "pk")
        )


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """Published projects with their galleries. Filter with `?category=<slug>` or `?featured=1`."""

    serializer_class = ProjectSerializer
    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self):
        qs = Project.objects.published().with_gallery()
        params = self.request.query_params
        if category := params.get("category"):
            qs = qs.filter(category__slug=category)
        if params.get("featured") in {"1", "true"}:
            qs = qs.filter(is_featured=True)
        return qs

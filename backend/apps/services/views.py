from rest_framework import viewsets

from .models import Service
from .serializers import ServiceSerializer


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ServiceSerializer
    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self):
        return Service.objects.published().prefetch_related("features")

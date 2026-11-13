from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Certification, Guarantee, Stat, TeamMember
from .serializers import (
    CertificationSerializer,
    GuaranteeSerializer,
    StatSerializer,
    TeamMemberSerializer,
)


class AboutView(APIView):
    """All content for the About & Trust section in a single request."""

    def get(self, request: Request) -> Response:
        ctx = {"request": request}
        return Response(
            {
                "stats": StatSerializer(Stat.objects.published(), many=True, context=ctx).data,
                "guarantees": GuaranteeSerializer(
                    Guarantee.objects.published(), many=True, context=ctx
                ).data,
                "certifications": CertificationSerializer(
                    Certification.objects.published(), many=True, context=ctx
                ).data,
                "team": TeamMemberSerializer(
                    TeamMember.objects.published(), many=True, context=ctx
                ).data,
            }
        )

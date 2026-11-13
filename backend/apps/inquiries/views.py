import logging
from functools import partial

from django.db import transaction
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import Inquiry
from .notifications import notify_new_inquiry
from .serializers import InquiryCreateSerializer

logger = logging.getLogger(__name__)

SUCCESS_MESSAGE = "Ďakujeme, vaša správa bola odoslaná. Ozveme sa vám čo najskôr."


class InquiryCreateView(CreateAPIView):
    serializer_class = InquiryCreateSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "inquiries"

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Bots get the same response as humans, but nothing is stored or sent.
        if serializer.is_spam:
            logger.info("Honeypot triggered from %s", self._client_ip(request))
            return Response({"detail": SUCCESS_MESSAGE}, status=status.HTTP_201_CREATED)

        with transaction.atomic():
            inquiry: Inquiry = serializer.save(
                ip_address=self._client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:300],
            )
            transaction.on_commit(partial(notify_new_inquiry, inquiry.pk))
        return Response({"detail": SUCCESS_MESSAGE}, status=status.HTTP_201_CREATED)

    def _client_ip(self, request: Request) -> str | None:
        # Reuse DRF's proxy-aware logic (honours REST_FRAMEWORK["NUM_PROXIES"]).
        return ScopedRateThrottle().get_ident(request) or None

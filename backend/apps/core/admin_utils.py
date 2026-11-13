"""Small helpers shared by the admin classes."""

from django.utils.html import format_html

PREVIEW_STYLE = "height:{h}px;width:auto;max-width:{w}px;object-fit:cover;border-radius:6px;display:block;"


def image_preview(url: str | None, height: int = 48, width: int = 96, alt: str = ""):
    if not url:
        return "–"
    return format_html('<img src="{}" alt="{}" loading="lazy" style="{}">', url, alt, PREVIEW_STYLE.format(h=height, w=width))

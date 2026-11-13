"""Image processing helpers: validation and resized WebP variants via Pillow."""

from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import PurePosixPath

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.db.models.fields.files import FieldFile
from PIL import Image, ImageOps

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
MAX_PIXELS = 60_000_000  # ~ 60 MP, guards against decompression bombs


@dataclass(frozen=True)
class Variant:
    """A resized rendition stored next to the original."""

    suffix: str
    max_size: tuple[int, int]
    quality: int


THUMBNAIL = Variant("thumb", (800, 800), 78)
LARGE = Variant("large", (2000, 2000), 85)


def validate_image_file(file) -> None:
    """Model-field validator: size, format and pixel count."""
    max_bytes = settings.MAX_UPLOAD_IMAGE_SIZE
    if file.size and file.size > max_bytes:
        raise ValidationError(
            "Súbor je príliš veľký (max. %(mb)d MB).",
            params={"mb": max_bytes // (1024 * 1024)},
        )
    try:
        file.seek(0)
        with Image.open(file) as img:
            if img.format not in ALLOWED_FORMATS:
                raise ValidationError("Povolené formáty sú JPG, PNG a WEBP.")
            width, height = img.size
            if width * height > MAX_PIXELS:
                raise ValidationError("Obrázok má príliš vysoké rozlíšenie.")
    except ValidationError:
        raise
    except Exception as exc:  # Pillow raises many different error types
        raise ValidationError("Súbor nie je platný obrázok.") from exc
    finally:
        file.seek(0)


def render_variant(source: FieldFile, variant: Variant) -> tuple[ContentFile, int, int]:
    """Return a WebP rendition of `source` and its final dimensions."""
    source.open("rb")
    source.seek(0)
    with Image.open(source) as img:
        img = ImageOps.exif_transpose(img)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if "transparency" in img.info else "RGB")
        img.thumbnail(variant.max_size, Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format="WEBP", quality=variant.quality, method=6)
        width, height = img.size
    stem = PurePosixPath(source.name).stem
    return ContentFile(buffer.getvalue(), name=f"{stem}-{variant.suffix}.webp"), width, height


def original_dimensions(source: FieldFile) -> tuple[int, int]:
    source.open("rb")
    source.seek(0)
    with Image.open(source) as img:
        img = ImageOps.exif_transpose(img)
        return img.size


def delete_file(field: FieldFile | None) -> None:
    """Delete a stored file without touching the model instance."""
    if field and field.name:
        field.storage.delete(field.name)

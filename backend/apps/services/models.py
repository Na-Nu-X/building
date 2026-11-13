from django.db import models
from django.utils.text import slugify

from apps.core.images import validate_image_file
from apps.core.models import OrderedModel, PublishableQuerySet, TimeStampedModel


class Service(OrderedModel, TimeStampedModel):
    class PriceUnit(models.TextChoices):
        SQUARE_METER = "m2", "€ / m²"
        RUNNING_METER = "m", "€ / bm"
        HOUR = "hour", "€ / hod."
        PROJECT = "project", "€ / projekt"

    title = models.CharField("názov", max_length=120)
    slug = models.SlugField("URL identifikátor", max_length=140, unique=True, blank=True)
    icon = models.CharField(
        "ikona",
        max_length=40,
        default="hammer",
        help_text="Názov ikony vo frontende, napr. house, trowel, tiles, drywall, paint, hammer.",
    )
    short_description = models.CharField("krátky popis", max_length=240)
    description = models.TextField("podrobný popis", blank=True)
    image = models.ImageField(
        "obrázok", upload_to="services/", blank=True, validators=[validate_image_file]
    )
    price_from = models.DecimalField(
        "cena od", max_digits=10, decimal_places=2, null=True, blank=True
    )
    price_unit = models.CharField(
        "jednotka ceny", max_length=10, choices=PriceUnit.choices, default=PriceUnit.SQUARE_METER
    )
    is_featured = models.BooleanField("zvýraznená", default=False)
    is_published = models.BooleanField("zverejnená", default=True)

    objects = PublishableQuerySet.as_manager()

    class Meta(OrderedModel.Meta):
        verbose_name = "služba"
        verbose_name_plural = "služby"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:140]
        super().save(*args, **kwargs)


class ServiceFeature(OrderedModel):
    service = models.ForeignKey(
        Service, verbose_name="služba", related_name="features", on_delete=models.CASCADE
    )
    text = models.CharField("text", max_length=120)

    class Meta(OrderedModel.Meta):
        verbose_name = "bod služby"
        verbose_name_plural = "body služby"

    def __str__(self) -> str:
        return self.text

"""Shared abstract models and the About/Trust section content."""

from django.db import models

from .images import validate_image_file


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField("vytvorené", auto_now_add=True)
    updated_at = models.DateTimeField("upravené", auto_now=True)

    class Meta:
        abstract = True


class OrderedModel(models.Model):
    order = models.PositiveIntegerField("poradie", default=0, db_index=True)

    class Meta:
        abstract = True
        ordering = ["order", "pk"]


class PublishableQuerySet(models.QuerySet):
    def published(self):
        return self.filter(is_published=True)


class Stat(OrderedModel):
    """A headline number in the About section, e.g. "15+ rokov skúseností"."""

    value = models.PositiveIntegerField("hodnota")
    suffix = models.CharField("prípona", max_length=10, blank=True, help_text="Napr. „+“ alebo „%“.")
    label = models.CharField("popis", max_length=80)
    is_published = models.BooleanField("zverejnené", default=True)

    objects = PublishableQuerySet.as_manager()

    class Meta(OrderedModel.Meta):
        verbose_name = "štatistika"
        verbose_name_plural = "štatistiky"

    def __str__(self) -> str:
        return f"{self.value}{self.suffix} {self.label}"


class Guarantee(OrderedModel):
    """A quality promise shown in the trust section."""

    icon = models.CharField("ikona", max_length=40, default="shield")
    title = models.CharField("nadpis", max_length=80)
    text = models.CharField("text", max_length=240)
    is_published = models.BooleanField("zverejnené", default=True)

    objects = PublishableQuerySet.as_manager()

    class Meta(OrderedModel.Meta):
        verbose_name = "záruka"
        verbose_name_plural = "záruky kvality"

    def __str__(self) -> str:
        return self.title


class Certification(OrderedModel):
    name = models.CharField("názov", max_length=120)
    issuer = models.CharField("vydal", max_length=120, blank=True)
    year = models.PositiveSmallIntegerField("rok", null=True, blank=True)
    logo = models.ImageField(
        "logo", upload_to="certifications/", blank=True, validators=[validate_image_file]
    )
    is_published = models.BooleanField("zverejnené", default=True)

    objects = PublishableQuerySet.as_manager()

    class Meta(OrderedModel.Meta):
        verbose_name = "certifikát"
        verbose_name_plural = "certifikáty"

    def __str__(self) -> str:
        return self.name


class TeamMember(OrderedModel):
    name = models.CharField("meno", max_length=120)
    role = models.CharField("pozícia", max_length=120)
    bio = models.CharField("krátky popis", max_length=280, blank=True)
    photo = models.ImageField(
        "fotografia", upload_to="team/", blank=True, validators=[validate_image_file]
    )
    is_published = models.BooleanField("zverejnené", default=True)

    objects = PublishableQuerySet.as_manager()

    class Meta(OrderedModel.Meta):
        verbose_name = "člen tímu"
        verbose_name_plural = "tím"

    def __str__(self) -> str:
        return f"{self.name} ({self.role})"

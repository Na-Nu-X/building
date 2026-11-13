from django.db import models
from django.utils.text import slugify

from apps.core.images import (
    LARGE,
    THUMBNAIL,
    delete_file,
    original_dimensions,
    render_variant,
    validate_image_file,
)
from apps.core.models import OrderedModel, PublishableQuerySet, TimeStampedModel


class ProjectCategory(OrderedModel):
    name = models.CharField("názov", max_length=80)
    slug = models.SlugField("URL identifikátor", max_length=100, unique=True, blank=True)

    class Meta(OrderedModel.Meta):
        verbose_name = "kategória"
        verbose_name_plural = "kategórie projektov"

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:100]
        super().save(*args, **kwargs)


class ProjectQuerySet(PublishableQuerySet):
    def with_gallery(self):
        return self.select_related("category").prefetch_related("images")


class Project(OrderedModel, TimeStampedModel):
    title = models.CharField("názov", max_length=160)
    slug = models.SlugField("URL identifikátor", max_length=180, unique=True, blank=True)
    category = models.ForeignKey(
        ProjectCategory,
        verbose_name="kategória",
        related_name="projects",
        on_delete=models.PROTECT,
    )
    location = models.CharField("lokalita", max_length=120, blank=True)
    completed_on = models.DateField("dokončené", null=True, blank=True)
    summary = models.CharField("krátky popis", max_length=280, blank=True)
    description = models.TextField("podrobný popis", blank=True)
    area_m2 = models.DecimalField(
        "plocha (m²)", max_digits=8, decimal_places=1, null=True, blank=True
    )
    duration_weeks = models.PositiveSmallIntegerField("trvanie (týždne)", null=True, blank=True)
    is_featured = models.BooleanField("zvýraznený", default=False)
    is_published = models.BooleanField("zverejnený", default=True)

    objects = ProjectQuerySet.as_manager()

    class Meta:
        ordering = ["order", "-completed_on", "-pk"]
        verbose_name = "projekt"
        verbose_name_plural = "projekty"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:170] or "projekt"
            slug, n = base, 2
            while Project.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug, n = f"{base}-{n}", n + 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def cover(self) -> "ProjectImage | None":
        """The image flagged as cover, otherwise the first image (uses prefetch cache)."""
        images = list(self.images.all())
        return next((img for img in images if img.is_cover), images[0] if images else None)


class ProjectImage(OrderedModel):
    project = models.ForeignKey(
        Project, verbose_name="projekt", related_name="images", on_delete=models.CASCADE
    )
    image = models.ImageField(
        "fotografia", upload_to="projects/original/", validators=[validate_image_file]
    )
    thumbnail = models.ImageField(upload_to="projects/thumb/", editable=False, blank=True)
    large = models.ImageField(upload_to="projects/large/", editable=False, blank=True)
    width = models.PositiveIntegerField(editable=False, default=0)
    height = models.PositiveIntegerField(editable=False, default=0)
    alt = models.CharField(
        "alternatívny text", max_length=160, blank=True, help_text="Popis obrázka pre čítačky obrazovky a SEO."
    )
    caption = models.CharField("popisok", max_length=200, blank=True)
    is_cover = models.BooleanField("titulná fotografia", default=False)

    class Meta(OrderedModel.Meta):
        verbose_name = "fotografia"
        verbose_name_plural = "fotografie"

    def __str__(self) -> str:
        return self.caption or self.alt or f"Fotografia #{self.pk}"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_image_name = self.image.name

    def save(self, *args, **kwargs):
        image_changed = self.image.name != self._original_image_name or not self.thumbnail
        if image_changed and self.image:
            self._regenerate_variants()
        super().save(*args, **kwargs)
        if self.is_cover:
            ProjectImage.objects.filter(project=self.project_id, is_cover=True).exclude(
                pk=self.pk
            ).update(is_cover=False)
        self._original_image_name = self.image.name

    def _regenerate_variants(self) -> None:
        delete_file(self.thumbnail)
        delete_file(self.large)
        self.width, self.height = original_dimensions(self.image)
        thumb, _, _ = render_variant(self.image, THUMBNAIL)
        large, _, _ = render_variant(self.image, LARGE)
        self.thumbnail.save(thumb.name, thumb, save=False)
        self.large.save(large.name, large, save=False)

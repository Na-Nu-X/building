from pathlib import Path

from django.conf import settings
from django.urls import reverse
from PIL import Image

from apps.core.testing import MediaTestCase, make_image

from .models import Project, ProjectCategory, ProjectImage


class PortfolioFixtureMixin:
    def setUp(self):
        self.interiors = ProjectCategory.objects.create(name="Interiéry", order=1)
        self.exteriors = ProjectCategory.objects.create(name="Exteriéry", order=2)
        self.empty = ProjectCategory.objects.create(name="Hrubá stavba", order=3)
        self.project = Project.objects.create(title="Kúpeľňa Trnava", category=self.interiors)
        Project.objects.create(title="Fasáda", category=self.exteriors)
        Project.objects.create(title="Skrytý", category=self.empty, is_published=False)


class ProjectImageProcessingTests(PortfolioFixtureMixin, MediaTestCase):
    def test_variants_are_generated_as_webp_within_bounds(self):
        image = ProjectImage.objects.create(project=self.project, image=make_image())

        self.assertEqual((image.width, image.height), (2400, 1600))
        with Image.open(image.thumbnail.path) as thumb:
            self.assertEqual(thumb.format, "WEBP")
            self.assertEqual(thumb.size, (800, 533))
        with Image.open(image.large.path) as large:
            self.assertEqual(large.size, (2000, 1333))

    def test_replacing_image_regenerates_variants_and_removes_old_files(self):
        image = ProjectImage.objects.create(project=self.project, image=make_image("a.jpg"))
        old_paths = [Path(image.image.path), Path(image.thumbnail.path), Path(image.large.path)]

        with self.captureOnCommitCallbacks(execute=True):
            image.image = make_image("b.jpg", (1000, 1000))
            image.save()

        self.assertEqual((image.width, image.height), (1000, 1000))
        for path in old_paths:
            self.assertFalse(path.exists(), path)
        self.assertTrue(Path(image.thumbnail.path).exists())

    def test_saving_without_changing_image_keeps_variants(self):
        image = ProjectImage.objects.create(project=self.project, image=make_image())
        thumb_name = image.thumbnail.name
        image.caption = "Nový popisok"
        image.save()
        self.assertEqual(image.thumbnail.name, thumb_name)

    def test_delete_removes_files(self):
        image = ProjectImage.objects.create(project=self.project, image=make_image())
        paths = [Path(image.image.path), Path(image.thumbnail.path), Path(image.large.path)]
        with self.captureOnCommitCallbacks(execute=True):
            image.delete()
        for path in paths:
            self.assertFalse(path.exists(), path)

    def test_only_one_cover_per_project(self):
        first = ProjectImage.objects.create(project=self.project, image=make_image(), is_cover=True)
        second = ProjectImage.objects.create(project=self.project, image=make_image(), is_cover=True)
        first.refresh_from_db()
        self.assertFalse(first.is_cover)
        self.assertTrue(second.is_cover)
        self.assertEqual(Project.objects.with_gallery().get(pk=self.project.pk).cover, second)

    def test_cover_falls_back_to_first_image(self):
        first = ProjectImage.objects.create(project=self.project, image=make_image(), order=0)
        ProjectImage.objects.create(project=self.project, image=make_image(), order=1)
        self.assertEqual(self.project.cover, first)

    def test_media_root_is_isolated(self):
        self.assertNotEqual(Path(settings.MEDIA_ROOT), settings.BASE_DIR / "media")


class PortfolioApiTests(PortfolioFixtureMixin, MediaTestCase):
    def test_categories_exclude_empty_and_count_published_projects(self):
        response = self.client.get(reverse("api:project-category-list"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [(c["slug"], c["project_count"]) for c in response.data],
            [("interiery", 1), ("exteriery", 1)],
        )

    def test_projects_list_hides_unpublished(self):
        response = self.client.get(reverse("api:project-list"))
        self.assertEqual({p["title"] for p in response.data}, {"Kúpeľňa Trnava", "Fasáda"})

    def test_projects_filter_by_category(self):
        response = self.client.get(reverse("api:project-list"), {"category": "exteriery"})
        self.assertEqual([p["title"] for p in response.data], ["Fasáda"])

    def test_project_detail_includes_absolute_image_urls(self):
        ProjectImage.objects.create(project=self.project, image=make_image(), alt="Kúpeľňa")
        response = self.client.get(reverse("api:project-detail", args=[self.project.slug]))
        self.assertEqual(response.status_code, 200)
        image = response.data["images"][0]
        self.assertTrue(image["thumbnail"].startswith("http://testserver/media/projects/thumb/"))
        self.assertTrue(image["large"].endswith(".webp"))
        self.assertEqual(response.data["cover"]["id"], image["id"])
        self.assertEqual(response.data["category"]["slug"], "interiery")

    def test_duplicate_titles_get_unique_slugs(self):
        duplicate = Project.objects.create(title="Kúpeľňa Trnava", category=self.interiors)
        self.assertEqual(duplicate.slug, "kupelna-trnava-2")

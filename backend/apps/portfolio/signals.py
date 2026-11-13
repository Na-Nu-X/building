"""Remove image files from storage when their database rows are deleted."""

from django.db import transaction
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from apps.core.images import delete_file

from .models import ProjectImage


@receiver(post_delete, sender=ProjectImage)
def delete_project_image_files(sender, instance: ProjectImage, **kwargs) -> None:
    files = [instance.image, instance.thumbnail, instance.large]
    transaction.on_commit(lambda: [delete_file(f) for f in files])


@receiver(pre_save, sender=ProjectImage)
def delete_replaced_original(sender, instance: ProjectImage, **kwargs) -> None:
    if not instance.pk:
        return
    old_name = instance._original_image_name
    if old_name and old_name != instance.image.name:
        storage = instance.image.storage
        transaction.on_commit(lambda: storage.delete(old_name))

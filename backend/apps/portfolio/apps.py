from django.apps import AppConfig


class PortfolioConfig(AppConfig):
    verbose_name = "Portfólio"
    name = 'apps.portfolio'

    def ready(self) -> None:
        from . import signals  # noqa: F401

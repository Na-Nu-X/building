"""Populate the database with Slovak demo content and generated placeholder photos.

Usage:
    python manage.py seed_demo            # create missing demo content (idempotent)
    python manage.py seed_demo --flush    # wipe content tables first (inquiries are kept)
"""

from __future__ import annotations

import io
import random
from datetime import date
from decimal import Decimal

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from PIL import Image, ImageDraw, ImageFont

from apps.core.models import Certification, Guarantee, Stat, TeamMember
from apps.portfolio.models import Project, ProjectCategory, ProjectImage
from apps.services.models import Service, ServiceFeature

SERVICES = [
    {
        "slug": "hrube-stavby",
        "title": "Hrubé stavby",
        "icon": "house",
        "short_description": "Výstavba rodinných domov od základovej dosky až po strechu – murované aj keramické systémy.",
        "price_from": Decimal("320"),
        "price_unit": Service.PriceUnit.SQUARE_METER,
        "is_featured": True,
        "features": ["Základové dosky a pásy", "Murivo Porotherm / Ytong", "Stropy a vence", "Krovy a strechy"],
    },
    {
        "slug": "rekonstrukcie-interierov",
        "title": "Rekonštrukcie interiérov",
        "icon": "hammer",
        "short_description": "Kompletné rekonštrukcie bytov, domov a kancelárií na kľúč s jedným zodpovedným partnerom.",
        "price_from": Decimal("180"),
        "price_unit": Service.PriceUnit.SQUARE_METER,
        "is_featured": True,
        "features": ["Búracie a prípravné práce", "Rozvody vody a elektriny", "Omietky a podlahy", "Koordinácia remesiel"],
    },
    {
        "slug": "obkladanie-a-dlazby",
        "title": "Obkladanie a dlažby",
        "icon": "tiles",
        "short_description": "Presné kladenie obkladov a dlažieb vrátane veľkoformátov, terás a kúpeľní.",
        "price_from": Decimal("28"),
        "price_unit": Service.PriceUnit.SQUARE_METER,
        "features": ["Veľkoformátové dlaždice", "Hydroizolácie kúpeľní", "Terasy a balkóny", "Silikónovanie a škárovanie"],
    },
    {
        "slug": "sadrokartony",
        "title": "Sadrokartóny",
        "icon": "drywall",
        "short_description": "Priečky, podhľady, predsadené steny a podkrovia zo systémov Knauf a Rigips.",
        "price_from": Decimal("24"),
        "price_unit": Service.PriceUnit.SQUARE_METER,
        "features": ["Zavesené podhľady", "Akustické a protipožiarne priečky", "Podkrovné vstavby", "LED nike a svetelné rampy"],
    },
    {
        "slug": "murarske-prace",
        "title": "Murárske práce",
        "icon": "trowel",
        "short_description": "Murovanie, omietky, poter a drobné stavebné úpravy s dôrazom na čistotu práce.",
        "price_from": Decimal("35"),
        "price_unit": Service.PriceUnit.HOUR,
        "features": ["Vnútorné a vonkajšie omietky", "Betónové a anhydritové potery", "Prestavby priečok", "Vybúranie otvorov"],
    },
    {
        "slug": "fasady-a-zateplenie",
        "title": "Fasády a zateplenie",
        "icon": "facade",
        "short_description": "Kontaktné zatepľovacie systémy a fasádne omietky, ktoré znížia náklady na energie.",
        "price_from": Decimal("55"),
        "price_unit": Service.PriceUnit.SQUARE_METER,
        "features": ["EPS a minerálna vlna", "Silikónové omietky", "Sokle a parapety", "Pomoc s dotáciami"],
    },
]

CATEGORIES = [
    ("interiery", "Interiéry"),
    ("exteriery", "Exteriéry"),
    ("hruba-stavba", "Hrubá stavba"),
]

PROJECTS = [
    ("Rodinný dom Hrnčiarovce", "hruba-stavba", "Hrnčiarovce nad Parnou", date(2026, 6, 20), 148, 22, True),
    ("Rekonštrukcia bytu 3+1", "interiery", "Trnava – Linčianska", date(2026, 4, 2), 74, 9, True),
    ("Kúpeľňa s veľkoformátovou dlažbou", "interiery", "Piešťany", date(2026, 2, 14), 9, 3, False),
    ("Zateplenie bytového domu", "exteriery", "Hlohovec", date(2025, 10, 30), 1250, 12, True),
    ("Bungalov s plochou strechou", "hruba-stavba", "Biely Kostol", date(2025, 9, 12), 126, 18, False),
    ("Podkrovná vstavba zo sadrokartónu", "interiery", "Zeleneč", date(2025, 7, 5), 58, 6, False),
    ("Terasa a vonkajšie schodisko", "exteriery", "Smolenice", date(2025, 6, 18), 42, 4, False),
    ("Rekonštrukcia rodinného domu", "exteriery", "Leopoldov", date(2025, 4, 25), 165, 16, False),
    ("Hrubá stavba dvojdomu", "hruba-stavba", "Ružindol", date(2025, 3, 3), 212, 20, False),
]

STATS = [(17, "+", "rokov skúseností"), (240, "+", "dokončených projektov"), (98, "%", "spokojných klientov"), (5, "", "rokov záruky na prácu")]

GUARANTEES = [
    ("calendar", "Dodržanie termínov", "Harmonogram je súčasťou zmluvy. Za omeškanie z našej strany ručíme zľavou."),
    ("receipt", "Transparentný rozpočet", "Položkový rozpočet vopred, bez skrytých poplatkov a prekvapení počas stavby."),
    ("shield", "Záruka 5 rokov", "Na všetky stavebné práce poskytujeme rozšírenú záruku nad rámec zákona."),
    ("broom", "Čisté stavenisko", "Po každom pracovnom dni upraceme. Pri odovzdaní nechávame priestor pripravený na bývanie."),
]

CERTIFICATIONS = [
    ("Certifikovaný realizátor ETICS", "Baumit", 2023),
    ("Systémový partner suchej výstavby", "Knauf", 2022),
    ("ISO 9001:2015", "TÜV SÜD Slovakia", 2024),
    ("Člen Zväzu stavebných podnikateľov Slovenska", "ZSPS", 2019),
]

TEAM = [
    ("Ing. Martin Novák", "Konateľ a stavbyvedúci", "Viac ako 20 rokov v stavebníctve, zodpovedá za každú zákazku od rozpočtu po odovzdanie."),
    ("Peter Horváth", "Majster – hrubé stavby", "Vedie murárske partie a dohliada na presnosť od základov po strechu."),
    ("Lucia Kováčová", "Rozpočtárka a projektová manažérka", "Pripravuje rozpočty, harmonogramy a komunikuje s klientmi."),
    ("Tomáš Baláž", "Obkladač a sadrokartonista", "Špecialista na veľkoformáty a náročné interiérové detaily."),
]

PALETTES = [
    ((38, 44, 52), (120, 96, 72)),
    ((30, 36, 42), (88, 104, 118)),
    ((46, 42, 38), (158, 112, 70)),
    ((28, 32, 38), (70, 84, 96)),
]


def _font(size: int) -> ImageFont.ImageFont:
    for name in ("DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default(size)


def placeholder_image(label: str, seed: int, size: tuple[int, int] = (1600, 1067)) -> ContentFile:
    """An "architectural" placeholder: dark gradient, blueprint grid, diagonal beams and a label."""
    rng = random.Random(seed)
    top, bottom = PALETTES[seed % len(PALETTES)]
    w, h = size
    img = Image.new("RGB", size)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        draw.line([(0, y), (w, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bottom)))
    overlay = Image.new("RGBA", size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for x in range(0, w, 80):
        od.line([(x, 0), (x, h)], fill=(255, 255, 255, 18))
    for y in range(0, h, 80):
        od.line([(0, y), (w, y)], fill=(255, 255, 255, 18))
    for _ in range(5):
        x0 = rng.randint(-200, w)
        od.polygon(
            [(x0, h), (x0 + 140, h), (x0 + 140 + rng.randint(200, 500), 0), (x0 + rng.randint(200, 500), 0)],
            fill=(249, 115, 22, rng.randint(14, 36)),
        )
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)
    draw.rectangle([64, h - 150, 72, h - 64], fill=(249, 115, 22))
    draw.text((96, h - 150), label, font=_font(52), fill=(245, 245, 245))
    draw.text((96, h - 86), "Ukážková fotografia", font=_font(26), fill=(200, 200, 200))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=88)
    return ContentFile(buffer.getvalue(), name=f"demo-{seed}.jpg")


class Command(BaseCommand):
    help = "Naplní databázu ukážkovým obsahom (služby, projekty, o nás)."

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true", help="Delete existing content first.")
        parser.add_argument("--images", type=int, default=4, help="Photos per project (default 4).")

    @transaction.atomic
    def handle(self, *args, flush: bool, images: int, **options):
        if flush:
            for image in ProjectImage.objects.all():
                image.delete()  # triggers file cleanup
            for model in (Project, ProjectCategory, ServiceFeature, Service, Stat, Guarantee, Certification, TeamMember):
                model.objects.all().delete()
            self.stdout.write("Existing content deleted.")

        for order, data in enumerate(SERVICES):
            data = dict(data)
            features = data.pop("features")
            service, created = Service.objects.update_or_create(
                slug=data.pop("slug"), defaults={**data, "order": order}
            )
            if created:
                ServiceFeature.objects.bulk_create(
                    ServiceFeature(service=service, text=text, order=i) for i, text in enumerate(features)
                )

        categories = {
            slug: ProjectCategory.objects.update_or_create(slug=slug, defaults={"name": name, "order": i})[0]
            for i, (slug, name) in enumerate(CATEGORIES)
        }

        seed = 0
        for order, (title, cat, location, completed, area, weeks, featured) in enumerate(PROJECTS):
            project, _ = Project.objects.update_or_create(
                title=title,
                defaults={
                    "category": categories[cat],
                    "location": location,
                    "completed_on": completed,
                    "area_m2": Decimal(area),
                    "duration_weeks": weeks,
                    "is_featured": featured,
                    "order": order,
                    "summary": f"{categories[cat].name} – {location}. Realizácia za {weeks} týždňov.",
                    "description": (
                        f"Kompletná realizácia projektu „{title}“ v lokalite {location}. "
                        "Zákazka zahŕňala prípravu rozpočtu, harmonogram prác, dodávku materiálu "
                        "a odovzdanie diela vrátane revízií a dokumentácie."
                    ),
                },
            )
            if project.images.exists():
                continue
            for i in range(images):
                seed += 1
                ProjectImage.objects.create(
                    project=project,
                    image=placeholder_image(title, seed),
                    alt=f"{title} – fotografia {i + 1}",
                    caption=f"{title}, {location}",
                    is_cover=i == 0,
                    order=i,
                )

        for order, (value, suffix, label) in enumerate(STATS):
            Stat.objects.update_or_create(label=label, defaults={"value": value, "suffix": suffix, "order": order})
        for order, (icon, title, text) in enumerate(GUARANTEES):
            Guarantee.objects.update_or_create(title=title, defaults={"icon": icon, "text": text, "order": order})
        for order, (name, issuer, year) in enumerate(CERTIFICATIONS):
            Certification.objects.update_or_create(name=name, defaults={"issuer": issuer, "year": year, "order": order})
        for order, (name, role, bio) in enumerate(TEAM):
            TeamMember.objects.update_or_create(name=name, defaults={"role": role, "bio": bio, "order": order})

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo content ready: {Service.objects.count()} services, "
                f"{Project.objects.count()} projects, {ProjectImage.objects.count()} photos."
            )
        )

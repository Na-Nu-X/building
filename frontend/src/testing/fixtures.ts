import { Project, ProjectCategory, ProjectImage, Service } from '../app/core/models/api.models';

export function makeService(overrides: Partial<Service> = {}): Service {
  return {
    id: 1,
    slug: 'sadrokartony',
    title: 'Sadrokartóny',
    icon: 'drywall',
    short_description: 'Priečky a podhľady.',
    description: '',
    image: null,
    features: ['Podhľady', 'Priečky'],
    price_from: 24,
    price_unit: 'm2',
    price_unit_display: '€ / m²',
    is_featured: false,
    ...overrides,
  };
}

export function makeImage(id: number, overrides: Partial<ProjectImage> = {}): ProjectImage {
  return {
    id,
    thumbnail: `/media/thumb/${id}.webp`,
    large: `/media/large/${id}.webp`,
    original: `/media/original/${id}.jpg`,
    width: 1600,
    height: 1067,
    alt: `Foto ${id}`,
    caption: `Popis ${id}`,
    is_cover: false,
    ...overrides,
  };
}

export function makeProject(id: number, category: ProjectCategory, imageCount = 3): Project {
  const images = Array.from({ length: imageCount }, (_, i) => makeImage(id * 100 + i));
  return {
    id,
    slug: `projekt-${id}`,
    title: `Projekt ${id}`,
    category: { id: category.id, slug: category.slug, name: category.name },
    location: 'Trnava',
    completed_on: '2026-06-20',
    summary: 'Zhrnutie',
    description: '',
    area_m2: 1250,
    duration_weeks: 10,
    is_featured: false,
    cover: images[0] ?? null,
    images,
  };
}

export const INTERIORS: ProjectCategory = { id: 1, slug: 'interiery', name: 'Interiéry', project_count: 0 };
export const EXTERIORS: ProjectCategory = { id: 2, slug: 'exteriery', name: 'Exteriéry', project_count: 0 };

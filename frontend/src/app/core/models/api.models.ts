/**
 * Types mirroring the Django REST API (see backend/apps/<app>/serializers.py).
 * Dates are ISO strings (`YYYY-MM-DD`); prices and areas are plain numbers.
 */

export type PriceUnit = 'm2' | 'm' | 'hour' | 'project';

export interface Service {
  readonly id: number;
  readonly slug: string;
  readonly title: string;
  readonly icon: string;
  readonly short_description: string;
  readonly description: string;
  readonly image: string | null;
  readonly features: readonly string[];
  readonly price_from: number | null;
  readonly price_unit: PriceUnit;
  readonly price_unit_display: string;
  readonly is_featured: boolean;
}

export interface ProjectCategoryRef {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
}

export interface ProjectCategory extends ProjectCategoryRef {
  readonly project_count: number;
}

export interface ProjectImage {
  readonly id: number;
  readonly thumbnail: string;
  readonly large: string;
  readonly original: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption: string;
  readonly is_cover: boolean;
}

export interface Project {
  readonly id: number;
  readonly slug: string;
  readonly title: string;
  readonly category: ProjectCategoryRef;
  readonly location: string;
  readonly completed_on: string | null;
  readonly summary: string;
  readonly description: string;
  readonly area_m2: number | null;
  readonly duration_weeks: number | null;
  readonly is_featured: boolean;
  readonly cover: ProjectImage | null;
  readonly images: readonly ProjectImage[];
}

export interface Stat {
  readonly id: number;
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
}

export interface Guarantee {
  readonly id: number;
  readonly icon: string;
  readonly title: string;
  readonly text: string;
}

export interface Certification {
  readonly id: number;
  readonly name: string;
  readonly issuer: string;
  readonly year: number | null;
  readonly logo: string | null;
}

export interface TeamMember {
  readonly id: number;
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly photo: string | null;
}

export interface AboutContent {
  readonly stats: readonly Stat[];
  readonly guarantees: readonly Guarantee[];
  readonly certifications: readonly Certification[];
  readonly team: readonly TeamMember[];
}

export interface InquiryPayload {
  name: string;
  email: string;
  phone: string;
  service: string | null;
  location: string;
  message: string;
  consent: boolean;
  /** Honeypot – must stay empty. */
  website: string;
}

export interface InquiryResponse {
  readonly detail: string;
}

/** DRF validation error body: field name → list of messages. */
export type ApiFieldErrors = Partial<Record<keyof InquiryPayload | 'non_field_errors' | 'detail', string[] | string>>;

/** Must stay in sync with backend/apps/inquiries/constants.py. */
export const INQUIRY_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  emailMax: 254,
  phoneMax: 30,
  phonePattern: /^\+?[0-9 ()/-]{6,30}$/,
  locationMax: 120,
  messageMin: 20,
  messageMax: 2000,
} as const;

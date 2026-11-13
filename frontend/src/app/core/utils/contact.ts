import { SiteConfig } from '../../site.config';

/** `+421 900 123 456` → `tel:+421900123456`. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function mailHref(email: string, subject?: string): string {
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}

export function formatAddress(address: SiteConfig['contact']['address'], withCountry = false): string {
  const parts = [address.street, `${address.zip} ${address.city}`];
  if (withCountry) parts.push(address.country);
  return parts.join(', ');
}

/** Google Maps turn-by-turn directions to the given coordinates (works on mobile and desktop). */
export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** Full calendar years since `foundedYear`. */
export function yearsSince(foundedYear: number, now: Date = new Date()): number {
  return Math.max(0, now.getFullYear() - foundedYear);
}

/** Initials for the logo mark: "Stavby Novák" → "SN". */
export function initials(name: string, max = 2): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((word) => word[0]!.toLocaleUpperCase('sk'))
    .join('');
}

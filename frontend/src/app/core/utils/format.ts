import { PriceUnit } from '../models/api.models';

const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  m2: 'm²',
  m: 'bm',
  hour: 'hod.',
  project: 'projekt',
};

/** Unit suffix shown after a formatted price, e.g. `320 €` + ` / m²`. */
export function priceUnitLabel(unit: PriceUnit): string {
  return PRICE_UNIT_LABELS[unit] ?? unit;
}

/** Zero-padded index for numbered cards: 1 → "01". */
export function padIndex(index: number): string {
  return String(index).padStart(2, '0');
}

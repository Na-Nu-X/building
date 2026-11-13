/** Single-page section anchors. IDs are used both for `href="#…"` and for scroll-spy. */
export interface NavItem {
  readonly id: string;
  readonly label: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'sluzby', label: 'Služby' },
  { id: 'projekty', label: 'Projekty' },
  { id: 'o-nas', label: 'O nás' },
  { id: 'kontakt', label: 'Kontakt' },
];

export const CONTACT_SECTION_ID = 'kontakt';
export const TOP_ID = 'top';

/**
 * Client-specific configuration.
 *
 * Rebranding the site for a new client means editing only this file
 * (plus replacing images in `public/images/`).
 */

export interface SocialLink {
  readonly platform: 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
  readonly url: string;
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface OpeningHours {
  /** Label shown to visitors, e.g. "Po – Pi". */
  readonly label: string;
  readonly days: readonly Weekday[];
  /** 24h "HH:MM", or `null` for closed days. */
  readonly open: string | null;
  readonly close: string | null;
}

export interface MapTiles {
  /** Leaflet tile URL template. */
  readonly url: string;
  readonly attribution: string;
  readonly subdomains?: string;
  /**
   * Render light tiles as a dark map via a CSS filter. Lets the free OpenStreetMap tiles
   * match the dark design without an API key. Set `false` for natively dark tiles.
   */
  readonly invert: boolean;
}

/**
 * Free OpenStreetMap tiles, darkened with a CSS filter. Fine for a typical company site;
 * for heavy traffic switch to a keyed provider (see `MAP_TILES_EXAMPLES`).
 */
export const OSM_DARK_TILES: MapTiles = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  invert: true,
};

/** Natively dark providers (require a free API key from the provider). */
export const MAP_TILES_EXAMPLES = {
  maptilerDark: {
    url: 'https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=YOUR_KEY',
    attribution: '&copy; MapTiler &copy; OpenStreetMap contributors',
    invert: false,
  },
  stadiaDark: {
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=YOUR_KEY',
    attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors',
    invert: false,
  },
} satisfies Record<string, MapTiles>;

export interface SiteConfig {
  readonly company: {
    readonly name: string;
    /** Short wordmark shown in the header (falls back to `name`). */
    readonly shortName: string;
    readonly legalName: string;
    readonly tagline: string;
    readonly description: string;
    readonly foundedYear: number;
    readonly ico: string;
    readonly dic: string;
    readonly icDph?: string;
  };
  readonly contact: {
    readonly phone: string;
    readonly email: string;
    readonly address: {
      readonly street: string;
      readonly city: string;
      readonly zip: string;
      readonly country: string;
    };
    readonly openingHours: readonly OpeningHours[];
    /** IANA time zone used for the "open now" indicator. */
    readonly timeZone: string;
    /** Shown under the contact form, e.g. typical response time. */
    readonly responseNote: string;
  };
  readonly legal: {
    /** Link to the privacy policy (GDPR); the consent checkbox links to it when set. */
    readonly privacyPolicyUrl: string | null;
  };
  readonly map: {
    readonly lat: number;
    readonly lng: number;
    readonly zoom: number;
    readonly tiles: MapTiles;
  };
  readonly socials: readonly SocialLink[];
  readonly hero: {
    readonly eyebrow: string;
    readonly title: string;
    /** Part of `title` rendered in the accent colour (must appear verbatim in `title`). */
    readonly titleHighlight?: string;
    readonly subtitle: string;
    /**
     * Photo behind the hero (place it in `public/images/`), e.g. `/images/hero.jpg`.
     * `null` shows the built-in blueprint illustration instead.
     */
    readonly backgroundImage: string | null;
    /** Short trust facts shown under the call-to-action buttons. */
    readonly facts: readonly { readonly value: string; readonly label: string }[];
  };
  readonly seo: {
    readonly title: string;
    readonly description: string;
    readonly url: string;
  };
}

const FOUNDED_YEAR = 2009;

export const SITE_CONFIG: SiteConfig = {
  company: {
    name: 'Stavby Novák s.r.o.',
    shortName: 'Stavby Novák',
    legalName: 'Stavby Novák s.r.o.',
    tagline: 'Staviame poctivo. Od základov po kľúč.',
    description:
      'Rodinná stavebná firma z Trnavy, ktorá stavia rodinné domy a robí kompletné rekonštrukcie na kľúč.',
    foundedYear: FOUNDED_YEAR,
    ico: '12 345 678',
    dic: '2023456789',
    icDph: 'SK2023456789',
  },
  contact: {
    phone: '+421 900 123 456',
    email: 'info@stavbynovak.sk',
    address: {
      street: 'Priemyselná 12',
      city: 'Trnava',
      zip: '917 01',
      country: 'Slovensko',
    },
    openingHours: [
      { label: 'Po – Pi', days: [1, 2, 3, 4, 5], open: '07:00', close: '17:00' },
      { label: 'Sobota', days: [6], open: '08:00', close: '12:00' },
      { label: 'Nedeľa', days: [7], open: null, close: null },
    ],
    timeZone: 'Europe/Bratislava',
    responseNote: 'Na dopyty odpovedáme spravidla do 24 hodín v pracovných dňoch.',
  },
  legal: {
    privacyPolicyUrl: null,
  },
  map: {
    lat: 48.3774,
    lng: 17.5883,
    zoom: 14,
    tiles: OSM_DARK_TILES,
  },
  socials: [
    { platform: 'facebook', url: 'https://facebook.com/' },
    { platform: 'instagram', url: 'https://instagram.com/' },
  ],
  hero: {
    eyebrow: 'Stavebná firma · Trnava a okolie',
    title: 'Postavíme váš dom. Premeníme váš priestor.',
    titleHighlight: 'Premeníme',
    subtitle:
      'Hrubé stavby, kompletné rekonštrukcie, obklady a sadrokartóny – s pevnými termínmi, transparentným rozpočtom a zárukou kvality.',
    backgroundImage: null,
    facts: [
      { value: `${new Date().getFullYear() - FOUNDED_YEAR}+`, label: 'rokov na trhu' },
      { value: '240+', label: 'dokončených stavieb' },
      { value: '5 rokov', label: 'záruka na prácu' },
    ],
  },
  seo: {
    title: 'Stavby Novák – stavebná firma, rekonštrukcie a hrubé stavby',
    description:
      'Výstavba rodinných domov, rekonštrukcie bytov a domov, obklady, dlažby a sadrokartóny v Trnave a okolí. Nezáväzná kalkulácia zdarma.',
    url: 'https://www.stavbynovak.sk',
  },
};

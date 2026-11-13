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

export interface OpeningHours {
  /** Human-readable day range, e.g. "Po – Pi". */
  readonly days: string;
  /** Opening time range, or `null` when closed. */
  readonly hours: string | null;
}

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
  };
  readonly map: {
    readonly lat: number;
    readonly lng: number;
    readonly zoom: number;
  };
  readonly socials: readonly SocialLink[];
  readonly hero: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
    readonly backgroundImage: string;
  };
  readonly seo: {
    readonly title: string;
    readonly description: string;
    readonly url: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
  company: {
    name: 'Stavby Novák s.r.o.',
    shortName: 'Stavby Novák',
    legalName: 'Stavby Novák s.r.o.',
    tagline: 'Staviame poctivo. Od základov po kľúč.',
    description:
      'Rodinná stavebná firma s viac ako 15-ročnými skúsenosťami s výstavbou rodinných domov a kompletnými rekonštrukciami.',
    foundedYear: 2009,
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
      { days: 'Po – Pi', hours: '7:00 – 17:00' },
      { days: 'So', hours: '8:00 – 12:00' },
      { days: 'Ne', hours: null },
    ],
  },
  map: {
    lat: 48.3774,
    lng: 17.5883,
    zoom: 14,
  },
  socials: [
    { platform: 'facebook', url: 'https://facebook.com/' },
    { platform: 'instagram', url: 'https://instagram.com/' },
  ],
  hero: {
    eyebrow: 'Stavebná firma · Trnava a okolie',
    title: 'Postavíme váš dom. Premeníme váš priestor.',
    subtitle:
      'Hrubé stavby, kompletné rekonštrukcie, obklady a sadrokartóny – s pevnými termínmi, transparentným rozpočtom a zárukou kvality.',
    backgroundImage: '/images/hero.jpg',
  },
  seo: {
    title: 'Stavby Novák – stavebná firma, rekonštrukcie a hrubé stavby',
    description:
      'Výstavba rodinných domov, rekonštrukcie bytov a domov, obklady, dlažby a sadrokartóny v Trnave a okolí. Nezáväzná kalkulácia zdarma.',
    url: 'https://www.stavbynovak.sk',
  },
};

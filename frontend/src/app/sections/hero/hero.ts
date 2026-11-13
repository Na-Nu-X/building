import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import { CONTACT_SECTION_ID, NAV_ITEMS, TOP_ID } from '../../core/layout/navigation';
import { telHref } from '../../core/utils/contact';
import { Icon } from '../../shared/icon/icon';
import { SITE_CONFIG } from '../../site.config';
import { HeroBlueprint } from './hero-blueprint';

interface TitlePart {
  readonly text: string;
  readonly highlight: boolean;
}

/** Split `title` around the first occurrence of `highlight`. */
export function splitTitle(title: string, highlight?: string): TitlePart[] {
  const index = highlight ? title.indexOf(highlight) : -1;
  if (!highlight || index < 0) return [{ text: title, highlight: false }];
  return [
    { text: title.slice(0, index), highlight: false },
    { text: highlight, highlight: true },
    { text: title.slice(index + highlight.length), highlight: false },
  ].filter((part) => part.text.length > 0);
}

@Component({
  selector: 'app-hero',
  imports: [Icon, HeroBlueprint],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly site = SITE_CONFIG;
  protected readonly hero = SITE_CONFIG.hero;
  protected readonly topId = TOP_ID;
  protected readonly contactId = CONTACT_SECTION_ID;
  protected readonly projectsId = 'projekty';
  protected readonly nextSectionId = NAV_ITEMS[0]!.id;
  protected readonly phoneHref = telHref(SITE_CONFIG.contact.phone);
  protected readonly titleParts = computed(() => splitTitle(this.hero.title, this.hero.titleHighlight));
}

import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import { apiUrl } from '../../core/api/api.config';
import { AboutContent } from '../../core/models/api.models';
import { initials, yearsSince } from '../../core/utils/contact';
import { CountUp } from '../../shared/count-up/count-up';
import { Icon } from '../../shared/icon/icon';
import { Reveal } from '../../shared/reveal/reveal';
import { SectionHeading } from '../../shared/section-heading/section-heading';
import { SITE_CONFIG } from '../../site.config';

/** Academic titles commonly used in Slovakia, ignored when building avatar initials. */
const TITLE = /^(ing|mgr|bc|mudr|judr|phdr|rndr|doc|prof|arch|phd|csc|mba)\.?,?$/i;

/** "Ing. Martin Novák, PhD." → "MN". */
export function personInitials(name: string): string {
  const words = name.split(/\s+/).filter((word) => word && !TITLE.test(word));
  return initials(words.join(' '));
}

const EMPTY: AboutContent = { stats: [], guarantees: [], certifications: [], team: [] };

@Component({
  selector: 'app-about',
  imports: [CountUp, Icon, Reveal, SectionHeading],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  private readonly url = apiUrl('/about/');
  protected readonly about = httpResource<AboutContent>(() => this.url, { defaultValue: EMPTY });
  protected readonly content = computed(() => (this.about.hasValue() ? this.about.value() : EMPTY));

  protected readonly company = SITE_CONFIG.company;
  protected readonly years = yearsSince(SITE_CONFIG.company.foundedYear);
  protected readonly personInitials = personInitials;
}

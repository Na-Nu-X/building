import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';

import { ActiveSectionService } from '../../core/layout/active-section.service';
import { NAV_ITEMS } from '../../core/layout/navigation';

import { About } from '../../sections/about/about';
import { Contact } from '../../sections/contact/contact';
import { Hero } from '../../sections/hero/hero';
import { Portfolio } from '../../sections/portfolio/portfolio';
import { Services } from '../../sections/services/services';

/** Single-page layout: hero, services, portfolio, about and contact. */
@Component({
  selector: 'app-home',
  imports: [Hero, Services, Portfolio, About, Contact],
  template: `
    <app-hero />

    <app-services />

    <app-portfolio />

    <app-about />

    <app-contact />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  constructor() {
    const activeSection = inject(ActiveSectionService);
    // Sections live in this lazily loaded page, so start the scroll-spy once they exist.
    afterNextRender(() => activeSection.observe(NAV_ITEMS.map((item) => item.id)));
  }
}

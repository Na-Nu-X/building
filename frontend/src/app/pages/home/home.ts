import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';

import { ActiveSectionService } from '../../core/layout/active-section.service';
import { NAV_ITEMS } from '../../core/layout/navigation';

import { Hero } from '../../sections/hero/hero';
import { Portfolio } from '../../sections/portfolio/portfolio';
import { Services } from '../../sections/services/services';
import { SectionHeading } from '../../shared/section-heading/section-heading';

/**
 * Single-page layout. About and contact sections are temporary shells
 * (correct ids and themes) that later steps replace with full components.
 */
@Component({
  selector: 'app-home',
  imports: [Hero, Services, Portfolio, SectionHeading],
  template: `
    <app-hero />

    <app-services />

    <app-portfolio />

    <section id="o-nas" class="section theme-light" aria-labelledby="o-nas-title">
      <div class="container">
        <app-section-heading headingId="o-nas-title" eyebrow="Prečo my" title="O nás" />
      </div>
    </section>

    <section id="kontakt" class="section" aria-labelledby="kontakt-title">
      <div class="container">
        <app-section-heading headingId="kontakt-title" eyebrow="Ozvite sa nám" title="Kontakt" />
      </div>
    </section>
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

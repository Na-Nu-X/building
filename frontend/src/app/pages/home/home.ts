import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Hero } from '../../sections/hero/hero';
import { SectionHeading } from '../../shared/section-heading/section-heading';

/**
 * Single-page layout. Services, projects, about and contact sections are temporary shells
 * (correct ids and themes) that later steps replace with full components.
 */
@Component({
  selector: 'app-home',
  imports: [Hero, SectionHeading],
  template: `
    <app-hero />

    <section id="sluzby" class="section theme-light" aria-labelledby="sluzby-title">
      <div class="container">
        <app-section-heading headingId="sluzby-title" eyebrow="Čo robíme" title="Služby" />
      </div>
    </section>

    <section id="projekty" class="section" aria-labelledby="projekty-title">
      <div class="container">
        <app-section-heading headingId="projekty-title" eyebrow="Referencie" title="Projekty" />
      </div>
    </section>

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
export class Home {}

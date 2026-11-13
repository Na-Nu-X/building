import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Consistent section intro: eyebrow, heading (with id for `aria-labelledby`) and optional lead. */
@Component({
  selector: 'app-section-heading',
  template: `
    @if (eyebrow()) {
      <p class="eyebrow">{{ eyebrow() }}</p>
    }
    <h2 [id]="headingId()">{{ title() }}</h2>
    @if (lead()) {
      <p class="lead">{{ lead() }}</p>
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-4);
      max-width: 720px;
      margin-bottom: clamp(2.5rem, 5vw, 4rem);
    }
    :host(.is-centered) {
      margin-inline: auto;
      text-align: center;
      justify-items: center;
    }
    .lead {
      max-width: 60ch;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeading {
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly lead = input<string>();
  readonly headingId = input.required<string>();
}

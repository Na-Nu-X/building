import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { initials } from '../../core/utils/contact';
import { SITE_CONFIG } from '../../site.config';

/** Text wordmark: initials badge + company name with the last word emphasised. */
@Component({
  selector: 'app-logo',
  template: `
    <span class="logo__mark" aria-hidden="true">{{ mark() }}</span>
    <span class="logo__name">
      {{ lead() }}
      @if (tail()) {
        <strong>{{ tail() }}</strong>
      }
    </span>
  `,
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Logo {
  readonly name = input(SITE_CONFIG.company.shortName);

  protected readonly mark = computed(() => initials(this.name()));
  private readonly words = computed(() => this.name().trim().split(/\s+/));
  protected readonly lead = computed(() => {
    const words = this.words();
    return words.length > 1 ? words.slice(0, -1).join(' ') : words[0];
  });
  protected readonly tail = computed(() => {
    const words = this.words();
    return words.length > 1 ? words.at(-1) : '';
  });
}

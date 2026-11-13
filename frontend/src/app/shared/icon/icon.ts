import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ICONS, IconName, isIconName } from './icons';

/**
 * Inline SVG icon. Decorative by default (`aria-hidden`); pass `label` to expose it to assistive tech.
 * Unknown names (e.g. icon keys typed into the admin) fall back to `hammer`.
 */
@Component({
  selector: 'app-icon',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
      focusable="false"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName | string>();
  readonly size = input(20);
  readonly strokeWidth = input(1.75);
  readonly label = input<string>();

  protected readonly paths = computed(() => {
    const name = this.name();
    return ICONS[isIconName(name) ? name : 'hammer'];
  });
}

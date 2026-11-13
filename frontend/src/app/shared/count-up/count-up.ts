import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, LOCALE_ID, afterNextRender, effect, inject, input } from '@angular/core';

const DURATION_MS = 1600;

/**
 * Animates a number from 0 to `appCountUp` the first time the element scrolls into view.
 * The final value is rendered immediately for SSR/no-JS, reduced motion and missing IntersectionObserver.
 */
@Directive({ selector: '[appCountUp]' })
export class CountUp {
  readonly appCountUp = input.required<number>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly format = new Intl.NumberFormat(inject(LOCALE_ID));
  private animated = false;

  constructor() {
    const win = inject(DOCUMENT).defaultView;

    effect(() => {
      if (!this.animated) this.render(this.appCountUp());
    });

    afterNextRender(() => {
      const reduced = win?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (!win || reduced || !('IntersectionObserver' in win) || !win.requestAnimationFrame) return;

      this.render(0);
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        this.animated = true;
        const target = this.appCountUp();
        const start = win.performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          const eased = 1 - Math.pow(1 - t, 4);
          this.render(Math.round(target * eased));
          if (t < 1) win.requestAnimationFrame(step);
        };
        win.requestAnimationFrame(step);
      });
      observer.observe(this.el);
    });
  }

  private render(value: number): void {
    this.el.textContent = this.format.format(value);
  }
}

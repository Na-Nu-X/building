import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Fades an element in when it scrolls into view. Without IntersectionObserver (or with
 * reduced motion) the element is shown immediately. `revealDelay` staggers grid items (ms).
 */
@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[style.--reveal-delay.ms]': 'revealDelay()',
  },
})
export class Reveal {
  readonly revealDelay = input(0);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const win = inject(DOCUMENT).defaultView;

    afterNextRender(() => {
      const reduced = win?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (!win || !('IntersectionObserver' in win) || reduced) {
        el.classList.add('is-visible');
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            el.classList.add('is-visible');
            observer.disconnect();
          }
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      observer.observe(el);
    });
  }
}

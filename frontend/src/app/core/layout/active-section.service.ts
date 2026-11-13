import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Scroll-spy: tracks which page section currently crosses the middle band of the viewport.
 * Call `observe(ids)` after the sections have rendered.
 */
@Injectable({ providedIn: 'root' })
export class ActiveSectionService {
  private readonly document = inject(DOCUMENT);
  private observer?: IntersectionObserver;

  private readonly _active = signal<string | null>(null);
  readonly active = this._active.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  observe(ids: readonly string[]): void {
    const win = this.document.defaultView;
    if (!win || !('IntersectionObserver' in win)) return;

    this.observer?.disconnect();
    const visible = new Set<string>();
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Prefer the last section in document order that is inside the band.
        this._active.set([...ids].reverse().find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );

    for (const id of ids) {
      const el = this.document.getElementById(id);
      if (el) this.observer.observe(el);
    }
  }
}

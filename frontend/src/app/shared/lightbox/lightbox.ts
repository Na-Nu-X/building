import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { Icon } from '../icon/icon';

export interface LightboxImage {
  readonly src: string;
  readonly thumb: string;
  readonly alt: string;
  readonly caption?: string;
  readonly width?: number;
  readonly height?: number;
}

const SWIPE_THRESHOLD = 50;

/**
 * Full-screen image viewer built on the native `<dialog>` (focus trap, Esc, inert background).
 * Render it with `@if` and remove it on `(closed)`.
 */
@Component({
  selector: 'app-lightbox',
  imports: [Icon],
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Lightbox {
  private readonly document = inject(DOCUMENT);

  readonly images = input.required<readonly LightboxImage[]>();
  readonly title = input('');
  readonly subtitle = input('');
  readonly index = model(0);
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly thumbStrip = viewChild<ElementRef<HTMLElement>>('thumbs');

  protected readonly loaded = signal(false);
  protected readonly direction = signal<'next' | 'prev'>('next');

  protected readonly count = computed(() => this.images().length);
  protected readonly current = computed(() => this.images()[this.index()] ?? null);
  protected readonly hasMany = computed(() => this.count() > 1);

  private pointerStartX: number | null = null;

  constructor() {
    afterNextRender(() => {
      const dialog = this.dialog().nativeElement;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      this.document.documentElement.classList.add('is-scroll-locked');
    });

    // Reset the loading state and preload neighbours whenever the image changes.
    effect(() => {
      const images = this.images();
      const i = this.index();
      this.loaded.set(false);
      for (const offset of [1, -1]) {
        const neighbour = images[(i + offset + images.length) % images.length];
        if (neighbour && typeof Image !== 'undefined') new Image().src = neighbour.src;
      }
      this.thumbStrip()
        ?.nativeElement.querySelector<HTMLElement>(`[data-index="${i}"]`)
        ?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
  }

  next(): void {
    if (!this.hasMany()) return;
    this.direction.set('next');
    this.index.update((i) => (i + 1) % this.count());
  }

  prev(): void {
    if (!this.hasMany()) return;
    this.direction.set('prev');
    this.index.update((i) => (i - 1 + this.count()) % this.count());
  }

  goTo(i: number): void {
    if (i === this.index()) return;
    this.direction.set(i > this.index() ? 'next' : 'prev');
    this.index.set(i);
  }

  close(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else this.onDialogClose();
  }

  protected onDialogClose(): void {
    this.document.documentElement.classList.remove('is-scroll-locked');
    this.closed.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.goTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.goTo(this.count() - 1);
    }
  }

  /** Clicking the dark backdrop (the dialog element itself) closes the viewer. */
  protected onDialogClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target === this.dialog().nativeElement || target.classList.contains('lightbox__stage')) this.close();
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') this.pointerStartX = event.clientX;
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.pointerStartX === null) return;
    const delta = event.clientX - this.pointerStartX;
    this.pointerStartX = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) this.next();
    else this.prev();
  }
}

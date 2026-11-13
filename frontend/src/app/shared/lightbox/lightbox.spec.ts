import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lightbox, LightboxImage } from './lightbox';

const IMAGES: LightboxImage[] = [1, 2, 3].map((n) => ({
  src: `/large/${n}.webp`,
  thumb: `/thumb/${n}.webp`,
  alt: `Foto ${n}`,
  caption: `Popis ${n}`,
}));

describe('Lightbox', () => {
  let fixture: ComponentFixture<Lightbox>;
  const el = () => fixture.nativeElement as HTMLElement;
  const image = () => el().querySelector<HTMLImageElement>('.lightbox__image')!;
  const press = (key: string) =>
    el().querySelector('dialog')!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(Lightbox);
    fixture.componentRef.setInput('images', IMAGES);
    fixture.componentRef.setInput('title', 'Rodinný dom');
    await fixture.whenStable();
  });

  afterEach(() => document.documentElement.classList.remove('is-scroll-locked'));

  it('opens on the given image and locks page scroll', () => {
    expect(image().getAttribute('src')).toBe('/large/1.webp');
    expect(el().querySelector('.lightbox__counter')?.textContent).toContain('1');
    expect(document.documentElement.classList.contains('is-scroll-locked')).toBe(true);
  });

  it('navigates with buttons and wraps around', async () => {
    el().querySelector<HTMLButtonElement>('.lightbox__nav--prev')!.click();
    await fixture.whenStable();
    expect(image().getAttribute('src')).toBe('/large/3.webp');

    el().querySelector<HTMLButtonElement>('.lightbox__nav--next')!.click();
    await fixture.whenStable();
    expect(image().getAttribute('src')).toBe('/large/1.webp');
  });

  it('supports arrow, Home and End keys', async () => {
    press('ArrowRight');
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(1);

    press('End');
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(2);

    press('Home');
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(0);
  });

  it('jumps to a photo from the thumbnail strip', async () => {
    el().querySelectorAll<HTMLButtonElement>('.lightbox__thumb')[2]!.click();
    await fixture.whenStable();
    expect(image().getAttribute('src')).toBe('/large/3.webp');
    expect(el().querySelectorAll('.lightbox__thumb')[2]!.getAttribute('aria-current')).toBe('true');
  });

  it('emits closed and releases the scroll lock', async () => {
    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));
    el().querySelector<HTMLButtonElement>('.lightbox__close')!.click();
    await fixture.whenStable();
    expect(closed).toBe(true);
    expect(document.documentElement.classList.contains('is-scroll-locked')).toBe(false);
  });

  it('hides navigation for a single image', async () => {
    fixture.componentRef.setInput('images', IMAGES.slice(0, 1));
    await fixture.whenStable();
    expect(el().querySelector('.lightbox__nav')).toBeNull();
    expect(el().querySelector('.lightbox__thumbs')).toBeNull();
  });
});

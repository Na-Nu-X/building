import { TestBed } from '@angular/core/testing';

import { Header } from './header';

describe('Header', () => {
  function setup() {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector<HTMLButtonElement>('.header__toggle')!;
    const menu = el.querySelector<HTMLElement>('#mobile-menu')!;
    return { fixture, el, toggle, menu };
  }

  afterEach(() => document.documentElement.classList.remove('is-scroll-locked'));

  it('starts with the mobile menu closed and inert', () => {
    const { toggle, menu } = setup();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(menu.inert).toBe(true);
  });

  it('opens the menu, locks scrolling and closes on Escape', () => {
    const { fixture, toggle, menu } = setup();

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(menu.inert).toBe(false);
    expect(document.documentElement.classList.contains('is-scroll-locked')).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.documentElement.classList.contains('is-scroll-locked')).toBe(false);
    expect(document.activeElement).toBe(toggle);
  });

  it('closes the menu when a mobile link is chosen', () => {
    const { fixture, el, toggle } = setup();
    toggle.click();
    fixture.detectChanges();

    el.querySelector<HTMLAnchorElement>('.mobile-menu__link')!.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});

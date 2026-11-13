import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { App } from './app';
import { appConfig } from './app.config';
import { NAV_ITEMS } from './core/layout/navigation';
import { SITE_CONFIG } from './site.config';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: appConfig.providers,
    }).compileComponents();
  });

  it('sets the document title from site config', () => {
    TestBed.createComponent(App);
    expect(TestBed.inject(Title).getTitle()).toBe(SITE_CONFIG.seo.title);
  });

  it('renders the shell with skip link, header navigation and footer', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.skip-link')?.getAttribute('href')).toBe('#main');
    const links = [...el.querySelectorAll('.header__link')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(NAV_ITEMS.map((item) => `#${item.id}`));
    expect(el.querySelector('app-footer')?.textContent).toContain(SITE_CONFIG.company.legalName);
  });
});

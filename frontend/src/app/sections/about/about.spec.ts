import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutContent } from '../../core/models/api.models';
import { TEST_PROVIDERS } from '../../../testing/providers';
import { About, personInitials } from './about';

const CONTENT: AboutContent = {
  stats: [{ id: 1, value: 1240, suffix: '+', label: 'dokončených projektov' }],
  guarantees: [{ id: 1, icon: 'shield', title: 'Záruka 5 rokov', text: 'Na všetky práce.' }],
  certifications: [{ id: 1, name: 'ISO 9001', issuer: 'TÜV', year: 2024, logo: null }],
  team: [{ id: 1, name: 'Ing. Martin Novák', role: 'Konateľ', bio: '', photo: null }],
};

describe('About section', () => {
  let fixture: ComponentFixture<About>;
  let http: HttpTestingController;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: TEST_PROVIDERS });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(About);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('renders stats with Slovak number formatting, guarantees, certifications and team', async () => {
    http.expectOne('/api/about/').flush(CONTENT);
    await fixture.whenStable();

    // jsdom has no IntersectionObserver → final value rendered immediately.
    expect(el().querySelector('.stat__value')!.textContent!.replace(/\s/g, ' ')).toBe('1 240+');
    expect(el().querySelector('.guarantee__title')?.textContent).toContain('Záruka 5 rokov');
    expect(el().querySelector('.cert__meta')?.textContent).toContain('od 2024');
    expect(el().querySelector('.member__avatar')?.textContent?.trim()).toBe('MN');
  });

  it('keeps the heading and offers a retry when loading fails', async () => {
    http.expectOne('/api/about/').flush('x', { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();
    expect(el().querySelector('h2')).not.toBeNull();
    expect(el().querySelector('.about__error button')).not.toBeNull();
    expect(el().querySelector('.stats')).toBeNull();
  });
});

describe('personInitials', () => {
  it('ignores academic titles', () => {
    expect(personInitials('Ing. Martin Novák, PhD.')).toBe('MN');
    expect(personInitials('Mgr. Eva Malá')).toBe('EM');
    expect(personInitials('Peter Horváth')).toBe('PH');
  });
});

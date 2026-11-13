import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryPrefillService } from '../../core/inquiry/inquiry-prefill.service';
import { makeService } from '../../../testing/fixtures';
import { TEST_PROVIDERS } from '../../../testing/providers';
import { Services } from './services';

describe('Services section', () => {
  let fixture: ComponentFixture<Services>;
  let http: HttpTestingController;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: TEST_PROVIDERS });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Services);
    // Render and let httpResource issue its request (whenStable would wait for the open request).
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('shows skeletons while loading, then renders cards with Slovak price formatting', async () => {
    expect(el().querySelectorAll('.card--skeleton').length).toBeGreaterThan(0);

    http.expectOne('/api/services/').flush([
      makeService({ is_featured: true, price_from: 1250.5 }),
      makeService({ id: 2, slug: 'murarske-prace', title: 'Murárske práce', price_from: null }),
    ]);
    await fixture.whenStable();

    const cards = el().querySelectorAll('.card:not(.card--skeleton)');
    expect(cards.length).toBe(2);
    const price = cards[0]!.querySelector('.card__price')!.textContent!.replace(/\s+/g, ' ');
    expect(price).toContain('1 250,5 €');
    expect(price).toContain('/ m²');
    expect(cards[0]!.querySelector('.card__badge')).not.toBeNull();
    expect(cards[1]!.textContent).toContain('Cena na vyžiadanie');
  });

  it('pre-selects the service in the contact form when "Mám záujem" is clicked', async () => {
    http.expectOne('/api/services/').flush([makeService()]);
    await fixture.whenStable();

    el().querySelector<HTMLAnchorElement>('.card__link')!.click();
    expect(TestBed.inject(InquiryPrefillService).serviceSlug()).toBe('sadrokartony');
  });

  it('shows an error with a working retry button', async () => {
    http.expectOne('/api/services/').flush('fail', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(el().querySelector('[role="alert"]')?.textContent).toContain('nepodarilo načítať');

    el().querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    fixture.detectChanges();
    http.expectOne('/api/services/').flush([makeService()]);
    await fixture.whenStable();
    expect(el().querySelector('[role="alert"]')).toBeNull();
    expect(el().querySelectorAll('.card:not(.card--skeleton)').length).toBe(1);
  });
});

import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryPrefillService } from '../../core/inquiry/inquiry-prefill.service';
import { INQUIRY_LIMITS } from '../../core/models/api.models';
import { makeService } from '../../../testing/fixtures';
import { TEST_PROVIDERS } from '../../../testing/providers';
import { InquiryForm } from './inquiry-form';

describe('InquiryForm', () => {
  let fixture: ComponentFixture<InquiryForm>;
  let http: HttpTestingController;
  const el = () => fixture.nativeElement as HTMLElement;
  const q = <T extends Element>(selector: string) => el().querySelector<T>(selector)!;

  function type(selector: string, value: string) {
    const input = q<HTMLInputElement | HTMLTextAreaElement>(selector);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  }

  function fillValid() {
    type('#f-name', 'Ján Kováč');
    type('#f-email', 'jan@example.sk');
    type('#f-message', 'Dobrý deň, plánujeme rekonštrukciu kúpeľne, 9 m².');
    const consent = q<HTMLInputElement>('input[type="checkbox"]');
    consent.click();
  }

  async function submit() {
    q<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await Promise.resolve();
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: TEST_PROVIDERS });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(InquiryForm);
    fixture.detectChanges();
    http.expectOne('/api/services/').flush([makeService(), makeService({ id: 2, slug: 'fasady', title: 'Fasády' })]);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('lists services in the select', () => {
    const options = [...el().querySelectorAll('#f-service option')].map((o) => o.textContent?.trim());
    expect(options).toEqual(['Vyberte službu (nepovinné)', 'Sadrokartóny', 'Fasády']);
  });

  it('blocks submission of an empty form, shows inline errors and focuses the first invalid field', async () => {
    await submit();

    http.expectNone('/api/inquiries/');
    expect(q('.form__alert').textContent).toContain('zvýraznené polia (4)');
    expect(q('#f-name-error').textContent).toContain('povinné');
    expect(q('#f-name').getAttribute('aria-invalid')).toBe('true');
    expect(q('#f-name').getAttribute('aria-describedby')).toBe('f-name-error');
    expect(q('#f-consent-error').textContent).toContain('súhlas');
    await new Promise((r) => setTimeout(r));
    expect(document.activeElement?.id).toBe('f-name');
  });

  it('rejects whitespace-only and too-short messages and validates email and phone', () => {
    type('#f-message', '      ');
    type('#f-email', 'zly-email');
    type('#f-phone', 'abc');
    fixture.detectChanges();
    expect(q('#f-message-error').textContent).toContain('povinné');
    expect(q('#f-email-error').textContent).toContain('platnú e-mailovú');
    expect(q('#f-phone-error').textContent).toContain('telefónne');

    type('#f-message', 'Krátka');
    fixture.detectChanges();
    expect(q('#f-message-error').textContent).toContain(`aspoň ${INQUIRY_LIMITS.messageMin} znakov`);
  });

  it('shows live character counters and a hint until the minimum length is reached', () => {
    type('#f-message', 'Ahoj');
    fixture.detectChanges();
    expect(el().textContent).toContain(`4 / ${INQUIRY_LIMITS.messageMax}`);
    expect(q('#f-message-hint').textContent).toContain(`Ešte aspoň ${INQUIRY_LIMITS.messageMin - 4} znakov`);
    expect(q('#f-message').getAttribute('maxlength')).toBe(String(INQUIRY_LIMITS.messageMax));
  });

  it('submits a trimmed payload and shows the success panel', async () => {
    fillValid();
    type('#f-name', '  Ján Kováč  ');
    fixture.detectChanges();
    await submit();

    const req = http.expectOne('/api/inquiries/');
    expect(req.request.body).toMatchObject({ name: 'Ján Kováč', email: 'jan@example.sk', consent: true, website: '' });
    expect(q<HTMLButtonElement>('.form__submit').disabled).toBe(true);

    req.flush({ detail: 'Ďakujeme, ozveme sa.' }, { status: 201, statusText: 'Created' });
    fixture.detectChanges();
    expect(q('.form-success').textContent).toContain('Ďakujeme, ozveme sa.');

    q<HTMLButtonElement>('.form-success button').click();
    fixture.detectChanges();
    expect(q<HTMLInputElement>('#f-name').value).toBe('');
  });

  it('maps server-side field errors onto the matching inputs', async () => {
    fillValid();
    fixture.detectChanges();
    await submit();

    http.expectOne('/api/inquiries/').flush({ email: ['Táto adresa je zablokovaná.'] }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(q('#f-email-error').textContent).toContain('Táto adresa je zablokovaná.');
    expect(fixture.componentInstance.form.controls.email.hasError('server')).toBe(true);

    // Editing the field clears the server error.
    type('#f-email', 'ina@example.sk');
    fixture.detectChanges();
    expect(el().querySelector('#f-email-error')).toBeNull();
  });

  it('explains rate limiting and network failures with the phone number as fallback', async () => {
    fillValid();
    fixture.detectChanges();
    await submit();
    http.expectOne('/api/inquiries/').flush({ detail: 'Throttled' }, { status: 429, statusText: 'Too Many Requests' });
    fixture.detectChanges();
    expect(q('.form__alert').textContent).toContain('veľa správ');
    expect(q('.form__alert').textContent).toContain('+421');

    await submit();
    http.expectOne('/api/inquiries/').error(new ProgressEvent('error'), { status: 0 });
    fixture.detectChanges();
    expect(q('.form__alert').textContent).toContain('Nepodarilo sa spojiť');
  });

  it('pre-selects a service chosen on a service card', () => {
    TestBed.inject(InquiryPrefillService).selectService('fasady');
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.service.value).toBe('fasady');
  });
});

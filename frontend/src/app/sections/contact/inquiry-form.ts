import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ApiService } from '../../core/api/api.service';
import { InquiryPrefillService } from '../../core/inquiry/inquiry-prefill.service';
import { ApiFieldErrors, INQUIRY_LIMITS as L, InquiryPayload } from '../../core/models/api.models';
import { ServicesStore } from '../../core/services/services.store';
import { telHref } from '../../core/utils/contact';
import { Icon } from '../../shared/icon/icon';
import { SITE_CONFIG } from '../../site.config';
import { errorMessage, requiredTrimmed, trimmedMinLength } from './inquiry-form.validators';

type Status = 'idle' | 'submitting' | 'success';
type FieldName = 'name' | 'email' | 'phone' | 'service' | 'location' | 'message' | 'consent';

const FIELD_ORDER: readonly FieldName[] = ['name', 'email', 'phone', 'service', 'location', 'message', 'consent'];

@Component({
  selector: 'app-inquiry-form',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './inquiry-form.html',
  styleUrl: './inquiry-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InquiryForm {
  private readonly api = inject(ApiService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly prefill = inject(InquiryPrefillService);

  protected readonly limits = L;
  protected readonly site = SITE_CONFIG;
  protected readonly phoneHref = telHref(SITE_CONFIG.contact.phone);
  protected readonly services = inject(ServicesStore).list;

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [requiredTrimmed, trimmedMinLength(L.nameMin), Validators.maxLength(L.nameMax)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [requiredTrimmed, Validators.email, Validators.maxLength(L.emailMax)],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(L.phonePattern), Validators.maxLength(L.phoneMax)],
    }),
    service: new FormControl<string | null>(null),
    location: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(L.locationMax)] }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [requiredTrimmed, trimmedMinLength(L.messageMin), Validators.maxLength(L.messageMax)],
    }),
    consent: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
    /** Honeypot: hidden from people, tempting for bots. */
    website: new FormControl('', { nonNullable: true }),
  });

  protected readonly status = signal<Status>('idle');
  protected readonly submitted = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly successMessage = signal('');

  /** Bumped on every value/status change so error helpers re-evaluate under OnPush. */
  private readonly formState = toSignal(this.form.events, { initialValue: null });
  private readonly values = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly messageLength = computed(() => (this.values().message ?? '').length);
  protected readonly messageRemaining = computed(() => Math.max(0, L.messageMin - (this.values().message ?? '').trim().length));
  protected readonly locationLength = computed(() => (this.values().location ?? '').length);

  protected readonly invalidCount = computed(() => {
    this.formState();
    return this.submitted() ? FIELD_ORDER.filter((f) => this.form.controls[f].invalid).length : 0;
  });

  private readonly successPanel = viewChild<ElementRef<HTMLElement>>('success');

  constructor() {
    // "Mám záujem" on a service card pre-selects the service here.
    effect(() => {
      const slug = this.prefill.serviceSlug();
      if (slug) this.form.controls.service.setValue(slug);
    });

    effect(() => {
      if (this.status() === 'success') queueMicrotask(() => this.successPanel()?.nativeElement.focus());
    });
  }

  protected error(field: FieldName): string | null {
    this.formState();
    const control = this.form.controls[field];
    if (!control.invalid || !(control.touched || this.submitted())) return null;
    return errorMessage(control.errors, field);
  }

  protected submit(): void {
    if (this.status() === 'submitting') return;
    this.submitted.set(true);
    this.formError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: InquiryPayload = {
      name: raw.name.trim(),
      email: raw.email.trim(),
      phone: raw.phone.trim(),
      service: raw.service || null,
      location: raw.location.trim(),
      message: raw.message.trim(),
      consent: raw.consent,
      website: raw.website,
    };

    this.status.set('submitting');
    this.form.disable({ emitEvent: false });
    // Re-enable BEFORE applying server errors: enable() re-runs validation and would wipe them.
    const done = () => this.form.enable({ emitEvent: false });
    this.api.submitInquiry(payload).subscribe({
      next: (response) => {
        done();
        this.successMessage.set(response.detail);
        this.status.set('success');
      },
      error: (err: unknown) => {
        done();
        this.status.set('idle');
        this.handleError(err);
      },
    });
  }

  protected reset(): void {
    this.form.reset();
    this.prefill.selectService(null);
    this.submitted.set(false);
    this.formError.set(null);
    this.status.set('idle');
  }

  private handleError(err: unknown): void {
    const phone = this.site.contact.phone;
    if (!(err instanceof HttpErrorResponse)) {
      this.formError.set(`Správu sa nepodarilo odoslať. Skúste to znova alebo zavolajte na ${phone}.`);
      return;
    }
    if (err.status === 400 && err.error && typeof err.error === 'object') {
      const errors = err.error as ApiFieldErrors;
      let mapped = 0;
      for (const field of FIELD_ORDER) {
        const message = errors[field];
        if (message) {
          this.form.controls[field].setErrors({ server: Array.isArray(message) ? message[0] : message });
          this.form.controls[field].markAsTouched();
          mapped++;
        }
      }
      const general = errors.non_field_errors ?? errors.detail;
      this.formError.set(
        general ? String(Array.isArray(general) ? general[0] : general) : mapped ? null : 'Skontrolujte zadané údaje.',
      );
      this.focusFirstInvalid();
      return;
    }
    if (err.status === 429) {
      this.formError.set(`Z vášho zariadenia sme prijali veľa správ za krátky čas. Skúste to neskôr alebo zavolajte na ${phone}.`);
      return;
    }
    this.formError.set(
      err.status === 0
        ? `Nepodarilo sa spojiť so serverom. Skontrolujte pripojenie alebo zavolajte na ${phone}.`
        : `Pri odosielaní nastala chyba na našej strane. Skúste to o chvíľu alebo zavolajte na ${phone}.`,
    );
  }

  private focusFirstInvalid(): void {
    const first = FIELD_ORDER.find((f) => this.form.controls[f].invalid);
    if (!first) return;
    queueMicrotask(() =>
      this.host.nativeElement.querySelector<HTMLElement>(`[formControlName="${first}"]`)?.focus(),
    );
  }
}

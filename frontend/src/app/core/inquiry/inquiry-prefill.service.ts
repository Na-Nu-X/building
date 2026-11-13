import { Injectable, signal } from '@angular/core';

/** Lets other sections (e.g. a service card's "Mám záujem" button) pre-select a service in the contact form. */
@Injectable({ providedIn: 'root' })
export class InquiryPrefillService {
  private readonly _serviceSlug = signal<string | null>(null);
  readonly serviceSlug = this._serviceSlug.asReadonly();

  selectService(slug: string | null): void {
    this._serviceSlug.set(slug);
  }
}

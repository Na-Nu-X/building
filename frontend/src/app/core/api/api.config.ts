import { InjectionToken, inject } from '@angular/core';

/** Base URL of the Django REST API. In development `/api` is proxied to Django. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});

/**
 * Build an API URL, e.g. `apiUrl('/services/')`. Must run in an injection context (field initialiser
 * or constructor) — NOT inside an `httpResource` request function, which is a reactive context.
 */
export function apiUrl(path: string): string {
  return `${inject(API_BASE_URL)}${path}`;
}

import { InjectionToken } from '@angular/core';

/** Base URL of the Django REST API. In development `/api` is proxied to Django. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});

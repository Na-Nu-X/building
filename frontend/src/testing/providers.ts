import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import localeSk from '@angular/common/locales/sk';
import { DEFAULT_CURRENCY_CODE, EnvironmentProviders, LOCALE_ID, Provider } from '@angular/core';

registerLocaleData(localeSk);

/** HTTP testing + Slovak locale, matching the app's runtime configuration. */
export const TEST_PROVIDERS: (Provider | EnvironmentProviders)[] = [
  provideHttpClient(),
  provideHttpClientTesting(),
  { provide: LOCALE_ID, useValue: 'sk' },
  { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' },
];

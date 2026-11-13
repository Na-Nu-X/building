import { httpResource } from '@angular/common/http';
import { Injectable, computed } from '@angular/core';

import { apiUrl } from '../api/api.config';
import { Service } from '../models/api.models';

/**
 * Services are shown in the services section and offered in the contact form,
 * so they are loaded once and shared.
 */
@Injectable({ providedIn: 'root' })
export class ServicesStore {
  private readonly url = apiUrl('/services/');
  readonly resource = httpResource<Service[]>(() => this.url, { defaultValue: [] });

  /** Safe accessor: `resource.value()` throws while the resource is in an error state. */
  readonly list = computed(() => (this.resource.hasValue() ? this.resource.value() : []));
}

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests projects filtered by category', () => {
    api.getProjects({ category: 'interiery' }).subscribe();
    const req = http.expectOne((r) => r.url === '/api/portfolio/projects/');
    expect(req.request.params.get('category')).toBe('interiery');
    req.flush([]);
  });

  it('posts inquiries as JSON', () => {
    api
      .submitInquiry({
        name: 'Ján',
        email: 'jan@example.sk',
        phone: '',
        service: null,
        location: '',
        message: 'Dobrý deň, prosím o ponuku.',
        consent: true,
        website: '',
      })
      .subscribe();
    const req = http.expectOne('/api/inquiries/');
    expect(req.request.method).toBe('POST');
    req.flush({ detail: 'ok' });
  });
});

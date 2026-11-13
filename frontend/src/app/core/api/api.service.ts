import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AboutContent,
  InquiryPayload,
  InquiryResponse,
  Project,
  ProjectCategory,
  Service,
} from '../models/api.models';
import { API_BASE_URL } from './api.config';

/** Thin typed wrapper around the public Django REST API. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services/`);
  }

  getProjectCategories(): Observable<ProjectCategory[]> {
    return this.http.get<ProjectCategory[]>(`${this.baseUrl}/portfolio/categories/`);
  }

  getProjects(filter: { category?: string; featured?: boolean } = {}): Observable<Project[]> {
    let params = new HttpParams();
    if (filter.category) params = params.set('category', filter.category);
    if (filter.featured) params = params.set('featured', '1');
    return this.http.get<Project[]>(`${this.baseUrl}/portfolio/projects/`, { params });
  }

  getProject(slug: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/portfolio/projects/${encodeURIComponent(slug)}/`);
  }

  getAbout(): Observable<AboutContent> {
    return this.http.get<AboutContent>(`${this.baseUrl}/about/`);
  }

  submitInquiry(payload: InquiryPayload): Observable<InquiryResponse> {
    return this.http.post<InquiryResponse>(`${this.baseUrl}/inquiries/`, payload);
  }
}

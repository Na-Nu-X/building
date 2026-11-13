import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { App } from './app';
import { appConfig } from './app.config';
import { SITE_CONFIG } from './site.config';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: appConfig.providers,
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should set the document title from site config', () => {
    TestBed.createComponent(App);
    expect(TestBed.inject(Title).getTitle()).toBe(SITE_CONFIG.seo.title);
  });
});

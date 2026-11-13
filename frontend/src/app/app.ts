import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { SITE_CONFIG } from './site.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly site = SITE_CONFIG;

  constructor() {
    inject(Title).setTitle(SITE_CONFIG.seo.title);
    inject(Meta).updateTag({ name: 'description', content: SITE_CONFIG.seo.description });
  }
}

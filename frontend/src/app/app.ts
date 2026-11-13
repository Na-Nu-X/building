import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

import { SITE_CONFIG } from './site.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly site = SITE_CONFIG;

  constructor() {
    inject(Title).setTitle(SITE_CONFIG.seo.title);
    inject(Meta).updateTag({ name: 'description', content: SITE_CONFIG.seo.description });
  }
}

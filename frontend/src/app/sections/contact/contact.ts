import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';

import { directionsUrl, formatAddress, mailHref, telHref } from '../../core/utils/contact';
import { formatHours, isToday, openStatus } from '../../core/utils/opening-hours';
import { Icon } from '../../shared/icon/icon';
import { Reveal } from '../../shared/reveal/reveal';
import { SectionHeading } from '../../shared/section-heading/section-heading';
import { SiteMap } from '../../shared/site-map/site-map';
import { OpeningHours, SITE_CONFIG } from '../../site.config';
import { InquiryForm } from './inquiry-form';

@Component({
  selector: 'app-contact',
  imports: [Icon, InquiryForm, Reveal, SectionHeading, SiteMap],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  protected readonly site = SITE_CONFIG;
  protected readonly contact = SITE_CONFIG.contact;
  protected readonly phoneHref = telHref(SITE_CONFIG.contact.phone);
  protected readonly emailHref = mailHref(SITE_CONFIG.contact.email, 'Dopyt z webu');
  protected readonly address = formatAddress(SITE_CONFIG.contact.address);
  protected readonly directions = directionsUrl(SITE_CONFIG.map.lat, SITE_CONFIG.map.lng);
  protected readonly formatHours = formatHours;

  /** Re-evaluated every minute so the "open now" badge stays correct on long visits. */
  private readonly now = signal(new Date());
  protected readonly status = computed(() =>
    openStatus(this.contact.openingHours, this.now(), this.contact.timeZone),
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const id = setInterval(() => this.now.set(new Date()), 60_000);
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }

  protected isToday(row: OpeningHours): boolean {
    return isToday(row, this.now(), this.contact.timeZone);
  }
}

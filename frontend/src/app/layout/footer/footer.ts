import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NAV_ITEMS, TOP_ID } from '../../core/layout/navigation';
import { formatAddress, mailHref, telHref } from '../../core/utils/contact';
import { Icon } from '../../shared/icon/icon';
import { Logo } from '../../shared/logo/logo';
import { SITE_CONFIG } from '../../site.config';

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

@Component({
  selector: 'app-footer',
  imports: [Icon, Logo],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly site = SITE_CONFIG;
  protected readonly navItems = NAV_ITEMS;
  protected readonly topId = TOP_ID;
  protected readonly year = new Date().getFullYear();
  protected readonly phoneHref = telHref(SITE_CONFIG.contact.phone);
  protected readonly emailHref = mailHref(SITE_CONFIG.contact.email);
  protected readonly address = formatAddress(SITE_CONFIG.contact.address);
  protected readonly socialLabels = SOCIAL_LABELS;
}

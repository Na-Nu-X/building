import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { InquiryPrefillService } from '../../core/inquiry/inquiry-prefill.service';
import { CONTACT_SECTION_ID } from '../../core/layout/navigation';
import { ServicesStore } from '../../core/services/services.store';
import { Service } from '../../core/models/api.models';
import { padIndex, priceUnitLabel } from '../../core/utils/format';
import { Icon } from '../../shared/icon/icon';
import { IconName } from '../../shared/icon/icons';
import { Reveal } from '../../shared/reveal/reveal';
import { SectionHeading } from '../../shared/section-heading/section-heading';

interface ProcessStep {
  readonly icon: IconName;
  readonly title: string;
  readonly text: string;
}

const PROCESS: readonly ProcessStep[] = [
  { icon: 'map-pin', title: 'Obhliadka', text: 'Bezplatne prídeme, zameriame a prejdeme vaše predstavy.' },
  { icon: 'receipt', title: 'Rozpočet', text: 'Do 5 pracovných dní dostanete položkový rozpočet a harmonogram.' },
  { icon: 'hard-hat', title: 'Realizácia', text: 'Pracujeme podľa zmluvy, s pravidelným reportom o postupe.' },
  { icon: 'check', title: 'Odovzdanie', text: 'Preberací protokol, upratané stavenisko a záruka 5 rokov.' },
];

@Component({
  selector: 'app-services',
  imports: [CurrencyPipe, Icon, Reveal, SectionHeading],
  templateUrl: './services.html',
  styleUrl: './services.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Services {
  private readonly prefill = inject(InquiryPrefillService);

  protected readonly services = inject(ServicesStore).resource;
  protected readonly process = PROCESS;
  protected readonly contactHref = `#${CONTACT_SECTION_ID}`;
  protected readonly skeletons = [1, 2, 3, 4, 5, 6];
  protected readonly padIndex = padIndex;
  protected readonly unitLabel = priceUnitLabel;

  protected requestQuote(service: Service): void {
    this.prefill.selectService(service.slug);
  }
}

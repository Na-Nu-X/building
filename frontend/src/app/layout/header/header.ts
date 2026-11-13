import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { ActiveSectionService } from '../../core/layout/active-section.service';
import { CONTACT_SECTION_ID, NAV_ITEMS, TOP_ID } from '../../core/layout/navigation';
import { telHref } from '../../core/utils/contact';
import { Icon } from '../../shared/icon/icon';
import { Logo } from '../../shared/logo/logo';
import { SITE_CONFIG } from '../../site.config';

const SCROLL_THRESHOLD = 24;
const DESKTOP_QUERY = '(min-width: 1024px)';

@Component({
  selector: 'app-header',
  imports: [Icon, Logo],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeMenu(true)',
  },
})
export class Header {
  private readonly document = inject(DOCUMENT);
  private readonly activeSection = inject(ActiveSectionService);

  protected readonly site = SITE_CONFIG;
  protected readonly navItems = NAV_ITEMS;
  protected readonly contactId = CONTACT_SECTION_ID;
  protected readonly topId = TOP_ID;
  protected readonly phoneHref = telHref(SITE_CONFIG.contact.phone);

  protected readonly active = this.activeSection.active;
  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);

  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');
  private readonly firstMenuLink = viewChild<ElementRef<HTMLAnchorElement>>('firstMenuLink');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const win = this.document.defaultView!;
      const onScroll = () => this.scrolled.set(win.scrollY > SCROLL_THRESHOLD);
      onScroll();
      win.addEventListener('scroll', onScroll, { passive: true });

      // Close the mobile menu if the viewport grows to desktop width.
      const desktop = win.matchMedia(DESKTOP_QUERY);
      const onBreakpoint = (e: MediaQueryListEvent) => e.matches && this.closeMenu();
      desktop.addEventListener('change', onBreakpoint);

      this.activeSection.observe(this.navItems.map((item) => item.id));

      destroyRef.onDestroy(() => {
        win.removeEventListener('scroll', onScroll);
        desktop.removeEventListener('change', onBreakpoint);
      });
    });

    // Lock page scroll and move focus into the menu while it is open.
    effect(() => {
      const open = this.menuOpen();
      this.document.documentElement.classList.toggle('is-scroll-locked', open);
      if (open) queueMicrotask(() => this.firstMenuLink()?.nativeElement.focus());
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(restoreFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (restoreFocus) this.toggleButton().nativeElement.focus();
  }
}

import { DOCUMENT, DatePipe, DecimalPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { ApplicationRef, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { apiUrl } from '../../core/api/api.config';
import { Project, ProjectCategory } from '../../core/models/api.models';
import { Icon } from '../../shared/icon/icon';
import { Lightbox, LightboxImage } from '../../shared/lightbox/lightbox';
import { Reveal } from '../../shared/reveal/reveal';
import { SectionHeading } from '../../shared/section-heading/section-heading';

export const ALL = 'all';
/** Feature tile (2×2) + 5 tiles fills exactly three rows of the 3-column grid. */
export const PAGE_SIZE = 6;

type ViewTransitionDocument = Document & { startViewTransition?: (cb: () => void) => unknown };

export function toLightboxImages(project: Project): LightboxImage[] {
  return project.images.map((img, i) => ({
    src: img.large,
    thumb: img.thumbnail,
    alt: img.alt || `${project.title} – fotografia ${i + 1}`,
    caption: img.caption,
    width: img.width,
    height: img.height,
  }));
}

@Component({
  selector: 'app-portfolio',
  imports: [DatePipe, DecimalPipe, Icon, Lightbox, Reveal, SectionHeading],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Portfolio {
  private readonly document = inject(DOCUMENT) as ViewTransitionDocument;
  private readonly appRef = inject(ApplicationRef);

  private readonly projectsUrl = apiUrl('/portfolio/projects/');
  private readonly categoriesUrl = apiUrl('/portfolio/categories/');
  protected readonly projects = httpResource<Project[]>(() => this.projectsUrl, { defaultValue: [] });
  protected readonly categories = httpResource<ProjectCategory[]>(() => this.categoriesUrl, { defaultValue: [] });

  protected readonly ALL = ALL;
  protected readonly filter = signal<string>(ALL);
  protected readonly limit = signal(PAGE_SIZE);
  protected readonly skeletons = [1, 2, 3, 4, 5];

  /** `resource.value()` throws while in an error state, so read through these guards. */
  protected readonly projectList = computed(() => (this.projects.hasValue() ? this.projects.value() : []));
  protected readonly categoryList = computed(() => (this.categories.hasValue() ? this.categories.value() : []));

  protected readonly totalCount = computed(() => this.projectList().length);
  protected readonly filtered = computed(() => {
    const filter = this.filter();
    const projects = this.projectList();
    return filter === ALL ? projects : projects.filter((p) => p.category.slug === filter);
  });
  protected readonly visible = computed(() => this.filtered().slice(0, this.limit()));
  protected readonly remaining = computed(() => this.filtered().length - this.visible().length);

  /** Project open in the lightbox, plus the starting photo index. */
  protected readonly openProject = signal<Project | null>(null);
  protected readonly openIndex = signal(0);
  protected readonly lightboxImages = computed(() => {
    const project = this.openProject();
    return project ? toLightboxImages(project) : [];
  });
  private returnFocusTo: HTMLElement | null = null;

  protected setFilter(slug: string): void {
    if (slug === this.filter()) return;
    this.withTransition(() => {
      this.filter.set(slug);
      this.limit.set(PAGE_SIZE);
    });
  }

  protected showMore(): void {
    this.limit.update((n) => n + PAGE_SIZE);
  }

  protected open(project: Project, event: Event): void {
    if (!project.images.length) return;
    this.returnFocusTo = event.currentTarget as HTMLElement;
    const coverIndex = project.images.findIndex((img) => img.is_cover);
    this.openIndex.set(Math.max(0, coverIndex));
    this.openProject.set(project);
  }

  protected onLightboxClosed(): void {
    this.openProject.set(null);
    this.returnFocusTo?.focus();
    this.returnFocusTo = null;
  }

  protected projectMeta(project: Project): string {
    return [project.category.name, project.location].filter(Boolean).join(' · ');
  }

  /** Animate DOM changes with the View Transitions API when available. */
  private withTransition(update: () => void): void {
    const reduced = this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!this.document.startViewTransition || reduced) {
      update();
      return;
    }
    this.document.startViewTransition(() => {
      update();
      this.appRef.tick();
    });
  }
}

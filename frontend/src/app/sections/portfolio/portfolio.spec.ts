import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EXTERIORS, INTERIORS, makeProject } from '../../../testing/fixtures';
import { TEST_PROVIDERS } from '../../../testing/providers';
import { PAGE_SIZE, Portfolio, toLightboxImages } from './portfolio';

describe('Portfolio section', () => {
  let fixture: ComponentFixture<Portfolio>;
  let http: HttpTestingController;
  const el = () => fixture.nativeElement as HTMLElement;
  const tiles = () => [...el().querySelectorAll('.tile:not(.tile--skeleton)')];

  async function load(interiorCount: number, exteriorCount: number) {
    const projects = [
      ...Array.from({ length: interiorCount }, (_, i) => makeProject(i + 1, INTERIORS)),
      ...Array.from({ length: exteriorCount }, (_, i) => makeProject(100 + i, EXTERIORS)),
    ];
    http.expectOne('/api/portfolio/projects/').flush(projects);
    http.expectOne('/api/portfolio/categories/').flush([
      { ...INTERIORS, project_count: interiorCount },
      { ...EXTERIORS, project_count: exteriorCount },
    ]);
    await fixture.whenStable();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: TEST_PROVIDERS });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Portfolio);
    // Render and let httpResource issue its requests (whenStable would wait for open requests).
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    document.documentElement.classList.remove('is-scroll-locked');
  });

  it('renders project tiles with Slovak date and number formatting', async () => {
    await load(1, 0);
    const text = tiles()[0]!.textContent!.replace(/\s+/g, ' ');
    expect(text).toContain('Projekt 1');
    expect(text).toContain('jún 2026');
    expect(text).toContain('1 250 m²');
  });

  it('filters by category and reflects the pressed state', async () => {
    await load(2, 1);
    expect(tiles().length).toBe(3);

    const exteriorsButton = [...el().querySelectorAll<HTMLButtonElement>('.filter')].find((b) =>
      b.textContent!.includes('Exteriéry'),
    )!;
    exteriorsButton.click();
    await fixture.whenStable();

    expect(tiles().length).toBe(1);
    expect(exteriorsButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('pages results with "show more"', async () => {
    await load(PAGE_SIZE + 2, 0);
    expect(tiles().length).toBe(PAGE_SIZE);

    const more = el().querySelector<HTMLButtonElement>('.portfolio__more button')!;
    expect(more.textContent).toContain('2');
    more.click();
    await fixture.whenStable();
    expect(tiles().length).toBe(PAGE_SIZE + 2);
    expect(el().querySelector('.portfolio__more')).toBeNull();
  });

  it('opens the project gallery in the lightbox and closes it again', async () => {
    await load(1, 0);
    el().querySelector<HTMLButtonElement>('.tile__open')!.click();
    await fixture.whenStable();

    const lightbox = el().querySelector('app-lightbox');
    expect(lightbox).not.toBeNull();
    expect(lightbox!.querySelector('.lightbox__title')?.textContent).toContain('Projekt 1');

    lightbox!.querySelector<HTMLButtonElement>('.lightbox__close')!.click();
    await fixture.whenStable();
    expect(el().querySelector('app-lightbox')).toBeNull();
  });

  it('keeps the rest of the section usable when the API fails', async () => {
    http.expectOne('/api/portfolio/projects/').flush('x', { status: 500, statusText: 'Error' });
    http.expectOne('/api/portfolio/categories/').flush('x', { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(el().querySelector('h2')?.textContent).toContain('projekty');
    expect(el().querySelector('[role="alert"]')).not.toBeNull();
  });
});

describe('toLightboxImages', () => {
  it('maps API images to lightbox images with alt fallbacks', () => {
    const project = makeProject(1, INTERIORS, 2);
    const images = toLightboxImages({ ...project, images: [{ ...project.images[0]!, alt: '' }] });
    expect(images[0]).toMatchObject({ src: '/media/large/100.webp', thumb: '/media/thumb/100.webp' });
    expect(images[0]!.alt).toBe('Projekt 1 – fotografia 1');
  });
});

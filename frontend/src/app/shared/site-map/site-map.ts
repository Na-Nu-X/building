import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { Map as LeafletMap } from 'leaflet';

import { MapTiles, OSM_DARK_TILES } from '../../site.config';
import { Icon } from '../icon/icon';

type MapState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Dark Leaflet map. Tiles come from `tiles` (default: OpenStreetMap darkened via CSS, no API key).
 * Leaflet itself is lazy-loaded when the map scrolls near the viewport.
 */
@Component({
  selector: 'app-site-map',
  imports: [Icon],
  templateUrl: './site-map.html',
  styleUrl: './site-map.scss',
  // Leaflet renders its own DOM, so its CSS (and our overrides) must be global.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteMap {
  readonly lat = input.required<number>();
  readonly lng = input.required<number>();
  readonly zoom = input(14);
  readonly label = input('');
  readonly address = input('');
  readonly tiles = input<MapTiles>(OSM_DARK_TILES);

  private readonly document = inject(DOCUMENT);

  protected readonly state = signal<MapState>('idle');
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('map');
  private map?: LeafletMap;

  constructor() {
    const win = this.document.defaultView;
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.map?.remove());

    afterNextRender(() => {
      if (!win) return;
      if (!('IntersectionObserver' in win)) {
        void this.init();
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            observer.disconnect();
            void this.init();
          }
        },
        { rootMargin: '300px' },
      );
      observer.observe(this.container().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private async init(): Promise<void> {
    this.state.set('loading');
    try {
      const [leaflet] = await Promise.all([import('leaflet'), this.loadStylesheet('leaflet.css')]);
      const L = (leaflet as unknown as { default?: typeof leaflet }).default ?? leaflet;
      const center: [number, number] = [this.lat(), this.lng()];

      const map = L.map(this.container().nativeElement, {
        center,
        zoom: this.zoom(),
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: true,
      });
      L.control.zoom({ position: 'bottomright', zoomInTitle: 'Priblížiť', zoomOutTitle: 'Oddialiť' }).addTo(map);
      map.attributionControl.setPrefix(false);

      const config = this.tiles();
      const tiles = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: 19,
        ...(config.subdomains ? { subdomains: config.subdomains } : {}),
      });
      tiles.once('tileerror', () => this.state() !== 'ready' && this.state.set('error'));
      tiles.once('load', () => this.state.set('ready'));
      tiles.addTo(map);

      const icon = L.divIcon({
        className: 'site-map__marker',
        html: '<span class="site-map__pin"></span><span class="site-map__pulse"></span>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });
      const popup = `<strong>${escapeHtml(this.label())}</strong><br>${escapeHtml(this.address())}`;
      L.marker(center, { icon, title: this.label(), alt: this.label(), keyboard: true })
        .addTo(map)
        .bindPopup(popup);

      // Enable wheel zoom only after the user deliberately interacts with the map.
      map.once('click focus', () => map.scrollWheelZoom.enable());
      this.map = map;
    } catch {
      this.state.set('error');
    }
  }

  /** Attach a stylesheet once and resolve when it has loaded (or failed – the map still works unstyled). */
  private loadStylesheet(href: string): Promise<void> {
    const existing = this.document.querySelector(`link[data-href="${href}"]`);
    if (existing) return Promise.resolve();
    return new Promise((resolve) => {
      const link = this.document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset['href'] = href;
      link.onload = link.onerror = () => resolve();
      this.document.head.appendChild(link);
    });
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

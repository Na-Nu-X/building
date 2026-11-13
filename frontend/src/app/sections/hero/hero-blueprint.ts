import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Decorative architectural line drawing (house elevation with dimension lines),
 * used when no hero photo is configured. Purely presentational.
 */
@Component({
  selector: 'app-hero-blueprint',
  template: `
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMaxYMax meet" fill="none" aria-hidden="true">
      <g class="bp-structure" stroke-width="1.5">
        <!-- ground -->
        <path d="M40 470H780" />
        <path d="M60 470v14M120 470v14M180 470v14M240 470v14M300 470v14M360 470v14M420 470v14M480 470v14M540 470v14M600 470v14M660 470v14M720 470v14" stroke-width="1" />
        <!-- main house -->
        <path d="M160 470V270L370 130L580 270V470" />
        <path d="M130 290L370 128L610 290" />
        <path d="M480 195V135h44v90" />
        <!-- garage wing -->
        <path d="M580 470V330H730V470" />
        <path d="M570 336L730 312" />
        <path d="M605 470V380H705V470M605 400H705M605 420H705M605 440H705" stroke-width="1" />
        <!-- windows -->
        <path d="M205 320h90v70h-90zM250 320v70M205 355h90" stroke-width="1" />
        <path d="M445 320h90v70h-90zM490 320v70M445 355h90" stroke-width="1" />
        <path d="M335 230h70v50h-70zM370 230v50" stroke-width="1" />
        <!-- door -->
        <path d="M345 470V370h50v100M385 422h-6" stroke-width="1" />
      </g>
      <g class="bp-accent" stroke-width="1.25">
        <!-- dimension lines -->
        <path d="M160 520H580M160 512v16M580 512v16" />
        <path d="M110 470V270M102 470h16M102 270h16" />
        <path d="M600 470V330" stroke-dasharray="4 6" />
        <circle cx="370" cy="130" r="5" />
      </g>
      <g class="bp-text">
        <text x="370" y="546" text-anchor="middle">12 400</text>
        <text x="96" y="374" text-anchor="middle" transform="rotate(-90 96 374)">6 200</text>
        <text x="740" y="492" text-anchor="end">±0,000</text>
      </g>
    </svg>
  `,
  styles: `
    :host {
      display: block;
    }
    svg {
      width: 100%;
      height: 100%;
    }
    .bp-structure {
      stroke: rgb(255 255 255 / 0.22);
    }
    .bp-accent {
      stroke: rgb(249 115 22 / 0.65);
    }
    .bp-text {
      fill: rgb(249 115 22 / 0.8);
      font: 600 13px var(--font-display);
      letter-spacing: 0.1em;
    }
    .bp-structure path,
    .bp-accent path {
      stroke-dasharray: 1400;
      stroke-dashoffset: 1400;
      animation: draw 2.4s var(--ease-out) forwards;
    }
    .bp-accent path {
      animation-delay: 0.9s;
    }
    .bp-accent path[stroke-dasharray] {
      animation: none;
      stroke-dashoffset: 0;
    }
    @keyframes draw {
      to {
        stroke-dashoffset: 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBlueprint {}

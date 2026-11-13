import { TestBed } from '@angular/core/testing';

import { Icon } from './icon';
import { ICONS } from './icons';

describe('Icon', () => {
  function render(inputs: Record<string, unknown>): HTMLElement {
    const fixture = TestBed.createComponent(Icon);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders all paths of the named icon and is hidden from assistive tech by default', () => {
    const el = render({ name: 'tiles' });
    expect(el.querySelectorAll('path').length).toBe(ICONS.tiles.length);
    expect(el.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('exposes an accessible label when provided', () => {
    const svg = render({ name: 'phone', label: 'Telefón' }).querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Telefón');
    expect(svg?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('falls back to a default icon for unknown names', () => {
    const el = render({ name: 'neexistuje' });
    expect(el.querySelectorAll('path').length).toBe(ICONS.hammer.length);
  });
});

import { OpeningHours } from '../../site.config';
import { formatHours, isToday, openStatus, zonedNow } from './opening-hours';

const SCHEDULE: OpeningHours[] = [
  { label: 'Po – Pi', days: [1, 2, 3, 4, 5], open: '07:00', close: '17:00' },
  { label: 'Sobota', days: [6], open: '08:00', close: '12:00' },
  { label: 'Nedeľa', days: [7], open: null, close: null },
];
const TZ = 'Europe/Bratislava';
// 2026-11-16 is a Monday. Bratislava is UTC+1 in November.
const at = (iso: string) => new Date(iso);

describe('opening hours', () => {
  it('formats rows', () => {
    expect(formatHours(SCHEDULE[0]!)).toBe('7:00 – 17:00');
    expect(formatHours(SCHEDULE[2]!)).toBe('Zatvorené');
  });

  it('resolves weekday and time in the company time zone, not the browser one', () => {
    expect(zonedNow(at('2026-11-15T23:30:00Z'), TZ)).toEqual({ day: 1, time: '00:30' });
  });

  it('reports open with closing time', () => {
    expect(openStatus(SCHEDULE, at('2026-11-16T09:00:00Z'), TZ)).toEqual({ open: true, text: 'Otvorené do 17:00' });
  });

  it('reports opening later today', () => {
    expect(openStatus(SCHEDULE, at('2026-11-16T05:00:00Z'), TZ).text).toBe('Otvárame dnes o 7:00');
  });

  it('reports the next opening day after closing, skipping closed days', () => {
    expect(openStatus(SCHEDULE, at('2026-11-16T17:30:00Z'), TZ).text).toBe('Otvárame zajtra o 7:00');
    // Saturday afternoon → Sunday closed → Monday.
    expect(openStatus(SCHEDULE, at('2026-11-21T14:00:00Z'), TZ).text).toBe('Otvárame v pondelok o 7:00');
  });

  it('treats closing time as closed', () => {
    expect(openStatus(SCHEDULE, at('2026-11-16T16:00:00Z'), TZ).open).toBe(false);
  });

  it('detects today’s row', () => {
    expect(isToday(SCHEDULE[1]!, at('2026-11-21T10:00:00Z'), TZ)).toBe(true);
    expect(isToday(SCHEDULE[0]!, at('2026-11-21T10:00:00Z'), TZ)).toBe(false);
  });
});

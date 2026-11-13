import { OpeningHours, Weekday } from '../../site.config';

export interface OpenStatus {
  readonly open: boolean;
  /** Human-readable status, e.g. "Otvorené do 17:00" / "Otvárame v pondelok o 7:00". */
  readonly text: string;
}

const DAY_NAMES_LOCATIVE: Record<Weekday, string> = {
  1: 'v pondelok',
  2: 'v utorok',
  3: 'v stredu',
  4: 'vo štvrtok',
  5: 'v piatok',
  6: 'v sobotu',
  7: 'v nedeľu',
};

/** "07:00" → "7:00" (Slovak style without a leading zero). */
export function formatTime(time: string): string {
  return time.replace(/^0(\d)/, '$1');
}

export function formatHours(row: OpeningHours): string {
  return row.open && row.close ? `${formatTime(row.open)} – ${formatTime(row.close)}` : 'Zatvorené';
}

/** Current weekday and "HH:MM" in the given IANA time zone. */
export function zonedNow(date: Date, timeZone: string): { day: Weekday; time: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return { day: (days.indexOf(get('weekday')) + 1) as Weekday, time: `${get('hour')}:${get('minute')}` };
}

function hoursFor(schedule: readonly OpeningHours[], day: Weekday): OpeningHours | undefined {
  return schedule.find((row) => row.days.includes(day) && row.open && row.close);
}

export function openStatus(schedule: readonly OpeningHours[], date: Date, timeZone: string): OpenStatus {
  const { day, time } = zonedNow(date, timeZone);
  const today = hoursFor(schedule, day);

  if (today && time >= today.open! && time < today.close!) {
    return { open: true, text: `Otvorené do ${formatTime(today.close!)}` };
  }
  if (today && time < today.open!) {
    return { open: false, text: `Otvárame dnes o ${formatTime(today.open!)}` };
  }
  for (let offset = 1; offset <= 7; offset++) {
    const next = (((day - 1 + offset) % 7) + 1) as Weekday;
    const row = hoursFor(schedule, next);
    if (row) {
      const when = offset === 1 ? 'zajtra' : DAY_NAMES_LOCATIVE[next];
      return { open: false, text: `Otvárame ${when} o ${formatTime(row.open!)}` };
    }
  }
  return { open: false, text: 'Momentálne zatvorené' };
}

/** Whether a schedule row covers "today" (for highlighting in the table). */
export function isToday(row: OpeningHours, date: Date, timeZone: string): boolean {
  return row.days.includes(zonedNow(date, timeZone).day);
}

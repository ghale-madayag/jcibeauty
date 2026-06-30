/**
 * Appointment availability engine (pure functions).
 *
 * Times-of-day are expressed as minutes from midnight (0..1440). Concrete
 * appointment ranges are real Date objects so overlap checks respect the day.
 */

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface SlotOptions {
  /** Calendar day to compute slots for (any time on that local day). */
  day: Date;
  /** Staff weekly availability windows that fall on this weekday. */
  staffWindows: { startMin: number; endMin: number }[];
  /** Global business hours for this weekday. */
  business: { openMin: number; closeMin: number; isClosed: boolean };
  /** Existing appointments + staff time off that block availability. */
  busy: TimeRange[];
  /** Service duration in minutes. */
  durationMin: number;
  /** Buffer kept clear before/after each appointment. */
  bufferMin?: number;
  /** Granularity of candidate start times. Defaults to 30 minutes. */
  stepMin?: number;
  /** Reference "now" — slots in the past are excluded. */
  now?: Date;
}

function atMinutes(day: Date, minutes: number): Date {
  const d = new Date(day);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutes);
  return d;
}

function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Returns available appointment start times (as ISO strings) for a day.
 */
export function generateSlots(options: SlotOptions): string[] {
  const {
    day,
    staffWindows,
    business,
    busy,
    durationMin,
    bufferMin = 0,
    stepMin = 30,
    now = new Date(),
  } = options;

  if (business.isClosed || staffWindows.length === 0) return [];

  const slots: string[] = [];

  for (const win of staffWindows) {
    // Intersect staff window with business hours.
    const windowStart = Math.max(win.startMin, business.openMin);
    const windowEnd = Math.min(win.endMin, business.closeMin);
    if (windowEnd - windowStart < durationMin) continue;

    for (
      let startMin = windowStart;
      startMin + durationMin <= windowEnd;
      startMin += stepMin
    ) {
      const slotStart = atMinutes(day, startMin);
      const slotEnd = atMinutes(day, startMin + durationMin);

      if (slotStart < now) continue;

      // Apply buffer when checking against existing commitments.
      const guarded: TimeRange = {
        start: new Date(slotStart.getTime() - bufferMin * 60_000),
        end: new Date(slotEnd.getTime() + bufferMin * 60_000),
      };

      const blocked = busy.some((b) => overlaps(guarded, b));
      if (!blocked) slots.push(slotStart.toISOString());
    }
  }

  // De-duplicate (overlapping staff windows) and sort chronologically.
  return Array.from(new Set(slots)).sort();
}

/** Convert "HH:mm" to minutes from midnight. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Convert minutes from midnight to "HH:mm". */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

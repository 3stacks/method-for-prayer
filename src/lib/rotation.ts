// The daily rule of the guided prayer. This file has no React Native code, so
// `node --test` can test it.

/** The day that the rotation counts from. */
const EPOCH = Date.UTC(2026, 0, 1)

/** The number of the day of a local date, from 1 January 2026. */
export function dayNumber(date: Date): number {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor((local - EPOCH) / 86400000)
}

/** The longest time, in days, that one turn through a part takes. */
export const MAX_DAYS = 30

/**
 * How many heads of a part to show each day. It is the number in Settings, but
 * never fewer than the number that gets through the part in MAX_DAYS days.
 */
export function headsPerDay(total: number, setting: number): number {
  return Math.min(total, Math.max(setting, Math.ceil(total / MAX_DAYS)))
}

/** The days that one turn through a part takes. */
export function cycleDays(total: number, setting: number): number {
  return total ? Math.ceil(total / headsPerDay(total, setting)) : 0
}

/**
 * The indexes of the heads for a day. Day after day, the heads come in the
 * order of the book. After the last head, the part starts again.
 */
export function headsForDay(total: number, setting: number, day: number): number[] {
  if (!total) return []
  const per = headsPerDay(total, setting)
  const cycle = cycleDays(total, setting)
  const turn = ((day % cycle) + cycle) % cycle
  const out: number[] = []
  for (let i = 0; i < per; i++) out.push((turn * per + i) % total)
  return [...new Set(out)]
}

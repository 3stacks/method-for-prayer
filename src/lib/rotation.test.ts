// Run: node --test src/lib/
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { cycleDays, dayNumber, headsForDay, headsPerDay, MAX_DAYS } from './rotation.ts'

test('days count from 1 January 2026, in local time', () => {
  assert.equal(dayNumber(new Date(2026, 0, 1, 23, 59)), 0)
  assert.equal(dayNumber(new Date(2026, 0, 2, 0, 1)), 1)
  assert.equal(dayNumber(new Date(2027, 0, 1)), 365)
})

test('each part takes at most 30 days', () => {
  for (const total of [6, 10, 41, 62, 77]) {
    for (const setting of [1, 2, 3, 4]) {
      assert.ok(cycleDays(total, setting) <= MAX_DAYS, `${total} ${setting}`)
      const seen = new Set<number>()
      for (let d = 0; d < cycleDays(total, setting); d++) for (const h of headsForDay(total, setting, d)) seen.add(h)
      assert.equal(seen.size, total)
    }
  }
})

test('the setting gives the heads each day, unless the part is long', () => {
  assert.equal(headsPerDay(41, 2), 2)
  assert.equal(headsPerDay(77, 2), 3)
  assert.equal(headsPerDay(5, 4), 4)
  assert.deepEqual(headsForDay(10, 2, 0), [0, 1])
  assert.deepEqual(headsForDay(10, 2, 1), [2, 3])
  assert.deepEqual(headsForDay(10, 2, 5), [0, 1])
  assert.deepEqual(headsForDay(10, 2, -1), [8, 9])
  assert.deepEqual(headsForDay(0, 2, 3), [])
})

// Run: node --test src/lib/siblingOf.test.ts
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { APPS, appLink, siblingOf } from './appLink.ts'

test('siblingOf gives the scheme of the sibling app that a link opens', () => {
  assert.equal(siblingOf('https://hearers.app/app/#/add/Ps.23', 'methodforprayer'), 'hearers')
  assert.equal(siblingOf('https://precentor.app/psalm/023?tune=dundee', 'methodforprayer'), 'precentor')
  assert.equal(siblingOf('https://haddingtonbible.org/psalms-23#v23-1', 'methodforprayer'), 'haddingtonbible')
  assert.equal(siblingOf('https://covenanthousehold.app/', 'methodforprayer'), 'covenanthousehold')
  assert.equal(siblingOf('https://methodforprayer.app/app/head/adoration-3', 'hearers'), 'methodforprayer')
})

test('siblingOf uses the same rules as appLink', () => {
  assert.equal(siblingOf('https://precentor.app/privacy/', 'methodforprayer'), undefined)
  assert.equal(siblingOf('https://example.com/psalm/023', 'methodforprayer'), undefined)
  assert.equal(siblingOf('https://methodforprayer.app/app/pray', 'methodforprayer'), undefined)
  for (const url of ['https://hearers.app/', 'https://precentor.app/psalm/100', 'https://example.com/']) {
    assert.equal(siblingOf(url, 'methodforprayer'), appLink(url, 'methodforprayer')?.split('://')[0])
  }
})

test('APPS gives the App Store page of each app that is on the App Store', () => {
  assert.deepEqual(APPS, {
    hearers: { name: 'Hearers', appStore: 'https://apps.apple.com/app/id6834307677' },
    precentor: { name: 'Precentor', appStore: 'https://apps.apple.com/app/id6834265380' },
    haddingtonbible: { name: 'Haddington Bible' },
    covenanthousehold: { name: 'Covenant Household', appStore: 'https://apps.apple.com/app/id6834362234' },
    methodforprayer: { name: 'A Method for Prayer' },
  })
})

test('each app that a link can open has an entry in APPS', () => {
  for (const url of ['https://hearers.app/', 'https://precentor.app/', 'https://haddingtonbible.org/', 'https://covenanthousehold.app/', 'https://methodforprayer.app/']) {
    const scheme = siblingOf(url, 'none')
    assert.ok(scheme && APPS[scheme], url)
  }
})

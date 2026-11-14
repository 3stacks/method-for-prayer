// Run: node --test src/lib/appLink.test.ts
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { appLink } from './appLink.ts'

test('a link into the web app of A Method for Prayer opens the app at the same screen', () => {
  assert.equal(appLink('https://methodforprayer.app/app/head/adoration-3', 'hearers'), 'methodforprayer://head/adoration-3')
  assert.equal(appLink('https://methodforprayer.app/app/book/confession', 'hearers'), 'methodforprayer://book/confession')
  assert.equal(appLink('https://methodforprayer.app/app/pray?step=2', 'hearers'), 'methodforprayer://pray?step=2')
  assert.equal(appLink('https://methodforprayer.app/app/', 'hearers'), 'methodforprayer://')
  assert.equal(appLink('https://methodforprayer.app/app', 'hearers'), 'methodforprayer://')
})

test('the homepage and the privacy page stay web links', () => {
  assert.equal(appLink('https://methodforprayer.app/privacy/', 'hearers'), undefined)
  assert.equal(appLink('https://methodforprayer.app/app/privacy', 'hearers'), undefined)
})

test('the homepage opens the app, as the homepage of each sibling does', () => {
  assert.equal(appLink('https://methodforprayer.app/', 'hearers'), 'methodforprayer://')
})

test('an app does not open itself', () => {
  assert.equal(appLink('https://methodforprayer.app/app/pray', 'methodforprayer'), undefined)
})

test('the web app of Hearers is at /app/ too', () => {
  assert.equal(appLink('https://hearers.app/app/#/add/Ps.23', 'methodforprayer'), 'hearers://add/Ps.23')
})

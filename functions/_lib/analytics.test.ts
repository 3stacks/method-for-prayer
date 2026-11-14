// Run: node --test functions/_lib/
import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { bootSource, countedHost, forwardingOrigin, handleAnalytics, stampCollectBody, websiteId } from './analytics.ts'

const WEBSITE = 'b59e9c65-ae32-47f1-8400-119fcf4861c4'
const OTHER = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
const ENV = { ANALYTICS_FORWARDING_URL: 'https://umami.example/ignored', ANALYTICS_WEBSITE_ID: WEBSITE.toUpperCase() }
const req = (url: string, init?: RequestInit) => new Request(url, init)
const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

test('reads the Umami origin and the website id', () => {
  assert.equal(forwardingOrigin(' https://umami.example/script.js?x=1 '), 'https://umami.example')
  assert.equal(forwardingOrigin('https://user:pass@umami.example'), null)
  assert.equal(forwardingOrigin('ftp://umami.example'), null)
  assert.equal(websiteId('methodforprayer.app'), null)
  assert.equal(websiteId(WEBSITE.toUpperCase()), WEBSITE)
})

test('counts production and the extra hosts only', () => {
  assert.equal(countedHost('methodforprayer.app', {}), true)
  assert.equal(countedHost('methodforprayer-app.pages.dev', {}), true)
  assert.equal(countedHost('feat-x.methodforprayer-app.pages.dev', {}), false)
  assert.equal(countedHost('localhost', {}), false)
  assert.equal(countedHost('www.example.org', { ANALYTICS_HOSTS: 'example.org, WWW.example.org' }), true)
})

test('puts our id on an event, and refuses an event for another website', () => {
  const ok = stampCollectBody(JSON.stringify({ type: 'event', payload: { website: 'x', url: '/' } }), WEBSITE)
  assert.ok(ok.ok)
  assert.equal(JSON.parse(ok.body).payload.website, WEBSITE)
  assert.deepEqual(stampCollectBody(JSON.stringify({ payload: { website: OTHER } }), WEBSITE), { ok: false, status: 400 })
  assert.deepEqual(stampCollectBody('not json', WEBSITE), { ok: false, status: 400 })
  assert.deepEqual(stampCollectBody('x'.repeat(10_001), WEBSITE), { ok: false, status: 413 })
})

test('gives an empty boot.js on a preview, and the loader on production', async () => {
  const preview = await handleAnalytics(req('https://feat-x.methodforprayer-app.pages.dev/a/boot.js'), ENV)
  assert.equal(await preview.text(), '/* analytics off */\n')
  const off = await handleAnalytics(req('https://methodforprayer.app/a/boot.js'), {})
  assert.equal(await off.text(), '/* analytics off: ANALYTICS_FORWARDING_URL is empty; ANALYTICS_WEBSITE_ID is empty */\n')
  const on = await handleAnalytics(req('https://methodforprayer.app/a/boot.js'), ENV)
  assert.equal(await on.text(), bootSource(WEBSITE))
  assert.equal(on.headers.get('cache-control'), 'no-store')
})

test('forwards an event to Umami with the visitor IP, and never follows a redirect', async () => {
  const calls: [string, RequestInit][] = []
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push([url, init])
    return new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch
  const r = await handleAnalytics(
    req('https://methodforprayer.app/a/api/send', {
      method: 'POST',
      body: JSON.stringify({ type: 'event', payload: { url: '/' } }),
      headers: { 'cf-connecting-ip': '203.0.113.9' },
    }),
    ENV,
  )
  assert.equal(r.status, 200)
  const [url, init] = calls[0]
  assert.equal(url, 'https://umami.example/api/send')
  assert.equal(init.redirect, 'manual')
  assert.equal(new Headers(init.headers).get('x-real-ip'), '203.0.113.9')
  assert.equal(JSON.parse(init.body as string).payload.website, WEBSITE)
})

test('refuses the proxy on a host it does not count', async () => {
  assert.equal((await handleAnalytics(req('https://evil.example/a/script.js'), ENV)).status, 404)
})

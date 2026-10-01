const test = require('node:test')
const assert = require('node:assert')
const { normalizeBiddingZone, buildParams, pick, errorStatusText } = require('../nodes/lib/energy-charts')

test('normalizeBiddingZone keeps the spelling the API expects', () => {
    assert.strictEqual(normalizeBiddingZone('it-north'), 'IT-North')
    assert.strictEqual(normalizeBiddingZone('de-lu'), 'DE-LU')
    assert.strictEqual(normalizeBiddingZone('IE(SEM)'), 'IE(SEM)')
})

test('normalizeBiddingZone maps legacy and empty values', () => {
    assert.strictEqual(normalizeBiddingZone('sl'), 'SI')
    assert.strictEqual(normalizeBiddingZone(''), 'DE-LU')
    assert.strictEqual(normalizeBiddingZone(undefined), 'DE-LU')
})

test('buildParams drops empty values', () => {
    assert.deepStrictEqual(buildParams({ bzn: 'AT', start: '', end: undefined, year: 2024 }), { bzn: 'AT', year: 2024 })
    assert.deepStrictEqual(buildParams({ start: ' 2026-01-01 ' }), { start: '2026-01-01' })
})

test('pick prefers msg properties over config', () => {
    assert.strictEqual(pick({ start: '2026-01-01' }, 'start', '2025-01-01'), '2026-01-01')
    assert.strictEqual(pick({ start: '' }, 'start', '2025-01-01'), '2025-01-01')
    assert.strictEqual(pick({}, 'start', '2025-01-01'), '2025-01-01')
})

test('errorStatusText shows Retry-After for 429', () => {
    assert.strictEqual(errorStatusText({ response: { status: 429, headers: { 'retry-after': '30' } } }), '429 rate limited, retry in 30s')
    assert.strictEqual(errorStatusText({ response: { status: 400, headers: {} } }), 400)
    assert.strictEqual(errorStatusText({ message: 'timeout' }), 'timeout')
})

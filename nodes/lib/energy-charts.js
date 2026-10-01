const axios = require('axios')

const BASE_URL = 'https://api.energy-charts.info'

const BIDDING_ZONES = [
    'AT', 'BE', 'BG', 'CH', 'CZ', 'DE-LU', 'DE-AT-LU', 'DK1', 'DK2', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU',
    'IE(SEM)', 'IT-Brindisi', 'IT-Calabria', 'IT-Centre-North', 'IT-Centre-South', 'IT-Foggia', 'IT-GR',
    'IT-North', 'IT-North-AT', 'IT-North-CH', 'IT-North-FR', 'IT-North-SI', 'IT-Priolo', 'IT-Rossano',
    'IT-SACOAC', 'IT-SACODC', 'IT-Sardinia', 'IT-Sicily', 'IT-South', 'LT', 'LV', 'ME', 'NL',
    'NO1', 'NO2', 'NO2NSL', 'NO3', 'NO4', 'NO5', 'PL', 'PT', 'RO', 'RS', 'SE1', 'SE2', 'SE3', 'SE4',
    'SI', 'SK', 'UA-BEI', 'UA-IPS'
]

// Values stored by version 0.0.1 of the prices node that are not valid bidding zones.
const LEGACY_BIDDING_ZONES = { SL: 'SI' }

// The API expects the exact spelling (e.g. "IT-North"), so match case-insensitively
// against the known zones instead of upper-casing the input.
function normalizeBiddingZone(value) {
    if (value === undefined || value === null || String(value).trim() === '') {
        return 'DE-LU'
    }
    const upper = String(value).trim().toUpperCase()
    if (LEGACY_BIDDING_ZONES[upper]) {
        return LEGACY_BIDDING_ZONES[upper]
    }
    return BIDDING_ZONES.find(zone => zone.toUpperCase() === upper) ?? String(value).trim()
}

// Drops empty values so the API applies its own defaults.
function buildParams(params) {
    const result = {}
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
            result[key] = typeof value === 'string' ? value.trim() : value
        }
    }
    return result
}

// msg properties take precedence over the node configuration.
function pick(msg, key, configValue) {
    return msg[key] !== undefined && msg[key] !== null && msg[key] !== '' ? msg[key] : configValue
}

function errorStatusText(error) {
    const status = error.response?.status
    if (status === 429) {
        const retryAfter = error.response.headers?.['retry-after']
        return retryAfter ? `429 rate limited, retry in ${retryAfter}s` : '429 rate limited'
    }
    return status ?? error.message
}

// Wires up the input handler shared by all nodes: request the endpoint returned by
// getRequest(msg) and put the response body into msg.payload.
function handleRequests(node, getRequest) {
    node.on('input', function (msg, send, done) {
        const { path, params } = getRequest(msg)
        const query = buildParams(params)
        node.status({ fill: 'blue', shape: 'dot', text: 'requesting' })
        axios.get(BASE_URL + path, { params: query, headers: { accept: 'application/json' } })
            .then(function (response) {
                node.status({ fill: 'green', shape: 'dot', text: response.status })
                msg.payload = response.data
                send(msg)
                done()
            })
            .catch(function (error) {
                node.status({ fill: 'red', shape: 'dot', text: errorStatusText(error) })
                // Node-RED replaces msg.error for catch nodes, so keep the request details separately.
                msg.request = { path, params: query, status: error.response?.status }
                done(new Error(`${path}: ${error.message}`))
            })
    })
}

module.exports = {
    BASE_URL,
    BIDDING_ZONES,
    normalizeBiddingZone,
    buildParams,
    pick,
    errorStatusText,
    handleRequests
}

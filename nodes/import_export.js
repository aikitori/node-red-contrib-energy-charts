module.exports = function (RED) {
    const { pick, handleRequests } = require('./lib/energy-charts')

    // cbet: scheduled commercial exchanges, cbpf: physical flows
    const ENDPOINTS = { cbet: '/cbet', cbpf: '/cbpf' }

    function ImportExportNode(config) {
        RED.nodes.createNode(this, config)
        const node = this
        node.country = config.country || 'de'
        node.flow = config.flow || 'cbet'
        node.start = config.start
        node.end = config.end

        handleRequests(node, msg => ({
            path: ENDPOINTS[pick(msg, 'flow', node.flow)] ?? ENDPOINTS.cbet,
            params: {
                country: pick(msg, 'country', node.country),
                start: pick(msg, 'start', node.start),
                end: pick(msg, 'end', node.end)
            }
        }))
    }
    RED.nodes.registerType('energy-charts-import-export', ImportExportNode)
}

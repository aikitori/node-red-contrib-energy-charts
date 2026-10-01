module.exports = function (RED) {
    const { pick, handleRequests } = require('./lib/energy-charts')

    function PowerNode(config) {
        RED.nodes.createNode(this, config)
        const node = this
        node.country = config.country || 'de'
        node.start = config.start
        node.end = config.end

        handleRequests(node, msg => ({
            path: '/public_power',
            params: {
                country: pick(msg, 'country', node.country),
                start: pick(msg, 'start', node.start),
                end: pick(msg, 'end', node.end)
            }
        }))
    }
    RED.nodes.registerType('energy-charts-power', PowerNode)
}

module.exports = function (RED) {
    const { pick, handleRequests } = require('./lib/energy-charts')

    function RenShareNode(config) {
        RED.nodes.createNode(this, config)
        const node = this
        node.country = config.country || 'de'
        node.mode = config.mode || 'forecast'
        node.year = config.year

        handleRequests(node, msg => {
            const country = pick(msg, 'country', node.country)
            if (pick(msg, 'mode', node.mode) === 'daily_avg') {
                return { path: '/ren_share_daily_avg', params: { country, year: pick(msg, 'year', node.year) } }
            }
            return { path: '/ren_share_forecast', params: { country } }
        })
    }
    RED.nodes.registerType('energy-charts-ren-share', RenShareNode)
}

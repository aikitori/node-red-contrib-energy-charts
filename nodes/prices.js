module.exports = function(RED) {
    const axios = require('axios')
    function PricesNode(config) {
        RED.nodes.createNode(this,config);
        this.bzn = config.bzn.toUpperCase() ?? 'DE-LU' ;
        this.start = config.start;
        this.end = config.end;
        var node = this;
        var headers = {
            accept: 'application/json'
        }
        var options = {
            bzn: node.bzn,
            start: node.start,
            end: node.end
        }
        node.on('input', function(msg) {
            node.status({fill:"blue",shape:"dot",text:"requesting"});
            axios.get('https://api.energy-charts.info/price',
            { params: options, headers }).then(function (response) {
            node.status({fill:"green",shape:"dot",text: response.status});
            let prices = response.data
            msg.payload = prices
            node.send(msg)
          })
            .catch(error => {
              node.status({fill:"red",shape:"dot",text: response.status});
              node.warn({ error: error.message,params: options })
            })
        }
    )}
    RED.nodes.registerType("prices",PricesNode);
} 



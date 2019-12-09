const NATS = require('nats');

var NatsServer = function() {
    this._server;
    
    this.onRequest = function(input, requestChannel, callback) {
        callback('{}');
    }
}

NatsServer.prototype._onRequest = function(input, requestChannel, responseChannel) {
    this.onRequest(input, requestChannel, (output)=>{
        this._server.publish(responseChannel, output || {});
    });
}

NatsServer.prototype.addChannel = function(channel, callback) {
    if (!this._server) {
        if (callback) {
            callback('NATS is not connected.')
        }
        return;
    }
    
    this._server.subscribe(channel, (input, responseChannel, requestChannel)=>{
        this._onRequest(input, requestChannel, responseChannel);
    });

    if (callback) {
        callback();
    }

}

NatsServer.prototype.listen = function(options, channel, callback) {
    if (typeof(options) === 'string') {
        options = {
            url: options
        }
    }
    try {
        this._server.close();
    } catch(e) {

    }
    
    this._server = NATS.connect(options);
    this._server.on('connect', ()=>{
        this.addChannel(channel, callback)
    });
    
}

module.exports = NatsServer;
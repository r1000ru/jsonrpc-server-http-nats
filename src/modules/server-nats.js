const NATS = require('nats');
const { EventEmitter } = require('./server-http');
class ServerNats extends EventEmitter {
    constructor() {
        super();
    }
}


var NatsServer = function() {
    this._server;
    this._headers = {};
    this.onRequest = function(input, requestChannel, callback) {
        callback('{}');
    }
}
NatsServer.prototype.headerAdd = function(type, value) {
    this._headers[type] = value;
}

NatsServer.prototype.headerRemove = function(type) {
    delete(this._headers[type]);
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

NatsServer.prototype.listen = function(options, channel, onStart, onError) {
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
        this.addChannel(channel, onStart)
    });

    if (onError) {
        this._server.on('error', (e)=>{
            onError(e);
        })
    }
    
}

module.exports = ServerNats;
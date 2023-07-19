const http = require('http');
const { EventEmitter } = require('stream');
const Headers = require('./headers');

class ServerHTTP extends EventEmitter{
    constructor(server) {
        super();

        this._headers = new Headers();
        this._server = server || http.createServer();
        this._server.on('request', (request, response) => {
            this._onHTTPRequest(request, response);
        });
    }

    headerAdd = function(header, value) {
        this._headers.add(header, value);
    }
    
    headerRemove = function(header) {
        this._headers.remove(header);
    }

    listen(config = { host: '127.0.0.1', port: 8080 }, callback) {
        this._server.listen(config, callback);
    }

    async _onHTTPRequest(request, response) {
        if (request.method === 'OPTIONS') {
            this._send(response);
            return;
        }

        const input = await this._getHTTPRequestBody(request);
        request.headers['x-forwarded-for'] = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        this.emit('request', input, null, request.headers, (output) => { this._send(response, output)});
    }

    async _getHTTPRequestBody(request) {
        return new Promise((res, rej) =>{
            let buffers = [];
            request.on('data', (chunk) => {
                buffers.push(chunk);
            }).on('end', () => {
                res(Buffer.concat(buffers).toString('utf8'));
            }).on('error', (e)=>{
                res();
            });
        })
    }

    _send(response, output = '') {
        const headers = this._headers.list(Buffer.from(output).byteLength, 'application/json');
        response.writeHead(200, headers);
        response.end(output);
    }
}

module.exports = ServerHTTP;
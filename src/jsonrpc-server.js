const errors = require('./modules/jsonrpc-errors'),
    jsonrpc = require('./modules/jsonrpc');

const ServerHTTP = require('./modules/server-http'),
    ServerNats = require('./modules/server-nats');

class JsonRPCServer {
    constructor() {
        this._methods = new Map();
        this._credential = false;
        this._server_nats = null;
        this._server_http = null;
    }

    createServerHTTP(server) {
        if (this._server_http) {
            throw new Error('HTTP server is already created');
        }

        this._server_http = new ServerHTTP(server);
        this._server_http.on('request', (input, channel, headers, response) => {
            this._onServerRequest(input, channel, headers, response);
        });
    }

    async listenHttp(options) {
        if (!this._server_http) {
            throw new Error('HTTP server is not created');
        }
        return await this._server_http.listen(options);
    }


    listenNats(options, callback) {

    }

    on(method, validator, func) {
        if (!func) {
            func = validator;
            validator = (params) => { return params };
        }

        this._methods.set(method, { validator: validator, func: func });
    }

    headerAdd(type, value) {
        if (this._server_http) {
            this._server_http.headerAdd(type, value);
        }
        if (this._server_nats) {
            this._server_http.headerAdd(type, value);
        }
    }

    headerRemove(type) {
        if (this._server_http) {
            this._server_http.headerRemove(type);
        }
        if (this._server_nats) {
            this._server_http.headerRemove(type);
        }
    }

    _onServerRequest(input, channel, headers, response) {
        const jprcRequest = new jsonrpc.JsonRPCRequest(input);
        const jrpcResponse = new jsonrpc.JsonRPCResponse(jprcRequest.id || null);
        
        if (jprcRequest.error) {
            jrpcResponse.setError(jprcRequest.error.message);
            response(jrpcResponse.stringify());
            return;
        }

        if (this._credential && !channel && (!headers || !headers['x-credential'] || headers['x-credential'] !==  this._credential)) {
            jrpcResponse.setError('SERVICE_FORBIDDEN');
            response(jrpcResponse.stringify());
            return;
        }

        if (!this._methods.has(jprcRequest.method)) {
            jrpcResponse.setError('METHOD_IS_NOT_FOUND');
            response(jrpcResponse.stringify());
            return;
        }

        const method = this._methods.get(jprcRequest.method)

        let params;
        try {
            params = method.validator(jprcRequest.params);
        } catch(e) {
            console.log(e);
            jrpcResponse.setError('INVALID_PARAMS', e.message);
            response(jrpcResponse.stringify());
            return;
        }

        try {
            this._callMethod(method.func, params, channel, headers, (error_message, result) => {
                if (error_message) {
                    jrpcResponse.setError(error_message);
                    response(jrpcResponse.stringify());
                    return;
                }

                jrpcResponse.setResult(result);
                response(jrpcResponse.stringify());
                return;
            });
        } catch (e) {
            console.log(e);
            jrpcResponse.setError('INTERNAL_ERROR', e.message);
            response(jrpcResponse.stringify());
            return;
        }

    }

    _callMethod(func, params, channel, headers, callback) {
        switch(func.length) {
            case 1:
                func(callback);
                break;
            case 2:
                func(params, callback);
                break;
            case 3:
                func(params, channel, callback);
                break;
            case 4:
                func(params, channel, headers, callback);
                break;
            default:
                throw new Error('INTERNAL_ERROR');
        }
    }

}

module.exports.JSONRPCServer = JsonRPCServer;
module.exports.jsonRPCErrors = errors.jsonRPCErrorsList;
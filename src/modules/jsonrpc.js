const { jsonRPCErrorsList } = require('./jsonrpc-errors');

class JsonRPCRequest {
    constructor(input) {
        let json = {};
        try {
            json = JSON.parse(input);
        } catch(e) {
            this.error = jsonRPCErrorsList.getError('PARSE_ERROR');
            return;
        }

        if (json.jsonrpc !== '2.0') {
            this.error = jsonRPCErrorsList.getError('INVALID_REQUEST');
            this.error.setData('JSONRPC version is not correct');
            return;
        }

        if (!json.method) {
            this.error = jsonRPCErrorsList.getError('INVALID_REQUEST');
            this.error.setData('Method is not exist in request');
            return;
        }

        this.jsonrpc = '2.0'
        this.id = json.id || null;
        this.method = json.method;
        this.params = json.params;
    }
}

class JsonRPCResponse {
    constructor(id, result) {
        this.jsonrpc = '2.0'
        this.id = id || null;
        this.result = result;
    }

    setError(message, data) {
        this.error = jsonRPCErrorsList.getError(message);
        this.error.setData(data);
    }

    setResult(result) {
        this.result = result;
    }

    stringify() {
        return JSON.stringify(this);
    }
}

module.exports.JsonRPCRequest = JsonRPCRequest;
module.exports.JsonRPCResponse = JsonRPCResponse;

// callback(undefined, json.id, json.method, json.params);
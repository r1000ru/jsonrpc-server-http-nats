class JsonRPCError {
    constructor(message, code) {
        this.message = message;
        this.code = code;
    }

    setData(data) {
        this.data = data;
    }
}

class JsonRPCErrorsList {
    constructor() {
        this._errors = new Map();
    }

    setError(message, code) {
        this._errors.set(message, new JsonRPCError(message, code)) ;
    }

    getError(message) {
        return this._errors.get(message) || this._errors.get('SERVICE_UNKNOWN_ERROR');
    }

    setArray(errors) {
        errors.forEach(error => {
            this.setError(error.message, error.code);
        });
    }
}


const jsonRPCErrorsList = new JsonRPCErrorsList();

jsonRPCErrorsList.setArray([
    {
        code: -32700,
        message: "PARSE_ERROR"
    },
    {
        code: -32603,
        message: "INTERNAL_ERROR"
    },
    {
        code: -32602,
        message: "INVALID_PARAMS"
    },
    {
        code: -32601,
        message: "METHOD_IS_NOT_FOUND"
    },
    {
        code: -32600,
        message: "INVALID_REQUEST"
    },
    {
        code: -32004,
        message: "SERVICE_FORBIDDEN"
    },
    {
        code: -32003,
        message: "SERVICE_UPDATING"
    },
    {
        code: -32002,
        message: "SERVICE_DISABLED"
    },
    {
        code: -32001,
        message: "SERVICE_ERROR"
    },
    {
        code: -32000,
        message: "SERVICE_UNKNOWN_ERROR"
    }
]);

module.exports.jsonRPCErrorsList = jsonRPCErrorsList;
module.exports.JsonRPCError = JsonRPCError;
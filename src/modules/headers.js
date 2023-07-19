class Headers {
    constructor(headers) {
        this._headers = headers || {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, POST',
            'Access-Control-Allow-Headers': 'Origin, Accept, Content-Type'
        }
    }

    add(header, value) {
          this._headers[header] = value;  
    }

    remove(header) {
        delete(this._headers[header]);
    }

    list(content_length = 0, content_type = 'application/json') {
        const headers = Object.assign({}, this._headers);
        headers['Content-Type'] = content_type;
        headers['Content-Length'] = content_length;
        return headers;
    }
}

module.exports = Headers;
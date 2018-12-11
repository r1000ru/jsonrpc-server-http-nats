const http = require('http');

var Server = function(server) {
    this._server = server || http.createServer();

    this._headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Origin, Accept, Content-Type",
    };

    this._server.on('request', (request, response) => {
        this._onRequest(request, response);
    });

    this.onRequest = function(input, callback) {
        callback(input);
    }
}


/**
 * Устанавливает пользовательские заголовки
 */
Server.prototype.setHTTPHeaders = function(headers) {
    this._headers = headers || {};
}

/**
 * Включает ожидание входящих подключений
 */
Server.prototype.listen = function(options, callback) {
    if (typeof(options) === 'function') {
        callback = options;
        options = {};
    }
    
    options = options || {};
    options.host = options.host || '127.0.0.1';
    options.port = options.port || 8080;

    this._server.listen(options, callback);
}

/**
 * Метод обарабатывающих входящие запросы
 */
Server.prototype._onRequest = function(request, response) {
    // Обработка OPTIONS
    if (request.method === 'OPTIONS') {
        this._send(response);
        return;
    }

    // Загружаем тело
    this._getRequestBody(request, (input)=>{
        // Вызываем внешний обработчки
        this.onRequest(input, null, (output)=>{
            // Отправляем ответ
            this._send(response, output);
        });
    })
}

/**
 * Метод загружает тело POST запроса
 */
Server.prototype._getRequestBody = function(request, callback) {
    let buffers = [];
    request.on('data', (chunk) => {
        buffers.push(chunk);
    }).on('end', () => {
        let content = Buffer.concat(buffers).toString('utf8');
        callback(content);
    }).on('error', (e)=>{
        console.log(e);
        callback();
    });
}

/**
 * Метод отправляет ответ на запрос
 */
Server.prototype._send = function(response, content) {
    let headers = Object.assign({}, this._headers, {
        "Content-Type": "application/json",
        "Content-Length": Buffer.from(content).byteLength
    })
    response.writeHead(200, headers);
    response.end(content);
}

module.exports = Server;
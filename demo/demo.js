// Подключаем модуль
const {JSONRPCServer, jsonRPCErrors} = require('../src/jsonrpc-server');

jsonRPCErrors.setError('CUSTOM_ERROR', 1);

// Создаем экземпляр сервера
const server = new JSONRPCServer();

// Обработчик на метод Ping
server.on('Ping', (response) => {
    let error = null;
    let result = 'Pong';
    response(error, result);
});

// Валидатор и обработчик на метод Hello, с проверкой параметра
server.on('Hello', (param) =>{
    if (typeof(param) !== 'string') {
        throw new Error('Ожидается строка');
    }
    return param;
}, (params, channel, response) => {
    let error = null;
    let result = `Hello ${params} on channel ${channel||'HTTP'}!`;
    response(error, result);
});


// Возврат ошибки с информацие о канале
server.on('ItIsNotWork', (response)=>{
    response('CUSTOM_ERROR');
});

// Создаем HTTP server
server.createServerHTTP();

// Запустим сервер
server.listenHttp(undefined, (e) => {console.log(e)});

//server.listenNats('nats://127.0.0.1:4222', 'TestChannel');

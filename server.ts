console.log("Server is starting...");

import app from './backend/app';
import debug from "debug";
import http from "http";

const debugLog = debug("node-angular");

const normalizePort = (val: string | number) => {
    const port = typeof val === 'string' ? parseInt(val, 10) : val;

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

const onError = (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
        default:
            throw error;
    }
}

const onListening = () => {
    const addr = server.address();
    if (!addr) {
        console.error('Unable to get server address');
        return;
    }
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debugLog('Listening on ' + bind);
}

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);
server.listen(port);


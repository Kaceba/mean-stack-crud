import dotenv from 'dotenv';
dotenv.config();

import app from './backend/app';
import debug from 'debug';
import http from 'http';
import { connectDatabase, closeDatabase } from './backend/database';
import { logger } from './backend/config/logger';

logger.info('Server is starting...');

const debugLog = debug('node-angular');

const normalizePort = (val: string | number) => {
  const port = typeof val === 'string' ? parseInt(val, 10) : val;

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const onError = (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges.');
      process.exit(1);
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use.');
      process.exit(1);
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  if (!addr) {
    console.error('Unable to get server address');
    return;
  }
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debugLog('Listening on ' + bind);
};

const port = normalizePort(process.env['PORT'] || '3000');
app.set('port', port);

const server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);

// Connect to database then start server
connectDatabase()
  .then(() => {
    server.listen(port);
    const addr = server.address();
    const address = typeof addr === 'string' ? addr : `http://localhost:${addr?.port || port}`;
    logger.info('Started! Listening on port ' + port);
    logger.info('Application link: ' + (typeof addr === 'string' ? addr : `http://localhost:${addr?.port || port}`));
  })
  .catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await closeDatabase();
      logger.info('Application shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

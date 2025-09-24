/**
 * Configurações para o sistema de agendamento de alertas
 */

import { AlertSchedulerConfig } from './types';

export const DEFAULT_ALERT_SCHEDULER_CONFIG: AlertSchedulerConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  },
  jobs: {
    priceCheckInterval: process.env.PRICE_CHECK_INTERVAL || '*/30 * * * *', // A cada 30 minutos
    maxRetries: parseInt(process.env.ALERT_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.ALERT_RETRY_DELAY || '5000'), // 5 segundos
  },
};

export const ALERT_SCHEDULER_ERRORS = {
  REDIS_CONNECTION_FAILED: 'Failed to connect to Redis',
  QUEUE_NOT_INITIALIZED: 'Queue not initialized',
  INVALID_ALERT_DATA: 'Invalid alert data',
  PRICE_CHECK_FAILED: 'Failed to check prices',
  NOTIFICATION_FAILED: 'Failed to send notification',
  ALERT_NOT_FOUND: 'Alert not found',
  USER_NOT_FOUND: 'User not found',
} as const;

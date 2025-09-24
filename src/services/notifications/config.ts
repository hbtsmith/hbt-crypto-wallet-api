/**
 * Configurações para o serviço de notificações
 */

import { NotificationServiceConfig } from './types';

export const DEFAULT_NOTIFICATION_CONFIG: NotificationServiceConfig = {
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  },
};

export const NOTIFICATION_ERRORS = {
  FIREBASE_NOT_INITIALIZED: 'Firebase not initialized',
  INVALID_DEVICE_TOKEN: 'Invalid device token',
  INVALID_PAYLOAD: 'Invalid notification payload',
  SEND_FAILED: 'Failed to send notification',
  CONFIG_MISSING: 'Firebase configuration is incomplete',
} as const;

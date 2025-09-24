/**
 * Módulo de notificações
 * Exporta todas as classes e tipos necessários para usar o serviço
 */

// Tipos e interfaces
export * from './types';

// Configurações
export * from './config';

// Serviços
export * from './FirebaseNotificationService';

// Instância singleton do serviço
import { FirebaseNotificationService } from './FirebaseNotificationService';
import { DEFAULT_NOTIFICATION_CONFIG } from './config';

let notificationServiceInstance: FirebaseNotificationService | null = null;

/**
 * Obtém a instância singleton do FirebaseNotificationService
 */
export const getNotificationService = async (): Promise<FirebaseNotificationService> => {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new FirebaseNotificationService(DEFAULT_NOTIFICATION_CONFIG);
    await notificationServiceInstance.initialize();
  }
  return notificationServiceInstance;
};

/**
 * Reseta a instância do FirebaseNotificationService
 */
export const resetNotificationService = (): void => {
  notificationServiceInstance = null;
};

/**
 * Cria uma nova instância do FirebaseNotificationService
 */
export const createNotificationService = async (
  config?: Partial<import('./types').NotificationServiceConfig>
): Promise<FirebaseNotificationService> => {
  const service = new FirebaseNotificationService(config);
  await service.initialize();
  return service;
};

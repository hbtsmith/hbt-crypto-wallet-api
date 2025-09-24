/**
 * Módulo de agendamento de alertas
 * Exporta todas as classes e tipos necessários para usar o serviço
 */

// Tipos e interfaces
export * from './types';

// Configurações
export * from './config';

// Serviços
export * from './AlertSchedulerService';
export * from './PriceAlertChecker';

// Instância singleton do serviço
import { AlertSchedulerService } from './AlertSchedulerService';
import { DEFAULT_ALERT_SCHEDULER_CONFIG } from './config';

let alertSchedulerInstance: AlertSchedulerService | null = null;

/**
 * Obtém a instância singleton do AlertSchedulerService
 */
export const getAlertSchedulerService = async (): Promise<AlertSchedulerService> => {
  if (!alertSchedulerInstance) {
    alertSchedulerInstance = new AlertSchedulerService(DEFAULT_ALERT_SCHEDULER_CONFIG);
    await alertSchedulerInstance.initialize();
  }
  return alertSchedulerInstance;
};

/**
 * Reseta a instância do AlertSchedulerService
 */
export const resetAlertSchedulerService = (): void => {
  alertSchedulerInstance = null;
};

/**
 * Cria uma nova instância do AlertSchedulerService
 */
export const createAlertSchedulerService = async (
  config?: Partial<import('./types').AlertSchedulerConfig>
): Promise<AlertSchedulerService> => {
  const service = new AlertSchedulerService(config);
  await service.initialize();
  return service;
};

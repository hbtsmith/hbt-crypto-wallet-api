/**
 * Configuração do Bull Board para monitoramento de filas
 * Interface web para visualizar e gerenciar jobs do BullMQ
 */

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { getAlertSchedulerService } from './index';

let bullBoardAdapter: ExpressAdapter | null = null;

/**
 * Inicializa o Bull Board com as filas do sistema
 */
export async function initializeBullBoard(): Promise<ExpressAdapter> {
  if (bullBoardAdapter) {
    return bullBoardAdapter;
  }

  try {
    // Obtém o serviço de agendamento
    const schedulerService = await getAlertSchedulerService();
    
    // Obtém a fila de verificação de preços
    const priceCheckQueue = schedulerService.getQueue();
    
    // Cria o adapter do Express
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    // Cria o Bull Board
    createBullBoard({
      queues: [
        new BullMQAdapter(priceCheckQueue, {
          readOnlyMode: false, // Permite interação com os jobs
        }),
      ],
      serverAdapter,
    });

    bullBoardAdapter = serverAdapter;
    
    console.log('✅ Bull Board initialized at /admin/queues');
    return serverAdapter;
  } catch (error) {
    console.error('❌ Error initializing Bull Board:', error);
    throw error;
  }
}

/**
 * Obtém o adapter do Bull Board
 */
export function getBullBoardAdapter(): ExpressAdapter | null {
  return bullBoardAdapter;
}

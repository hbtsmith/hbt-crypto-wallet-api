/**
 * Serviço principal de agendamento de alertas usando BullMQ
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { PriceAlertChecker } from './PriceAlertChecker';
import {
  AlertSchedulerConfig,
  AlertSchedulerStats,
  PriceAlertJobData,
  AlertCheckSummary,
} from './types';
import { DEFAULT_ALERT_SCHEDULER_CONFIG, ALERT_SCHEDULER_ERRORS } from './config';
import { MESSAGES } from '../../messages';

export class AlertSchedulerService {
  private config: AlertSchedulerConfig;
  private redis!: IORedis;
  private priceCheckQueue!: Queue;
  private priceCheckWorker!: Worker;
  private queueEvents!: QueueEvents;
  private priceAlertChecker: PriceAlertChecker;
  private isInitialized: boolean = false;

  constructor(config?: Partial<AlertSchedulerConfig>) {
    this.config = { ...DEFAULT_ALERT_SCHEDULER_CONFIG, ...config };
    this.priceAlertChecker = new PriceAlertChecker();
  }

  /**
   * Inicializa o serviço de agendamento
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Conecta ao Redis
      this.redis = new IORedis({
        host: this.config.redis.host,
        port: this.config.redis.port,
        ...(this.config.redis.password && { password: this.config.redis.password }),
        maxRetriesPerRequest: null, // BullMQ requer null para operações de bloqueio
      });

      // Cria a fila de verificação de preços
      this.priceCheckQueue = new Queue('price-check', {
        connection: this.redis,
        defaultJobOptions: {
          removeOnComplete: 100, // Mantém apenas os últimos 100 jobs completos
          removeOnFail: 50, // Mantém apenas os últimos 50 jobs com falha
          attempts: this.config.jobs.maxRetries,
          backoff: {
            type: 'exponential',
            delay: this.config.jobs.retryDelay,
          },
        },
      });

      // Cria o worker para processar jobs
      this.priceCheckWorker = new Worker(
        'price-check',
        async (job: Job<PriceAlertJobData>) => {
          return await this.processPriceCheckJob(job);
        },
        {
          connection: this.redis,
          concurrency: 1, // Processa um job por vez para evitar sobrecarga
        }
      );

      // Cria eventos da fila para monitoramento
      this.queueEvents = new QueueEvents('price-check', {
        connection: this.redis,
      });

      // Configura listeners de eventos
      this.setupEventListeners();

      // Agenda o job recorrente de verificação de preços
      await this.scheduleRecurringPriceCheck();

      this.isInitialized = true;
      console.log('✅ AlertSchedulerService initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing AlertSchedulerService:', error);
      throw new Error(`${ALERT_SCHEDULER_ERRORS.REDIS_CONNECTION_FAILED}: ${error instanceof Error ? error.message : MESSAGES.ALERT_SCHEDULER.UNKNOWN_ERROR}`);
    }
  }

  /**
   * Agenda a verificação recorrente de preços
   */
  private async scheduleRecurringPriceCheck(): Promise<void> {
    try {
      // Remove jobs existentes com o mesmo nome
      await this.priceCheckQueue.removeRepeatable('recurring-price-check', {
        pattern: this.config.jobs.priceCheckInterval,
      });

      // Adiciona o job recorrente
      await this.priceCheckQueue.add(
        'recurring-price-check',
        { type: 'recurring' },
        {
          repeat: {
            pattern: this.config.jobs.priceCheckInterval,
          },
          jobId: 'recurring-price-check', // ID único para evitar duplicatas
        }
      );

      console.log(`📅 Recurring job scheduled: ${this.config.jobs.priceCheckInterval}`);
    } catch (error) {
      console.error('❌ Error scheduling recurring job:', error);
      throw error;
    }
  }

  /**
   * Processa um job de verificação de preços
   */
  private async processPriceCheckJob(job: Job<PriceAlertJobData>): Promise<AlertCheckSummary> {
    try {
      console.log(`🔍 Processing price check - Job ID: ${job.id}`);
      
      const summary = await this.priceAlertChecker.checkAllActiveAlerts();
      
      console.log(`✅ Price check completed: ${summary.triggeredAlerts}/${summary.checkedAlerts} alerts triggered`);
      
      return summary;
    } catch (error) {
      console.error(`❌ Error processing job ${job.id}:`, error);
      throw error;
    }
  }

  /**
   * Configura listeners de eventos da fila
   */
  private setupEventListeners(): void {
    // Evento quando um job é completado
    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      console.log(`✅ Job ${jobId} completed successfully`);
    });

    // Evento quando um job falha
    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`❌ Job ${jobId} failed: ${failedReason}`);
    });

    // Evento quando um job está sendo processado
    this.queueEvents.on('active', ({ jobId }) => {
      console.log(`🔄 Job ${jobId} started`);
    });

    // Evento quando um job está esperando
    this.queueEvents.on('waiting', ({ jobId }) => {
      console.log(`⏳ Job ${jobId} waiting for processing`);
    });
  }

  /**
   * Força uma verificação imediata de preços
   */
  async triggerImmediatePriceCheck(): Promise<string> {
    if (!this.isInitialized) {
      throw new Error(ALERT_SCHEDULER_ERRORS.QUEUE_NOT_INITIALIZED);
    }

    const job = await this.priceCheckQueue.add(
      'immediate-price-check',
      { type: 'immediate' },
      {
        priority: 1, // Alta prioridade
      }
    );

    console.log(`🚀 Immediate price check scheduled - Job ID: ${job.id}`);
    return job.id!;
  }

  /**
   * Obtém estatísticas da fila
   */
  async getQueueStats(): Promise<AlertSchedulerStats> {
    if (!this.isInitialized) {
      throw new Error(ALERT_SCHEDULER_ERRORS.QUEUE_NOT_INITIALIZED);
    }

    const [waiting, active, completed, failed] = await Promise.all([
      this.priceCheckQueue.getWaiting(),
      this.priceCheckQueue.getActive(),
      this.priceCheckQueue.getCompleted(),
      this.priceCheckQueue.getFailed(),
    ]);

    return {
      totalJobs: waiting.length + active.length + completed.length + failed.length,
      activeJobs: active.length,
      completedJobs: completed.length,
      failedJobs: failed.length,
      waitingJobs: waiting.length,
    };
  }

  /**
   * Obtém informações sobre um job específico
   */
  async getJobInfo(jobId: string): Promise<Job | null> {
    if (!this.isInitialized) {
      throw new Error(ALERT_SCHEDULER_ERRORS.QUEUE_NOT_INITIALIZED);
    }

    const job = await this.priceCheckQueue.getJob(jobId);
    return job || null;
  }

  /**
   * Limpa jobs antigos da fila
   */
  async cleanOldJobs(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error(ALERT_SCHEDULER_ERRORS.QUEUE_NOT_INITIALIZED);
    }

    await this.priceCheckQueue.clean(24 * 60 * 60 * 1000, 100); // Remove jobs com mais de 24h
    console.log('🧹 Old jobs removed from queue');
  }

  /**
   * Pausa o processamento de jobs
   */
  async pauseQueue(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error(ALERT_SCHEDULER_ERRORS.QUEUE_NOT_INITIALIZED);
    }

    await this.priceCheckQueue.pause();
    console.log('⏸️ Queue paused');
  }

  /**
   * Resume o processamento de jobs
   */
  async resumeQueue(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error(ALERT_SCHEDULER_ERRORS.QUEUE_NOT_INITIALIZED);
    }

    await this.priceCheckQueue.resume();
    console.log('▶️ Queue resumed');
  }

  /**
   * Verifica se o serviço está inicializado
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtém informações de conexão
   */
  getConnectionInfo(): { redis: string; queue: string; worker: string } {
    return {
      redis: `${this.config.redis.host}:${this.config.redis.port}`,
      queue: this.priceCheckQueue.name,
      worker: this.priceCheckWorker.name,
    };
  }

  /**
   * Obtém a instância da fila para uso externo (ex: Bull Board)
   */
  getQueue(): Queue {
    if (!this.isInitialized) {
      throw new Error(ALERT_SCHEDULER_ERRORS.QUEUE_NOT_INITIALIZED);
    }
    return this.priceCheckQueue;
  }

  /**
   * Fecha todas as conexões
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await this.priceCheckWorker.close();
      await this.priceCheckQueue.close();
      await this.queueEvents.close();
      await this.redis.quit();
      
      this.isInitialized = false;
      console.log('🔌 AlertSchedulerService disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting AlertSchedulerService:', error);
      throw error;
    }
  }
}

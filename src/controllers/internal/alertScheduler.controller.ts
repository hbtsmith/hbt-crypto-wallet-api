/**
 * Controller para endpoints internos do sistema de alertas
 */

import { Request, Response, NextFunction } from 'express';
import { getAlertSchedulerService } from '../../services/alertScheduler';
import { getNotificationService } from '../../services/notifications';
import { MESSAGES } from '../../messages';

/**
 * Middleware para autenticação interna (apenas para desenvolvimento)
 * Em produção, isso deveria usar uma chave API ou autenticação mais robusta
 */
export const internalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const internalKey = req.headers['x-internal-key'];
  
  if (!internalKey || internalKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: MESSAGES.ALERT_SCHEDULER.ACCESS_DENIED });
  }
  
  next();
};

/**
 * Força uma verificação imediata de preços
 */
export async function triggerPriceCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const schedulerService = await getAlertSchedulerService();
    const jobId = await schedulerService.triggerImmediatePriceCheck();
    
    return res.status(200).json({
      success: true,
      message: MESSAGES.ALERT_SCHEDULER.PRICE_CHECK_SCHEDULED,
      jobId,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtém estatísticas da fila de jobs
 */
export async function getQueueStats(req: Request, res: Response, next: NextFunction) {
  try {
    const schedulerService = await getAlertSchedulerService();
    const stats = await schedulerService.getQueueStats();
    
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtém informações sobre um job específico
 */
export async function getJobInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({ error: MESSAGES.ALERT_SCHEDULER.JOB_ID_REQUIRED });
    }
    
    const schedulerService = await getAlertSchedulerService();
    const job = await schedulerService.getJobInfo(jobId);
    
    if (!job) {
      return res.status(404).json({ error: MESSAGES.ALERT_SCHEDULER.JOB_NOT_FOUND });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress,
        returnvalue: job.returnvalue,
        failedReason: job.failedReason,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        state: await job.getState(),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Pausa o processamento da fila
 */
export async function pauseQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const schedulerService = await getAlertSchedulerService();
    await schedulerService.pauseQueue();
    
    return res.status(200).json({
      success: true,
      message: MESSAGES.ALERT_SCHEDULER.QUEUE_PAUSED,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Resume o processamento da fila
 */
export async function resumeQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const schedulerService = await getAlertSchedulerService();
    await schedulerService.resumeQueue();
    
    return res.status(200).json({
      success: true,
      message: MESSAGES.ALERT_SCHEDULER.QUEUE_RESUMED,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Limpa jobs antigos da fila
 */
export async function cleanOldJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const schedulerService = await getAlertSchedulerService();
    await schedulerService.cleanOldJobs();
    
    return res.status(200).json({
      success: true,
      message: MESSAGES.ALERT_SCHEDULER.OLD_JOBS_CLEANED,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtém informações de conexão e status do serviço
 */
export async function getServiceStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const schedulerService = await getAlertSchedulerService();
    const notificationService = await getNotificationService();
    
    return res.status(200).json({
      success: true,
      data: {
        scheduler: {
          initialized: schedulerService.isServiceInitialized(),
          connection: schedulerService.getConnectionInfo(),
        },
        notifications: {
          initialized: notificationService.isInitialized(),
          projectInfo: notificationService.getProjectInfo(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Testa o envio de notificação push
 */
export async function testNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const { deviceToken, title, body } = req.body;
    
    if (!deviceToken || !title || !body) {
      return res.status(400).json({ 
        error: MESSAGES.ALERT_SCHEDULER.DEVICE_TOKEN_TITLE_BODY_REQUIRED 
      });
    }
    
    const notificationService = await getNotificationService();
    const result = await notificationService.sendPushNotification({
      deviceToken,
      payload: {
        title,
        body,
        data: {
          type: 'test',
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

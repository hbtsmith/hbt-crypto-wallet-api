/**
 * Rotas internas para gerenciamento do sistema
 */

import { Router } from 'express';
import {
  triggerPriceCheck,
  getQueueStats,
  getJobInfo,
  pauseQueue,
  resumeQueue,
  cleanOldJobs,
  getServiceStatus,
  testNotification,
  internalAuthMiddleware,
} from '../controllers/internal/alertScheduler.controller';

const router = Router();

// Aplica middleware de autenticação interna em todas as rotas
router.use(internalAuthMiddleware);

// Rotas do sistema de alertas
router.post('/alerts/trigger-check', triggerPriceCheck);
router.get('/alerts/queue-stats', getQueueStats);
router.get('/alerts/job/:jobId', getJobInfo);
router.post('/alerts/pause-queue', pauseQueue);
router.post('/alerts/resume-queue', resumeQueue);
router.post('/alerts/clean-jobs', cleanOldJobs);
router.get('/alerts/status', getServiceStatus);

// Rotas de teste
router.post('/notifications/test', testNotification);

export default router;

/**
 * Tipos e interfaces para o sistema de agendamento de alertas
 */

export interface AlertCheckResult {
  alertId: string;
  symbol: string;
  targetPrice: number;
  currentPrice: number;
  direction: 'CROSS_UP' | 'CROSS_DOWN';
  conditionMet: boolean;
  userId: string;
  deviceToken?: string;
}

export interface PriceAlertJobData {
  alertId: string;
  symbol: string;
  targetPrice: number;
  direction: 'CROSS_UP' | 'CROSS_DOWN';
  userId: string;
  deviceToken?: string;
}

export interface AlertSchedulerConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jobs: {
    priceCheckInterval: string; // Cron expression
    maxRetries: number;
    retryDelay: number;
  };
}

export interface AlertSchedulerStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  waitingJobs: number;
}

export interface AlertCheckSummary {
  totalAlerts: number;
  checkedAlerts: number;
  triggeredAlerts: number;
  errors: string[];
  results: AlertCheckResult[];
}

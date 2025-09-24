/**
 * Tipos e interfaces para o serviço de notificações
 */

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface PushNotificationRequest {
  deviceToken: string;
  payload: NotificationPayload;
}

export interface PushNotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface NotificationServiceConfig {
  firebase: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
  };
}

export interface PriceAlertNotificationData {
  symbol: string;
  currentPrice: number;
  targetPrice: number;
  direction: 'CROSS_UP' | 'CROSS_DOWN';
  alertId: string;
}

export interface NotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}

/**
 * Serviço de notificações push usando Firebase Cloud Messaging
 */

import admin from 'firebase-admin';
import {
  NotificationPayload,
  PushNotificationRequest,
  PushNotificationResponse,
  NotificationServiceConfig,
  PriceAlertNotificationData,
  NotificationResult,
} from './types';
import { DEFAULT_NOTIFICATION_CONFIG, NOTIFICATION_ERRORS } from './config';
import { MESSAGES } from '../../messages';

export class FirebaseNotificationService {
  private app: admin.app.App | null = null;
  private config: NotificationServiceConfig;

  constructor(config?: Partial<NotificationServiceConfig>) {
    this.config = { ...DEFAULT_NOTIFICATION_CONFIG, ...config };
  }

  /**
   * Inicializa o Firebase Admin SDK
   */
  async initialize(): Promise<void> {
    if (this.app) {
      return; // Já inicializado
    }

    // Verifica se as configurações estão presentes
    if (!this.config.firebase.projectId || !this.config.firebase.privateKey || !this.config.firebase.clientEmail) {
      throw new Error(NOTIFICATION_ERRORS.CONFIG_MISSING);
    }

    try {
      // Inicializa o Firebase Admin SDK
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.firebase.projectId,
          privateKey: this.config.firebase.privateKey,
          clientEmail: this.config.firebase.clientEmail,
        }),
        projectId: this.config.firebase.projectId,
      });

      console.log('✅ Firebase Notification Service initialized');
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      throw new Error(`Failed to initialize Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Envia uma notificação push para um dispositivo
   * Send a push notification to a device
   */
  async sendPushNotification(request: PushNotificationRequest): Promise<PushNotificationResponse> {
    if (!this.app) {
      throw new Error(NOTIFICATION_ERRORS.FIREBASE_NOT_INITIALIZED);
    }

    if (!request.deviceToken) {
      throw new Error(NOTIFICATION_ERRORS.INVALID_DEVICE_TOKEN);
    }

    if (!request.payload.title || !request.payload.body) {
      throw new Error(NOTIFICATION_ERRORS.INVALID_PAYLOAD);
    }

    try {
      const message: admin.messaging.Message = {
        token: request.deviceToken,
        notification: {
          title: request.payload.title,
          body: request.payload.body,
          ...(request.payload.imageUrl && { imageUrl: request.payload.imageUrl }),
        },
        ...(request.payload.data && {
          data: Object.entries(request.payload.data).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        }),
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'price-alerts',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      
      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      console.error('❌', MESSAGES.NOTIFICATIONS.PUSH_NOTIFICATION_ERROR, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : MESSAGES.SYSTEM.ERROR,
      };
    }
  }

  /**
   * Envia notificação de alerta de preço
   */
  async sendPriceAlertNotification(
    deviceToken: string,
    data: PriceAlertNotificationData
  ): Promise<PushNotificationResponse> {
    const directionText = data.direction === 'CROSS_UP' ? 'up to' : 'down to';
    const emoji = data.direction === 'CROSS_UP' ? '📈' : '📉';

    const payload: NotificationPayload = {
      title: `${emoji} Price Alert`,
      body: `${data.symbol} ${directionText} $${data.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`,
      data: {
        type: 'price_alert',
        symbol: data.symbol,
        currentPrice: data.currentPrice.toString(),
        targetPrice: data.targetPrice.toString(),
        direction: data.direction,
        alertId: data.alertId,
      },
    };

    return this.sendPushNotification({
      deviceToken,
      payload,
    });
  }

  /**
   * Envia notificações para múltiplos dispositivos
   */
  async sendBulkNotifications(requests: PushNotificationRequest[]): Promise<NotificationResult> {
    const results = await Promise.allSettled(
      requests.map(request => this.sendPushNotification(request))
    );

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        sent++;
      } else {
        failed++;
        const error = result.status === 'rejected' 
          ? result.reason 
          : result.value.error;
        errors.push(`Device ${index + 1}: ${error}`);
      }
    });

    return {
      success: failed === 0,
      sent,
      failed,
      errors,
    };
  }

  /**
   * Verifica se o serviço está inicializado
   */
  isInitialized(): boolean {
    return this.app !== null;
  }

  /**
   * Obtém informações do projeto Firebase
   */
  getProjectInfo(): { projectId: string; initialized: boolean } {
    return {
      projectId: this.config.firebase.projectId,
      initialized: this.isInitialized(),
    };
  }
}

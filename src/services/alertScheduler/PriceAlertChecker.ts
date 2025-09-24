/**
 * Serviço para verificar preços e condições dos alertas
 */

import { prisma } from '../../config/prisma';
import { getCryptoPriceService } from '../cryptoPrice';
import { getNotificationService } from '../notifications';
import {
  AlertCheckResult,
  AlertCheckSummary,
  PriceAlertJobData,
} from './types';
import { ALERT_SCHEDULER_ERRORS } from './config';
import { MESSAGES } from '../../messages';

export class PriceAlertChecker {
  /**
   * Verifica todos os alertas ativos e retorna os que foram acionados
   */
  async checkAllActiveAlerts(): Promise<AlertCheckSummary> {
    try {
      // Busca todos os alertas ativos
      const activeAlerts = await prisma.tokenAlert.findMany({
        where: { active: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              deviceToken: true,
            },
          },
        },
      });

      if (activeAlerts.length === 0) {
        return {
          totalAlerts: 0,
          checkedAlerts: 0,
          triggeredAlerts: 0,
          errors: [],
          results: [],
        };
      }

      // Agrupa alertas por símbolo para otimizar consultas de preço
      const alertsBySymbol = this.groupAlertsBySymbol(activeAlerts);
      const symbols = Object.keys(alertsBySymbol);

      // Obtém preços atuais para todos os símbolos
      const cryptoService = await getCryptoPriceService();
      const priceResponse = await cryptoService.getPrices({
        symbols,
        currency: 'USD',
      });

      if (!priceResponse.success) {
        const errorMessage = priceResponse.errors ? priceResponse.errors.join(', ') : MESSAGES.ALERT_SCHEDULER.UNKNOWN_ERROR;
        throw new Error(`${ALERT_SCHEDULER_ERRORS.PRICE_CHECK_FAILED}: ${errorMessage}`);
      }

      // Cria mapa de preços para acesso rápido
      const priceMap = new Map(
        priceResponse.data.map(price => [price.symbol, price.price])
      );

      // Verifica cada alerta
      const results: AlertCheckResult[] = [];
      const errors: string[] = [];

      for (const alert of activeAlerts) {
        try {
          const currentPrice = priceMap.get(alert.symbol);
          
          if (currentPrice === undefined) {
            errors.push(`${MESSAGES.ALERT_SCHEDULER.PRICE_NOT_FOUND} ${alert.symbol}`);
            continue;
          }

          const conditionMet = this.checkAlertCondition(
            currentPrice,
            Number(alert.price),
            alert.direction
          );

          const result: AlertCheckResult = {
            alertId: alert.id,
            symbol: alert.symbol,
            targetPrice: Number(alert.price),
            currentPrice,
            direction: alert.direction,
            conditionMet,
            userId: alert.userId,
            ...(alert.user.deviceToken && { deviceToken: alert.user.deviceToken }),
          };

          results.push(result);

          // Se a condição foi atendida, processa o alerta
          if (conditionMet) {
            await this.processTriggeredAlert(result);
          }
        } catch (error) {
          const errorMessage = `${MESSAGES.ALERT_SCHEDULER.ALERT_CHECK_ERROR} ${alert.id}: ${error instanceof Error ? error.message : MESSAGES.ALERT_SCHEDULER.UNKNOWN_ERROR}`;
          errors.push(errorMessage);
          console.error(errorMessage);
        }
      }

      const triggeredAlerts = results.filter(r => r.conditionMet).length;

      return {
        totalAlerts: activeAlerts.length,
        checkedAlerts: results.length,
        triggeredAlerts,
        errors,
        results,
      };
    } catch (error) {
      console.error('❌ Error checking alerts:', error);
      throw error;
    }
  }

  /**
   * Verifica um alerta específico
   */
  async checkSpecificAlert(alertId: string): Promise<AlertCheckResult | null> {
    try {
      const alert = await prisma.tokenAlert.findUnique({
        where: { id: alertId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              deviceToken: true,
            },
          },
        },
      });

      if (!alert || !alert.active) {
        return null;
      }

      const cryptoService = await getCryptoPriceService();
      const priceResponse = await cryptoService.getPrice(alert.symbol);

      if (!priceResponse) {
        throw new Error(`${MESSAGES.ALERT_SCHEDULER.PRICE_NOT_FOUND} ${alert.symbol}`);
      }

      const conditionMet = this.checkAlertCondition(
        priceResponse.price,
        Number(alert.price),
        alert.direction
      );

      const result: AlertCheckResult = {
        alertId: alert.id,
        symbol: alert.symbol,
        targetPrice: Number(alert.price),
        currentPrice: priceResponse.price,
        direction: alert.direction,
        conditionMet,
        userId: alert.userId,
        ...(alert.user.deviceToken && { deviceToken: alert.user.deviceToken }),
      };

      if (conditionMet) {
        await this.processTriggeredAlert(result);
      }

      return result;
    } catch (error) {
      console.error(`❌ Error checking alert ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Verifica se a condição do alerta foi atendida
   */
  private checkAlertCondition(
    currentPrice: number,
    targetPrice: number,
    direction: 'CROSS_UP' | 'CROSS_DOWN'
  ): boolean {
    if (direction === 'CROSS_UP') {
      return currentPrice >= targetPrice;
    } else {
      return currentPrice <= targetPrice;
    }
  }

  /**
   * Processa um alerta que foi acionado
   */
  private async processTriggeredAlert(result: AlertCheckResult): Promise<void> {
    try {
      // Envia notificação se o usuário tem deviceToken
      if (result.deviceToken) {
        const notificationService = await getNotificationService();
        
        await notificationService.sendPriceAlertNotification(result.deviceToken, {
          symbol: result.symbol,
          currentPrice: result.currentPrice,
          targetPrice: result.targetPrice,
          direction: result.direction,
          alertId: result.alertId,
        });
      }

      // Inativa o alerta
      await prisma.tokenAlert.update({
        where: { id: result.alertId },
        data: {
          active: false,
          lastNotificationDate: new Date(),
        },
      });

      console.log(`✅ Alert Added: ${result.symbol} ${result.direction} $${result.currentPrice}`);
    } catch (error) {
      console.error(`❌ Error processing triggered alert ${result.alertId}:`, error);
      throw error;
    }
  }

  /**
   * Agrupa alertas por símbolo para otimizar consultas
   */
  private groupAlertsBySymbol(alerts: any[]): Record<string, any[]> {
    return alerts.reduce((acc, alert) => {
      if (!acc[alert.symbol]) {
        acc[alert.symbol] = [];
      }
      acc[alert.symbol].push(alert);
      return acc;
    }, {} as Record<string, any[]>);
  }
}

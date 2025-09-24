/**
 * Testes para o sistema de alertas
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PriceAlertChecker } from '../src/services/alertScheduler/PriceAlertChecker';
import { FirebaseNotificationService } from '../src/services/notifications/FirebaseNotificationService';
import { prisma } from '../src/config/prisma';
import { getCryptoPriceService } from '../src/services/cryptoPrice';
import { getNotificationService } from '../src/services/notifications';

// Mock do serviço de preços
vi.mock('../src/services/cryptoPrice', () => ({
  getCryptoPriceService: vi.fn(),
}));

// Mock do serviço de notificações
vi.mock('../src/services/notifications', () => ({
  getNotificationService: vi.fn(),
}));

describe('PriceAlertChecker', () => {
  let priceAlertChecker: PriceAlertChecker;
  let mockCryptoService: any;
  let mockNotificationService: any;

  beforeEach(() => {
    priceAlertChecker = new PriceAlertChecker();
    
    // Mock do serviço de preços
    mockCryptoService = {
      getPrices: vi.fn(),
      getPrice: vi.fn(),
    };
    
    // Mock do serviço de notificações
    mockNotificationService = {
      sendPriceAlertNotification: vi.fn(),
    };

    vi.mocked(getCryptoPriceService).mockResolvedValue(mockCryptoService);
    vi.mocked(getNotificationService).mockResolvedValue(mockNotificationService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAlertCondition', () => {
    it('deve retornar true quando preço atual >= preço alvo para CROSS_UP', () => {
      const result = (priceAlertChecker as any).checkAlertCondition(50000, 45000, 'CROSS_UP');
      expect(result).toBe(true);
    });

    it('deve retornar false quando preço atual < preço alvo para CROSS_UP', () => {
      const result = (priceAlertChecker as any).checkAlertCondition(40000, 45000, 'CROSS_UP');
      expect(result).toBe(false);
    });

    it('deve retornar true quando preço atual <= preço alvo para CROSS_DOWN', () => {
      const result = (priceAlertChecker as any).checkAlertCondition(40000, 45000, 'CROSS_DOWN');
      expect(result).toBe(true);
    });

    it('deve retornar false quando preço atual > preço alvo para CROSS_DOWN', () => {
      const result = (priceAlertChecker as any).checkAlertCondition(50000, 45000, 'CROSS_DOWN');
      expect(result).toBe(false);
    });
  });

  describe('checkAllActiveAlerts', () => {
    it('deve retornar resumo vazio quando não há alertas ativos', async () => {
      // Mock do Prisma
      vi.spyOn(prisma.tokenAlert, 'findMany').mockResolvedValue([]);

      const result = await priceAlertChecker.checkAllActiveAlerts();

      expect(result).toEqual({
        totalAlerts: 0,
        checkedAlerts: 0,
        triggeredAlerts: 0,
        errors: [],
        results: [],
      });
    });

    it('deve verificar alertas ativos e processar os acionados', async () => {
      const mockAlerts = [
        {
          id: 'alert-1',
          symbol: 'BTC',
          price: 45000 as any, // Decimal type
          direction: 'CROSS_UP' as any, // DirectionType
          userId: 'user-1',
          lastNotificationDate: null,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            deviceToken: 'device-token-1',
          },
        },
        {
          id: 'alert-2',
          symbol: 'ETH',
          price: 3000 as any, // Decimal type
          direction: 'CROSS_DOWN' as any, // DirectionType
          userId: 'user-2',
          lastNotificationDate: null,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-2',
            name: 'Test User 2',
            email: 'test2@example.com',
            deviceToken: null,
          },
        },
      ];

      // Mock do Prisma
      vi.spyOn(prisma.tokenAlert, 'findMany').mockResolvedValue(mockAlerts);
      vi.spyOn(prisma.tokenAlert, 'update').mockResolvedValue({} as any);

      // Mock do serviço de preços
      mockCryptoService.getPrices.mockResolvedValue({
        success: true,
        data: [
          { symbol: 'BTC', price: 50000 },
          { symbol: 'ETH', price: 2500 },
        ],
      });

      // Mock do serviço de notificações
      mockNotificationService.sendPriceAlertNotification.mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      const result = await priceAlertChecker.checkAllActiveAlerts();

      expect(result.totalAlerts).toBe(2);
      expect(result.checkedAlerts).toBe(2);
      expect(result.triggeredAlerts).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(result.results).toHaveLength(2);

      // Verifica se as notificações foram enviadas
      expect(mockNotificationService.sendPriceAlertNotification).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.sendPriceAlertNotification).toHaveBeenCalledWith(
        'device-token-1',
        expect.objectContaining({
          symbol: 'BTC',
          currentPrice: 50000,
          targetPrice: 45000,
          direction: 'CROSS_UP',
          alertId: 'alert-1',
        })
      );

      // Verifica se os alertas foram inativados
      expect(prisma.tokenAlert.update).toHaveBeenCalledTimes(2);
    });
  });
});

describe('FirebaseNotificationService', () => {
  let notificationService: FirebaseNotificationService;

  beforeEach(() => {
    notificationService = new FirebaseNotificationService({
      firebase: {
        projectId: 'test-project',
        privateKey: 'test-private-key',
        clientEmail: 'test@test.com',
      },
    });
  });

  describe('sendPriceAlertNotification', () => {
    it('deve formatar corretamente a notificação de alerta de preço', async () => {
      // Mock do Firebase Admin
      const mockSend = vi.fn().mockResolvedValue('message-id-123');
      const mockMessaging = {
        send: mockSend,
      };
      
      vi.spyOn(require('firebase-admin'), 'messaging').mockReturnValue(mockMessaging);
      vi.spyOn(require('firebase-admin'), 'initializeApp').mockReturnValue({} as any);

      // Mock da propriedade app diretamente
      (notificationService as any).app = {}; // Simula que o Firebase foi inicializado

      const result = await notificationService.sendPriceAlertNotification('device-token', {
        symbol: 'BTC',
        currentPrice: 50000,
        targetPrice: 45000,
        direction: 'CROSS_UP',
        alertId: 'alert-123',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('message-id-123');

      // Verifica se a mensagem foi formatada corretamente
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'device-token',
          notification: expect.objectContaining({
            title: '📈 Price Alert',
            body: expect.stringContaining('BTC up to $50'),
          }),
          data: expect.objectContaining({
            type: 'price_alert',
            symbol: 'BTC',
            currentPrice: '50000',
            targetPrice: '45000',
            direction: 'CROSS_UP',
            alertId: 'alert-123',
          }),
        })
      );
    });
  });
});

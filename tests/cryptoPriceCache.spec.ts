import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoinGeckoProvider } from '../src/services/cryptoPrice/providers/CoinGeckoProvider';

// Mock do fetch global
global.fetch = vi.fn();

describe('CoinGeckoProvider Cache', () => {
  let provider: CoinGeckoProvider;
  const mockConfig = {
    baseUrl: 'https://api.coingecko.com',
    timeout: 10000
  };

  beforeEach(() => {
    provider = new CoinGeckoProvider(mockConfig);
    vi.clearAllMocks();
  });

  describe('Cache de Símbolos', () => {
    it('deve criar cache na primeira requisição', async () => {
      // Mock da resposta da API de lista de moedas
      const mockCoinsList = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
        { id: 'cardano', symbol: 'ada', name: 'Cardano' }
      ];

      const mockPriceResponse = {
        bitcoin: { usd: 50000, usd_24h_change: 2.5 },
        ethereum: { usd: 3000, usd_24h_change: 1.8 },
        cardano: { usd: 0.5, usd_24h_change: -0.5 }
      };

      // Mock das chamadas fetch
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCoinsList)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPriceResponse)
        });

      // Primeira chamada
      const response = await provider.getPrices({
        symbols: ['btc', 'eth', 'ada'],
        currency: 'usd'
      });

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(3);
      expect(global.fetch).toHaveBeenCalledTimes(2); // Uma para lista, uma para preços

      // Verificar se o cache foi criado
      const cacheInfo = provider.getCacheInfo();
      expect(cacheInfo.isValid).toBe(true);
      expect(cacheInfo.size).toBe(3);
      expect(cacheInfo.lastUpdated).toBeDefined();
    });

    it('deve usar cache em requisições subsequentes', async () => {
      // Mock da resposta da API de lista de moedas
      const mockCoinsList = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
        { id: 'solana', symbol: 'sol', name: 'Solana' }
      ];

      const mockPriceResponse = {
        bitcoin: { usd: 50000, usd_24h_change: 2.5 },
        ethereum: { usd: 3000, usd_24h_change: 1.8 },
        solana: { usd: 100, usd_24h_change: 5.0 }
      };

      // Mock das chamadas fetch
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCoinsList)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPriceResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPriceResponse)
        });

      // Primeira chamada - cria cache
      await provider.getPrices({
        symbols: ['btc', 'eth'],
        currency: 'usd'
      });

      // Segunda chamada - deve usar cache
      const response = await provider.getPrices({
        symbols: ['btc', 'eth', 'sol'],
        currency: 'usd'
      });

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(3);
      
      // Deve ter chamado fetch apenas 2 vezes (lista + preços da segunda chamada)
      // Não deve ter chamado a API de lista novamente
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('deve limpar cache quando solicitado', async () => {
      // Mock da resposta da API
      const mockCoinsList = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' }
      ];

      const mockPriceResponse = {
        bitcoin: { usd: 50000, usd_24h_change: 2.5 }
      };

      (global.fetch as any)
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockCoinsList)
        });

      // Primeira chamada - cria cache
      await provider.getPrices({
        symbols: ['btc'],
        currency: 'usd'
      });

      // Verificar que cache foi criado
      let cacheInfo = provider.getCacheInfo();
      expect(cacheInfo.isValid).toBe(true);

      // Limpar cache
      provider.clearSymbolCache();

      // Verificar que cache foi limpo
      cacheInfo = provider.getCacheInfo();
      expect(cacheInfo.isValid).toBe(false);
      expect(cacheInfo.size).toBe(0);
    });

    it('deve usar fallback quando API falha', async () => {
      // Mock de falha na API de lista
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('API indisponível'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            bitcoin: { usd: 50000, usd_24h_change: 2.5 }
          })
        });

      const response = await provider.getPrices({
        symbols: ['btc'],
        currency: 'usd'
      });

      // Deve usar mapeamento básico e ainda funcionar
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(1);
      expect(response.data[0].symbol).toBe('BTC');
    });

    it('deve retornar informações corretas do cache', async () => {
      // Cache inicialmente vazio
      let cacheInfo = provider.getCacheInfo();
      expect(cacheInfo.isValid).toBe(false);
      expect(cacheInfo.lastUpdated).toBeUndefined();
      expect(cacheInfo.size).toBe(0);

      // Mock da API
      const mockCoinsList = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum' }
      ];

      (global.fetch as any)
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockCoinsList)
        });

      // Criar cache
      await provider.getPrices({
        symbols: ['btc'],
        currency: 'usd'
      });

      // Verificar informações do cache
      cacheInfo = provider.getCacheInfo();
      expect(cacheInfo.isValid).toBe(true);
      expect(cacheInfo.lastUpdated).toBeInstanceOf(Date);
      expect(cacheInfo.size).toBe(2);
    });

    it('deve forçar atualização do cache', async () => {
      // Mock da API
      const mockCoinsList = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' }
      ];

      (global.fetch as any)
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockCoinsList)
        });

      // Forçar atualização do cache
      await provider.forceRefreshSymbolCache();

      // Verificar que cache foi criado
      const cacheInfo = provider.getCacheInfo();
      expect(cacheInfo.isValid).toBe(true);
      expect(cacheInfo.size).toBe(1);
    });
  });

  describe('Validação de Cache', () => {
    it('deve considerar cache expirado após TTL', async () => {
      // Criar provider com TTL muito baixo para teste
      const providerWithShortTTL = new CoinGeckoProvider(mockConfig);
      
      // Mock da API
      const mockCoinsList = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' }
      ];

      (global.fetch as any)
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockCoinsList)
        });

      // Criar cache
      await providerWithShortTTL.getPrices({
        symbols: ['btc'],
        currency: 'usd'
      });

      // Simular cache expirado modificando a data
      const cacheInfo = providerWithShortTTL.getCacheInfo();
      if (cacheInfo.lastUpdated) {
        // Modificar a data para simular cache expirado
        const expiredDate = new Date(cacheInfo.lastUpdated.getTime() - 25 * 60 * 60 * 1000); // 25 horas atrás
        (providerWithShortTTL as any).symbolCache.lastUpdated = expiredDate;
      }

      // Verificar que cache é considerado inválido
      const updatedCacheInfo = providerWithShortTTL.getCacheInfo();
      expect(updatedCacheInfo.isValid).toBe(false);
    });
  });
});

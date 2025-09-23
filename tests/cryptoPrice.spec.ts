import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  CryptoPriceService, 
  CryptoPriceProviderType, 
  createCryptoPriceService 
} from '../src/services/cryptoPrice';

// Mock do fetch para testes
global.fetch = vi.fn();

describe('CryptoPriceService', () => {
  let cryptoService: CryptoPriceService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock de resposta da FreeCryptoAPI
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        symbols: [
          {
            symbol: 'BTC',
            last: '45000',
            last_btc: '1.0',
            lowest: '44000',
            highest: '46000',
            date: '2024-01-01 12:00:46',
            daily_change_percentage: '2.27',
            source_exchange: 'binance'
          }
        ]
      })
    });
  });

  it('deve inicializar o serviço corretamente', async () => {
    cryptoService = await createCryptoPriceService({
      defaultProvider: CryptoPriceProviderType.FREECRYPTOAPI,
      providers: {
        [CryptoPriceProviderType.FREECRYPTOAPI]: {
          baseUrl: 'https://api.freecryptoapi.com',
          apiKey: 'test-key',
          timeout: 5000
        }
      }
    });

    expect(cryptoService).toBeDefined();
    expect(cryptoService.getCurrentProvider()).toBe(CryptoPriceProviderType.FREECRYPTOAPI);
  });

  it('deve obter preço de um token', async () => {
    cryptoService = await createCryptoPriceService({
      defaultProvider: CryptoPriceProviderType.FREECRYPTOAPI,
      providers: {
        [CryptoPriceProviderType.FREECRYPTOAPI]: {
          baseUrl: 'https://api.freecryptoapi.com',
          apiKey: 'test-key',
          timeout: 5000
        }
      }
    });

    const price = await cryptoService.getPrice('BTC', 'USD');

    expect(price).toBeDefined();
    expect(price?.symbol).toBe('BTC');
    expect(price?.name).toBe('BTC'); // FreeCryptoAPI não fornece nome completo
    expect(price?.price).toBe(45000);
    expect(price?.source).toBe('FreeCryptoAPI');
  });

  it('deve obter preços de múltiplos tokens', async () => {
    // Mock para múltiplos tokens
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        symbols: [
          {
            symbol: 'BTC',
            last: '45000',
            last_btc: '1.0',
            lowest: '44000',
            highest: '46000',
            date: '2024-01-01 12:00:46',
            daily_change_percentage: '2.27',
            source_exchange: 'binance'
          },
          {
            symbol: 'ETH',
            last: '3000',
            last_btc: '0.0667',
            lowest: '2950',
            highest: '3050',
            date: '2024-01-01 12:00:46',
            daily_change_percentage: '1.69',
            source_exchange: 'binance'
          }
        ]
      })
    });

    cryptoService = await createCryptoPriceService({
      defaultProvider: CryptoPriceProviderType.FREECRYPTOAPI,
      providers: {
        [CryptoPriceProviderType.FREECRYPTOAPI]: {
          baseUrl: 'https://api.freecryptoapi.com',
          apiKey: 'test-key',
          timeout: 5000
        }
      }
    });

    const prices = await cryptoService.getMultiplePrices(['BTC', 'ETH'], 'USD');

    expect(prices).toHaveLength(2);
    expect(prices[0].symbol).toBe('BTC');
    expect(prices[1].symbol).toBe('ETH');
  });

  it('deve validar requisições inválidas', async () => {
    cryptoService = await createCryptoPriceService({
      defaultProvider: CryptoPriceProviderType.FREECRYPTOAPI,
      providers: {
        [CryptoPriceProviderType.FREECRYPTOAPI]: {
          baseUrl: 'https://api.freecryptoapi.com',
          apiKey: 'test-key',
          timeout: 5000
        }
      }
    });

    // Teste com símbolos vazios
    await expect(
      cryptoService.getPrices({ symbols: [], currency: 'USD' })
    ).rejects.toThrow('Símbolos inválidos fornecidos');

    // Teste com muitos símbolos
    const manySymbols = Array.from({ length: 150 }, (_, i) => `SYMBOL${i}`);
    await expect(
      cryptoService.getPrices({ symbols: manySymbols, currency: 'USD' })
    ).rejects.toThrow('Máximo de 100 símbolos por requisição');

    // Teste com símbolos inválidos
    await expect(
      cryptoService.getPrices({ symbols: ['BTC-USD', 'ETH@'], currency: 'USD' })
    ).rejects.toThrow('Símbolos inválidos');
  });

  it('deve lidar com erros de API', async () => {
    // Primeiro mock para inicialização (verificação de disponibilidade)
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        symbols: [
          {
            symbol: 'BTC',
            last: '45000',
            last_btc: '1.0',
            lowest: '44000',
            highest: '46000',
            date: '2024-01-01 12:00:46',
            daily_change_percentage: '2.27',
            source_exchange: 'binance'
          }
        ]
      })
    });

    cryptoService = await createCryptoPriceService({
      defaultProvider: CryptoPriceProviderType.FREECRYPTOAPI,
      providers: {
        [CryptoPriceProviderType.FREECRYPTOAPI]: {
          baseUrl: 'https://api.freecryptoapi.com',
          apiKey: 'test-key',
          timeout: 5000
        }
      }
    });

    // Agora mock de erro de API para a requisição real
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    });

    const response = await cryptoService.getPrices({
      symbols: ['BTC'],
      currency: 'USD'
    });

    expect(response.success).toBe(false);
    expect(response.errors).toBeDefined();
    expect(response.errors?.[0]).toContain('HTTP 429');
  });

  it('deve retornar lista de providers disponíveis', async () => {
    cryptoService = await createCryptoPriceService({
      defaultProvider: CryptoPriceProviderType.FREECRYPTOAPI,
      providers: {
        [CryptoPriceProviderType.FREECRYPTOAPI]: {
          baseUrl: 'https://api.freecryptoapi.com',
          apiKey: 'test-key',
          timeout: 5000
        }
      }
    });

    const availableProviders = cryptoService.getAvailableProviders();
    expect(availableProviders).toContain(CryptoPriceProviderType.FREECRYPTOAPI);
  });
});

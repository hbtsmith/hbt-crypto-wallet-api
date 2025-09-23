/**
 * Módulo de preços de cripto
 * Exporta todas as classes e tipos necessários para usar o serviço
 */

// Tipos e interfaces
export * from './types';

// Configurações e constantes
export * from './config';

// Factory para providers
export * from './CryptoPriceProviderFactory';

// Serviço principal
export * from './CryptoPriceService';

// Providers específicos
export * from './providers/FreeCryptoAPIProvider';
export * from './providers/CoinMarketCapProvider';
export * from './providers/CoinGeckoProvider';

// Instância singleton do serviço (opcional)
import { CryptoPriceService } from './CryptoPriceService';
import { DEFAULT_CRYPTO_PRICE_CONFIG } from './config';

let cryptoPriceServiceInstance: CryptoPriceService | null = null;

/**
 * Obtém a instância singleton do CryptoPriceService
 */
export const getCryptoPriceService = async (): Promise<CryptoPriceService> => {
  if (!cryptoPriceServiceInstance) {
    cryptoPriceServiceInstance = new CryptoPriceService(DEFAULT_CRYPTO_PRICE_CONFIG);
    await cryptoPriceServiceInstance.initialize();
  }
  return cryptoPriceServiceInstance;
};

/**
 * Reseta a instância do CryptoPriceService
 */
export const resetCryptoPriceService = (): void => {
  cryptoPriceServiceInstance = null;
};

/**
 * Cria uma nova instância do CryptoPriceService
 */
export const createCryptoPriceService = async (
  config?: Partial<import('./types').CryptoPriceServiceConfig>
): Promise<CryptoPriceService> => {
  const service = new CryptoPriceService(config);
  await service.initialize();
  return service;
};

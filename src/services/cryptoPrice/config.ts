import { 
  CryptoPriceServiceConfig, 
  CryptoPriceProviderType, 
  CryptoPriceProviderConfig 
} from './types';

/**
 * Configurações padrão para o serviço de preços de cripto
 */
export const DEFAULT_CRYPTO_PRICE_CONFIG: CryptoPriceServiceConfig = {
  defaultProvider: CryptoPriceProviderType.COINGECKO,
  fallbackProviders: [
    CryptoPriceProviderType.FREECRYPTOAPI,
    CryptoPriceProviderType.COINMARKETCAP
  ],
  providers: {
    [CryptoPriceProviderType.FREECRYPTOAPI]: {
      baseUrl: 'https://api.freecryptoapi.com',
      apiKey: process.env.FREECRYPTOAPI_KEY ?? '',
      timeout: 10000,
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerDay: 1000
      }
    },
    [CryptoPriceProviderType.COINMARKETCAP]: {
      baseUrl: 'https://pro-api.coinmarketcap.com',
      apiKey: process.env.COINMARKETCAP_API_KEY ?? '',
      timeout: 10000,
      rateLimit: {
        requestsPerMinute: 30,
        requestsPerDay: 10000
      }
    },
    [CryptoPriceProviderType.COINGECKO]: {
      baseUrl: 'https://api.coingecko.com',
      apiKey: process.env.COINGECKO_API_KEY ?? '', // Opcional para CoinGecko
      timeout: 10000,
      rateLimit: {
        requestsPerMinute: 50,
        requestsPerDay: 10000
      }
    }
  }
};

/**
 * Constantes para o serviço de preços de cripto
 */
export const CRYPTO_PRICE_CONSTANTS = {
  // Timeouts
  DEFAULT_TIMEOUT: 10000,
  HEALTH_CHECK_TIMEOUT: 5000,
  
  // Rate limits
  DEFAULT_RATE_LIMIT: {
    requestsPerMinute: 60,
    requestsPerDay: 1000
  },
  
  // Moedas suportadas
  SUPPORTED_CURRENCIES: ['USD', 'BRL', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
  
  // Símbolos de cripto mais comuns
  COMMON_CRYPTO_SYMBOLS: [
    'BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT', 'DOGE', 
    'AVAX', 'MATIC', 'LINK', 'LTC', 'ATOM', 'NEAR', 'FTM', 
    'ALGO', 'VET', 'ICP', 'FIL', 'TRX'
  ],
  
  // Headers padrão para requisições
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'User-Agent': 'HBT-Crypto-Wallet-API/1.0'
  }
} as const;

/**
 * Mensagens de erro
 */
export const CRYPTO_PRICE_ERRORS = {
  PROVIDER_NOT_AVAILABLE: 'Provider não está disponível',
  PROVIDER_NOT_SUPPORTED: 'Provider não suportado',
  INVALID_SYMBOLS: 'Símbolos inválidos fornecidos',
  RATE_LIMIT_EXCEEDED: 'Limite de taxa excedido',
  TIMEOUT: 'Timeout na requisição',
  NETWORK_ERROR: 'Erro de rede',
  INVALID_RESPONSE: 'Resposta inválida do provider',
  NO_PROVIDERS_AVAILABLE: 'Nenhum provider disponível',
  CONFIGURATION_ERROR: 'Erro de configuração'
} as const;

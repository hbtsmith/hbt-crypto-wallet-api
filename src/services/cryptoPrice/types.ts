/**
 * Tipos e interfaces para o serviço de preços de cripto
 */

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated: Date;
  source: string;
}

export interface CryptoPriceRequest {
  symbols: string[];
  currency?: string; // USD, BRL, etc.
}

export interface CryptoPriceResponse {
  success: boolean;
  data: CryptoPrice[];
  errors?: string[];
  source: string;
  timestamp: Date;
}

export interface CryptoPriceProvider {
  name: string;
  getPrices(request: CryptoPriceRequest): Promise<CryptoPriceResponse>;
  isAvailable(): Promise<boolean>;
}

export interface CryptoPriceProviderConfig {
  apiKey?: string;
  baseUrl: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  timeout?: number;
}

export enum CryptoPriceProviderType {
  FREECRYPTOAPI = 'freecryptoapi',
  COINMARKETCAP = 'coinmarketcap',
  COINGECKO = 'coingecko'
}

export interface CryptoPriceServiceConfig {
  defaultProvider: CryptoPriceProviderType;
  fallbackProviders: CryptoPriceProviderType[];
  providers: {
    [key in CryptoPriceProviderType]?: CryptoPriceProviderConfig;
  };
}

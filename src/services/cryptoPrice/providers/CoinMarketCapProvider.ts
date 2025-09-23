import { 
  CryptoPrice, 
  CryptoPriceRequest, 
  CryptoPriceResponse, 
  CryptoPriceProvider, 
  CryptoPriceProviderConfig 
} from '../types';

/**
 * Provider para CoinMarketCap API
 * Documentação: https://coinmarketcap.com/api/documentation/v1/
 */
export class CoinMarketCapProvider implements CryptoPriceProvider {
  public readonly name = 'CoinMarketCap';
  private config: CryptoPriceProviderConfig;

  constructor(config: CryptoPriceProviderConfig) {
    this.config = config;
  }

  async getPrices(request: CryptoPriceRequest): Promise<CryptoPriceResponse> {
    try {
      const symbols = request.symbols.join(',');
      const currency = request.currency || 'USD';
      
      const url = `${this.config.baseUrl}/v1/cryptocurrency/quotes/latest`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-CMC_PRO_API_KEY': this.config.apiKey || '',
          'User-Agent': 'HBT-Crypto-Wallet-API/1.0'
        },
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data) {
        throw new Error('Invalid response format from CoinMarketCap');
      }

      const cryptoPrices: CryptoPrice[] = Object.values(data.data).map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        price: item.quote[currency].price,
        priceChange24h: item.quote[currency].price_change_24h,
        priceChangePercentage24h: item.quote[currency].percent_change_24h,
        marketCap: item.quote[currency].market_cap,
        volume24h: item.quote[currency].volume_24h,
        lastUpdated: new Date(item.last_updated),
        source: this.name
      }));

      return {
        success: true,
        data: cryptoPrices,
        source: this.name,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        source: this.name,
        timestamp: new Date()
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const testUrl = `${this.config.baseUrl}/v1/key/info`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-CMC_PRO_API_KEY': this.config.apiKey || '',
          'User-Agent': 'HBT-Crypto-Wallet-API/1.0'
        },
        signal: AbortSignal.timeout(5000)
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

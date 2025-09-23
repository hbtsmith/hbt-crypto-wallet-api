import { 
  CryptoPrice, 
  CryptoPriceRequest, 
  CryptoPriceResponse, 
  CryptoPriceProvider, 
  CryptoPriceProviderConfig 
} from '../types';

/**
 * Provider para FreeCryptoAPI
 * Documentação: https://freecryptoapi.com/
 */
export class FreeCryptoAPIProvider implements CryptoPriceProvider {
  public readonly name = 'FreeCryptoAPI';
  private config: CryptoPriceProviderConfig;

  constructor(config: CryptoPriceProviderConfig) {
    this.config = config;
  }

  async getPrices(request: CryptoPriceRequest): Promise<CryptoPriceResponse> {
    try {
      const symbols = request.symbols.join('%20');
      const currency = request.currency || 'USD';
      
      const url = `${this.config.baseUrl}/v1/getData?symbol=${symbols}&convert=${currency}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HBT-Crypto-Wallet-API/1.0',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.symbols || !Array.isArray(data.symbols)) {
        throw new Error('Invalid response format from FreeCryptoAPI');
      }

      const cryptoPrices: CryptoPrice[] = data.symbols.map((item: any) => ({
        symbol: item.symbol,
        name: item.symbol, // FreeCryptoAPI não fornece nome, usando symbol
        price: parseFloat(item.last),
        priceChange24h: 0, // FreeCryptoAPI não fornece mudança absoluta
        priceChangePercentage24h: parseFloat(item.daily_change_percentage),
        marketCap: undefined, // FreeCryptoAPI não fornece market cap
        volume24h: undefined, // FreeCryptoAPI não fornece volume
        lastUpdated: new Date(item.date),
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
      const testUrl = `${this.config.baseUrl}/v1/getData?symbol=BTC`;

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HBT-Crypto-Wallet-API/1.0',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'success' && Array.isArray(data.symbols);
    } catch {
      return false;
    }
  }
}

import { 
  CryptoPrice, 
  CryptoPriceRequest, 
  CryptoPriceResponse, 
  CryptoPriceProvider, 
  CryptoPriceProviderConfig 
} from '../types';

/**
 * Interface para o cache de mapeamento de símbolos
 */
interface SymbolCache {
  data: Record<string, string>;
  lastUpdated: Date;
  ttl: number; // em milissegundos
}

/**
 * Provider para CoinGecko API
 * Documentação: https://www.coingecko.com/en/api/documentation
 */
export class CoinGeckoProvider implements CryptoPriceProvider {
  public readonly name = 'CoinGecko';
  private config: CryptoPriceProviderConfig;
  private symbolCache: SymbolCache | null = null;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

  constructor(config: CryptoPriceProviderConfig) {
    this.config = config;
  }

  async getPrices(request: CryptoPriceRequest): Promise<CryptoPriceResponse> {
    try {
      const currency = (request.currency || 'usd').toLowerCase();
      
      // CoinGecko usa IDs ao invés de símbolos, então precisamos mapear
      const symbolToIdMap = await this.getSymbolToIdMap();
      const ids = request.symbols
        .map(symbol => symbolToIdMap[symbol.toLowerCase()])
        .filter(Boolean)
        .join(',');

      if (!ids) {
        throw new Error('No valid coin IDs found for the provided symbols');
      }
      const url = `${this.config.baseUrl}/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HBT-Crypto-Wallet-API/1.0'
        },
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || Object.keys(data).length === 0) {
        throw new Error('Invalid response format from CoinGecko');
      }

      const cryptoPrices: CryptoPrice[] = Object.entries(data).map(([id, item]: [string, any]) => {
        const symbol = this.getIdToSymbolMap()[id];
        
        return {
          symbol: symbol || id.toUpperCase(),
          name: symbol || id,
          price: item[currency] || 0,
          priceChange24h: item[`${currency}_24h_change`] || 0,
          priceChangePercentage24h: item[`${currency}_24h_change`] || 0,
          marketCap: item[`${currency}_market_cap`] || 0,
          volume24h: item[`${currency}_24h_vol`] || 0,
          lastUpdated: new Date(),
          source: this.name
        };
      });

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
      const testUrl = `${this.config.baseUrl}/api/v3/ping`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HBT-Crypto-Wallet-API/1.0'
        },
        signal: AbortSignal.timeout(5000)
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Limpa o cache de símbolos, forçando uma nova busca na próxima requisição
   */
  public clearSymbolCache(): void {
    this.symbolCache = null;
    // console.log('Cache de símbolos limpo');
  }

  /**
   * Força a atualização do cache de símbolos
   */
  public async forceRefreshSymbolCache(): Promise<void> {
    await this.refreshSymbolCache();
  }

  /**
   * Obtém informações sobre o cache atual
   */
  public getCacheInfo(): { isValid: boolean; lastUpdated?: Date; size: number } {
    const info: { isValid: boolean; lastUpdated?: Date; size: number } = {
      isValid: this.isCacheValid(),
      size: 0
    };

    if (this.symbolCache) {
      info.lastUpdated = this.symbolCache.lastUpdated;
      info.size = Object.keys(this.symbolCache.data).length;
    }

    return info;
  }

  /**
   * Obtém o mapeamento de símbolos para IDs do CoinGecko
   * Utiliza cache em memória com TTL de 24 horas
   */
  private async getSymbolToIdMap(): Promise<Record<string, string>> {
    // Verifica se o cache é válido
    if (this.isCacheValid()) {
      return this.symbolCache!.data;
    }

    // Cache expirado ou não existe, busca da API
    try {
      await this.refreshSymbolCache();
      return this.symbolCache!.data;
    } catch (error) {
      console.warn('Falha ao buscar mapeamento de símbolos da API, usando cache local:', error);
      
      // Se falhar, usa mapeamento básico como fallback
      return this.getBasicSymbolToIdMap();
    }
  }

  /**
   * Verifica se o cache é válido (não expirado)
   */
  private isCacheValid(): boolean {
    if (!this.symbolCache) {
      return false;
    }

    const now = new Date();
    const cacheAge = now.getTime() - this.symbolCache.lastUpdated.getTime();
    return cacheAge < this.symbolCache.ttl;
  }

  /**
   * Atualiza o cache de símbolos buscando da API do CoinGecko
   */
  private async refreshSymbolCache(): Promise<void> {
    try {
      const url = `${this.config.baseUrl}/api/v3/coins/list`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HBT-Crypto-Wallet-API/1.0'
        },
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const coins: Array<{ id: string; symbol: string; name: string }> = await response.json();
      
      if (!Array.isArray(coins) || coins.length === 0) {
        throw new Error('Resposta inválida da API do CoinGecko');
      }

      // Cria o mapeamento de símbolo para ID
      const symbolToIdMap: Record<string, string> = {};
      
      // Lista de IDs prioritários (tokens mais populares)
      const priorityIds = new Set([
        'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'ripple', 
        'polkadot', 'dogecoin', 'avalanche-2', 'matic-network', 'chainlink',
        'litecoin', 'cosmos', 'near', 'fantom', 'algorand', 'vechain',
        'internet-computer', 'filecoin', 'tron', 'uniswap', 'aave',
        'compound-governance-token', 'maker', 'sushi', 'yearn-finance',
        'curve-dao-token', 'balancer', 'synthetix-network-token'
      ]);
      
      // Primeiro, adiciona tokens prioritários
      coins.forEach(coin => {
        if (coin.symbol && coin.id && priorityIds.has(coin.id)) {
          const symbol = coin.symbol.toLowerCase();
          symbolToIdMap[symbol] = coin.id;
        }
      });
      
      // Depois, adiciona outros tokens (apenas se não existir um prioritário)
      coins.forEach(coin => {
        if (coin.symbol && coin.id) {
          const symbol = coin.symbol.toLowerCase();
          if (!symbolToIdMap[symbol]) {
            symbolToIdMap[symbol] = coin.id;
          }
        }
      });

      // Atualiza o cache
      this.symbolCache = {
        data: symbolToIdMap,
        lastUpdated: new Date(),
        ttl: this.CACHE_TTL
      };

      // console.log(`Cache de símbolos atualizado com ${Object.keys(symbolToIdMap).length} mapeamentos`);

    } catch (error) {
      throw new Error(`Erro ao atualizar cache de símbolos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Mapeamento básico de símbolos para IDs do CoinGecko (fallback)
   */
  private getBasicSymbolToIdMap(): Record<string, string> {
    return {
      'btc': 'bitcoin',
      'eth': 'ethereum',
      'bnb': 'binancecoin',
      'ada': 'cardano',
      'sol': 'solana',
      'xrp': 'ripple',
      'dot': 'polkadot',
      'doge': 'dogecoin',
      'avax': 'avalanche-2',
      'matic': 'matic-network',
      'link': 'chainlink',
      'ltc': 'litecoin',
      'atom': 'cosmos',
      'near': 'near',
      'ftm': 'fantom',
      'algo': 'algorand',
      'vet': 'vechain',
      'icp': 'internet-computer',
      'fil': 'filecoin',
      'trx': 'tron'
    };
  }

  private getIdToSymbolMap(): Record<string, string> {
    return {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binancecoin': 'BNB',
      'cardano': 'ADA',
      'solana': 'SOL',
      'ripple': 'XRP',
      'polkadot': 'DOT',
      'dogecoin': 'DOGE',
      'avalanche-2': 'AVAX',
      'matic-network': 'MATIC',
      'chainlink': 'LINK',
      'litecoin': 'LTC',
      'cosmos': 'ATOM',
      'near': 'NEAR',
      'fantom': 'FTM',
      'algorand': 'ALGO',
      'vechain': 'VET',
      'internet-computer': 'ICP',
      'filecoin': 'FIL',
      'tron': 'TRX'
    };
  }
}

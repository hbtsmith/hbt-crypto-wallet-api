import { 
  CryptoPriceProvider, 
  CryptoPriceProviderType, 
  CryptoPriceProviderConfig 
} from './types';
import { FreeCryptoAPIProvider } from './providers/FreeCryptoAPIProvider';
import { CoinMarketCapProvider } from './providers/CoinMarketCapProvider';
import { CoinGeckoProvider } from './providers/CoinGeckoProvider';

/**
 * Factory para criar instâncias de providers de preços de cripto
 */
export class CryptoPriceProviderFactory {
  private static providers: Map<CryptoPriceProviderType, CryptoPriceProvider> = new Map();

  /**
   * Cria uma instância do provider especificado
   */
  static createProvider(
    type: CryptoPriceProviderType, 
    config: CryptoPriceProviderConfig
  ): CryptoPriceProvider {
    // Verifica se já existe uma instância em cache
    if (this.providers.has(type)) {
      return this.providers.get(type)!;
    }

    let provider: CryptoPriceProvider;

    switch (type) {
      case CryptoPriceProviderType.FREECRYPTOAPI:
        provider = new FreeCryptoAPIProvider(config);
        break;
      
      case CryptoPriceProviderType.COINMARKETCAP:
        provider = new CoinMarketCapProvider(config);
        break;
      
      case CryptoPriceProviderType.COINGECKO:
        provider = new CoinGeckoProvider(config);
        break;
      
      default:
        throw new Error(`Provider não suportado: ${type}`);
    }

    // Cacheia a instância
    this.providers.set(type, provider);
    return provider;
  }

  /**
   * Obtém uma instância existente do provider
   */
  static getProvider(type: CryptoPriceProviderType): CryptoPriceProvider | undefined {
    return this.providers.get(type);
  }

  /**
   * Remove uma instância do cache
   */
  static removeProvider(type: CryptoPriceProviderType): boolean {
    return this.providers.delete(type);
  }

  /**
   * Limpa todos os providers do cache
   */
  static clearProviders(): void {
    this.providers.clear();
  }

  /**
   * Lista todos os providers disponíveis
   */
  static getAvailableProviders(): CryptoPriceProviderType[] {
    return Object.values(CryptoPriceProviderType);
  }

  /**
   * Verifica se um provider está disponível
   */
  static async isProviderAvailable(
    type: CryptoPriceProviderType, 
    config: CryptoPriceProviderConfig
  ): Promise<boolean> {
    try {
      const provider = this.createProvider(type, config);
      return await provider.isAvailable();
    } catch {
      return false;
    }
  }
}

import { 
  CryptoPrice, 
  CryptoPriceRequest, 
  CryptoPriceResponse, 
  CryptoPriceProvider, 
  CryptoPriceProviderType, 
  CryptoPriceServiceConfig 
} from './types';
import { CryptoPriceProviderFactory } from './CryptoPriceProviderFactory';
import { DEFAULT_CRYPTO_PRICE_CONFIG, CRYPTO_PRICE_ERRORS } from './config';

/**
 * Serviço principal para consulta de preços de cripto
 * Gerencia múltiplos providers com fallback automático
 */
export class CryptoPriceService {
  private config: CryptoPriceServiceConfig;
  private currentProvider: CryptoPriceProviderType;
  private availableProviders: CryptoPriceProviderType[] = [];

  constructor(config?: Partial<CryptoPriceServiceConfig>) {
    this.config = { ...DEFAULT_CRYPTO_PRICE_CONFIG, ...config };
    this.currentProvider = this.config.defaultProvider;
  }

  /**
   * Inicializa o serviço verificando providers disponíveis
   */
  async initialize(): Promise<void> {
    // console.log('🚀 Inicializando CryptoPriceService...');
    
    // Verifica disponibilidade de todos os providers
    const providerChecks = await Promise.allSettled(
      Object.keys(this.config.providers).map(async (providerType) => {
        const type = providerType as CryptoPriceProviderType;
        const providerConfig = this.config.providers[type];
        
        if (!providerConfig) return false;

        const isAvailable = await CryptoPriceProviderFactory.isProviderAvailable(type, providerConfig);

        if (isAvailable) {
          this.availableProviders.push(type);
        }
        return isAvailable;
      })
    );
    
    // Se o provider padrão não estiver disponível, usa o primeiro disponível
    if (!this.availableProviders.includes(this.currentProvider)) {
      if (this.availableProviders.length > 0) {
        this.currentProvider = this.availableProviders[0] as CryptoPriceProviderType;
        // console.log(`⛔ Provider padrão não disponível. Usando: ${this.currentProvider}`);
      } else {
        throw new Error(CRYPTO_PRICE_ERRORS.NO_PROVIDERS_AVAILABLE);
      }
    }

    // console.log(`✅ CryptoPriceService inicializado com provider: ${this.currentProvider}`);
    // console.log(`✅ Providers disponíveis: ${this.availableProviders.join(', ')}`);
  }

  /**
   * Obtém preços de cripto usando o provider atual
   */
  async getPrices(request: CryptoPriceRequest): Promise<CryptoPriceResponse> {
    if (!this.availableProviders.length) {
      throw new Error(CRYPTO_PRICE_ERRORS.NO_PROVIDERS_AVAILABLE);
    }

    // Valida a requisição
    this.validateRequest(request);

    // Tenta com o provider atual
    let response = await this.tryProvider(this.currentProvider, request);

    // Se falhar, tenta com providers de fallback
    if (!response.success && this.config.fallbackProviders.length > 0) {
      for (const fallbackProvider of this.config.fallbackProviders) {
        if (this.availableProviders.includes(fallbackProvider)) {
        //   console.log(`🔎 Tentando provider de fallback: ${fallbackProvider}`);
          response = await this.tryProvider(fallbackProvider, request);
          
          if (response.success) {
            // Atualiza o provider atual para o que funcionou
            this.currentProvider = fallbackProvider;
            break;
          }
        }
      }
    }

    return response;
  }

  /**
   * Obtém preços usando um provider específico
   */
  async getPricesWithProvider(
    providerType: CryptoPriceProviderType, 
    request: CryptoPriceRequest
  ): Promise<CryptoPriceResponse> {
    this.validateRequest(request);
    
    if (!this.availableProviders.includes(providerType)) {
      throw new Error(`${CRYPTO_PRICE_ERRORS.PROVIDER_NOT_AVAILABLE}: ${providerType}`);
    }

    return await this.tryProvider(providerType, request);
  }

  /**
   * Obtém preços de um único token
   */
  async getPrice(symbol: string, currency: string = 'USD'): Promise<CryptoPrice | null> {
    const response = await this.getPrices({
      symbols: [symbol.toUpperCase()],
      currency
    });

    return response.success && response.data.length > 0 ? response.data[0] ?? null : null;
  }

  /**
   * Obtém preços de múltiplos tokens
   */
  async getMultiplePrices(symbols: string[], currency: string = 'USD'): Promise<CryptoPrice[]> {
    const response = await this.getPrices({
      symbols: symbols.map(s => s.toUpperCase()),
      currency
    });

    return response.success ? response.data : [];
  }

  /**
   * Obtém informações sobre o provider atual
   */
  getCurrentProvider(): CryptoPriceProviderType {
    return this.currentProvider;
  }

  /**
   * Obtém lista de providers disponíveis
   */
  getAvailableProviders(): CryptoPriceProviderType[] {
    return [...this.availableProviders];
  }

  /**
   * Altera o provider atual
   */
  async setProvider(providerType: CryptoPriceProviderType): Promise<void> {
    if (!this.availableProviders.includes(providerType)) {
      throw new Error(`${CRYPTO_PRICE_ERRORS.PROVIDER_NOT_AVAILABLE}: ${providerType}`);
    }

    this.currentProvider = providerType;
    // console.log(`🔄 Provider alterado para: ${providerType}`);
  }

  /**
   * Verifica se um provider está disponível
   */
  async isProviderAvailable(providerType: CryptoPriceProviderType): Promise<boolean> {
    return this.availableProviders.includes(providerType);
  }

  /**
   * Tenta obter preços usando um provider específico
   */
  private async tryProvider(
    providerType: CryptoPriceProviderType, 
    request: CryptoPriceRequest
  ): Promise<CryptoPriceResponse> {
    try {
      const providerConfig = this.config.providers[providerType];
      if (!providerConfig) {
        throw new Error(`${CRYPTO_PRICE_ERRORS.PROVIDER_NOT_SUPPORTED}: ${providerType}`);
      }

      const provider = CryptoPriceProviderFactory.createProvider(providerType, providerConfig);
      return await provider.getPrices(request);
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        source: providerType,
        timestamp: new Date()
      };
    }
  }

  /**
   * Valida a requisição de preços
   */
  private validateRequest(request: CryptoPriceRequest): void {
    if (!request.symbols || request.symbols.length === 0) {
      throw new Error(CRYPTO_PRICE_ERRORS.INVALID_SYMBOLS);
    }

    if (request.symbols.length > 100) {
      throw new Error('Máximo de 100 símbolos por requisição');
    }

    // Valida se os símbolos são válidos (apenas letras e números)
    const invalidSymbols = request.symbols.filter(symbol => 
      !/^[A-Z0-9]+$/.test(symbol)
    );

    if (invalidSymbols.length > 0) {
      throw new Error(`Símbolos inválidos: ${invalidSymbols.join(', ')}`);
    }
  }
}

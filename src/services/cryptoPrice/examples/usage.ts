/**
 * Exemplos de uso do CryptoPriceService
 * Este arquivo demonstra como usar o serviço de preços de cripto
 */

import { 
  getCryptoPriceService, 
  createCryptoPriceService,
  CryptoPriceProviderType 
} from '../index';

/**
 * Exemplo básico de uso
 */
export async function basicUsageExample() {
  try {
    // Obtém a instância singleton do serviço
    const cryptoService = await getCryptoPriceService();
    
    // Obtém preço de um único token
    const btcPrice = await cryptoService.getPrice('BTC', 'USD');
    console.log('Preço do BTC:', btcPrice);
    
    // Obtém preços de múltiplos tokens
    const prices = await cryptoService.getMultiplePrices(['BTC', 'ETH', 'ADA'], 'USD');
    console.log('Preços:', prices);
    
    // Obtém preços usando requisição completa
    const response = await cryptoService.getPrices({
      symbols: ['BTC', 'ETH', 'SOL'],
      currency: 'USD'
    });
    
    if (response.success) {
      console.log('Dados obtidos com sucesso:', response.data);
    } else {
      console.error('Erros:', response.errors);
    }
    
  } catch (error) {
    console.error('Erro ao obter preços:', error);
  }
}

/**
 * Exemplo com provider específico
 */
export async function specificProviderExample() {
  try {
    const cryptoService = await getCryptoPriceService();
    
    // Força o uso do CoinGecko
    await cryptoService.setProvider(CryptoPriceProviderType.COINGECKO);
    
    const prices = await cryptoService.getPricesWithProvider(
      CryptoPriceProviderType.COINGECKO,
      {
        symbols: ['BTC', 'ETH'],
        currency: 'USD'
      }
    );
    
    console.log('Preços do CoinGecko:', prices);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

/**
 * Exemplo com configuração customizada
 */
export async function customConfigExample() {
  try {
    // Cria uma instância com configuração customizada
    const cryptoService = await createCryptoPriceService({
      defaultProvider: CryptoPriceProviderType.COINGECKO,
      fallbackProviders: [CryptoPriceProviderType.FREECRYPTOAPI],
      providers: {
        [CryptoPriceProviderType.COINGECKO]: {
          baseUrl: 'https://api.coingecko.com',
          timeout: 15000,
          rateLimit: {
            requestsPerMinute: 30,
            requestsPerDay: 5000
          }
        }
      }
    });
    
    const prices = await cryptoService.getMultiplePrices(['BTC', 'ETH'], 'BRL');
    console.log('Preços em BRL:', prices);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

/**
 * Exemplo de monitoramento de providers
 */
export async function providerMonitoringExample() {
  try {
    const cryptoService = await getCryptoPriceService();
    
    // Lista providers disponíveis
    const availableProviders = cryptoService.getAvailableProviders();
    console.log('Providers disponíveis:', availableProviders);
    
    // Verifica provider atual
    const currentProvider = cryptoService.getCurrentProvider();
    console.log('Provider atual:', currentProvider);
    
    // Verifica se um provider específico está disponível
    const isCoinGeckoAvailable = await cryptoService.isProviderAvailable(
      CryptoPriceProviderType.COINGECKO
    );
    console.log('CoinGecko disponível:', isCoinGeckoAvailable);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

/**
 * Exemplo de tratamento de erros
 */
export async function errorHandlingExample() {
  try {
    const cryptoService = await getCryptoPriceService();
    
    // Tenta obter preços com símbolos inválidos
    try {
      await cryptoService.getPrices({
        symbols: ['INVALID_SYMBOL_123'],
        currency: 'USD'
      });
    } catch (error) {
      console.log('Erro esperado capturado:', error instanceof Error ? error.message : String(error));
    }
    
    // Tenta obter preços de muitos símbolos
    try {
      const manySymbols = Array.from({ length: 150 }, (_, i) => `SYMBOL${i}`);
      await cryptoService.getPrices({
        symbols: manySymbols,
        currency: 'USD'
      });
    } catch (error) {
      console.log('Erro de limite capturado:', error instanceof Error ? error.message : String(error));
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

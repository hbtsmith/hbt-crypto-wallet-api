/**
 * Exemplo simples para testar o CryptoPriceService
 * Execute com: npx ts-node src/services/cryptoPrice/examples/simple-test.ts
 */

// Carrega as variáveis de ambiente
import 'dotenv/config';
import { getCryptoPriceService, DEFAULT_CRYPTO_PRICE_CONFIG } from '../index';

async function testCryptoPriceService() {
  console.log('🚀 Iniciando teste do CryptoPriceService...\n');

  // Mostra configuração atual
  console.log('🔧 Configuração atual:');
  console.log(`  Provider padrão: ${DEFAULT_CRYPTO_PRICE_CONFIG.defaultProvider}`);
  console.log(`  Providers de fallback: ${DEFAULT_CRYPTO_PRICE_CONFIG.fallbackProviders.join(', ')}`);
  console.log(`  FREECRYPTOAPI_KEY configurada: ${process.env.FREECRYPTOAPI_KEY ? '✅ Sim' : '❌ Não'}`);
  console.log(`  COINMARKETCAP_API_KEY configurada: ${process.env.COINMARKETCAP_API_KEY ? '✅ Sim' : '❌ Não'}`);
  console.log(`  COINGECKO_API_KEY configurada: ${process.env.COINGECKO_API_KEY ? '✅ Sim' : '❌ Não'}\n`);

  try {
    // Obtém a instância do serviço
    console.log('📡 Inicializando serviço...');
    const cryptoService = await getCryptoPriceService();
    
    console.log(`✅ Serviço inicializado com provider: ${cryptoService.getCurrentProvider()}`);
    console.log(`📋 Providers disponíveis: ${cryptoService.getAvailableProviders().join(', ')}\n`);

    // // Teste 1: Preço de um token
    console.log('🔍 Teste 1: Obtendo preço do BTC...');
    const btcPrice = await cryptoService.getPrice('BTC', 'USD');
    console.log("#### btcPrice: ",btcPrice);
    if (btcPrice) {
      console.log(`💰 BTC: $${btcPrice.price.toFixed(2)} (${btcPrice.priceChangePercentage24h?.toFixed(2)}% em 24h)`);
    } else {
      console.log('❌ Não foi possível obter o preço do BTC');
    }

    // // Teste 2: Múltiplos tokens
    console.log('\n🔍 Teste 2: Obtendo preços de múltiplos tokens...');
    const prices = await cryptoService.getMultiplePrices(['BTC', 'ETH', 'ADA'], 'USD');
    console.log("#### prices: ",prices);
    if (prices.length > 0) {
      console.log('📊 Preços obtidos:');
      prices.forEach(price => {
        console.log(`  ${price.symbol}: $${price.price.toFixed(2)} (${price.priceChangePercentage24h?.toFixed(2)}% em 24h)`);
      });
    } else {
      console.log('❌ Não foi possível obter os preços');
    }

    // // Teste 3: Requisição completa
    console.log('\n🔍 Teste 3: Requisição completa...');
    const response = await cryptoService.getPrices({
      symbols: ['BTC', 'ETH'],
      currency: 'USD'
    });

    if (response.success) {
      console.log(`✅ Sucesso! ${response.data.length} preços obtidos de ${response.source}`);
      console.log(`⏰ Timestamp: ${response.timestamp.toISOString()}`);
    } else {
      console.log('❌ Falha na requisição:');
      response.errors?.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🎉 Teste concluído com sucesso!');

  } catch (error) {
    console.error('💥 Erro durante o teste:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Executa o teste
testCryptoPriceService();

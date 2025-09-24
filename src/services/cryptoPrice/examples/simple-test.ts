/**
 * Exemplo simples para testar o CryptoPriceService
 * Execute com: npx ts-node src/services/cryptoPrice/examples/simple-test.ts
 */

// Carrega as variáveis de ambiente
import 'dotenv/config';
import { getCryptoPriceService, DEFAULT_CRYPTO_PRICE_CONFIG } from '../index';

async function testCryptoPriceService() {
  console.log('🚀 Starting test of CryptoPriceService...\n');

  // Mostra configuração atual
  console.log('🔧 Current configuration:');
  console.log(`  Default provider: ${DEFAULT_CRYPTO_PRICE_CONFIG.defaultProvider}`);
  console.log(`  Fallback providers: ${DEFAULT_CRYPTO_PRICE_CONFIG.fallbackProviders.join(', ')}`);
  console.log(`  FREECRYPTOAPI_KEY configured: ${process.env.FREECRYPTOAPI_KEY ? '✅ Yes' : '❌ No'}`);
  console.log(`  COINMARKETCAP_API_KEY configured: ${process.env.COINMARKETCAP_API_KEY ? '✅ Yes' : '❌ No'}`);
  console.log(`  COINMARKETCAP_API_KEY configured: ${process.env.COINMARKETCAP_API_KEY ? '✅ Yes' : '❌ No'}`);
  console.log(`  COINGECKO_API_KEY configured: ${process.env.COINGECKO_API_KEY ? '✅ Yes' : '❌ No'}\n`);

  try {
    // Obtém a instância do serviço
    console.log('📡 Initializing service...');
    const cryptoService = await getCryptoPriceService();
    
    console.log(`✅ Service initialized with provider: ${cryptoService.getCurrentProvider()}`);
    console.log(`📋 Available providers: ${cryptoService.getAvailableProviders().join(', ')}\n`);

    // // Teste 1: Preço de um token
    console.log('🔍 Teste 1: Getting BTC price...');
    const btcPrice = await cryptoService.getPrice('BTC', 'USD');
    console.log("#### btcPrice: ",btcPrice);
    if (btcPrice) {
      console.log(`💰 BTC: $${btcPrice.price.toFixed(2)} (${btcPrice.priceChangePercentage24h?.toFixed(2)}% em 24h)`);
    } else {
      console.log('❌ Failed to get BTC price');
    }

    // // Teste 2: Múltiplos tokens
    console.log('\n🔍 Teste 2: Getting multiple tokens prices...');
    const prices = await cryptoService.getMultiplePrices(['BTC', 'ETH', 'ADA'], 'USD');
    console.log("#### prices: ",prices);
    if (prices.length > 0) {
      console.log('📊 Prices obtained:');
      prices.forEach(price => {
        console.log(`  ${price.symbol}: $${price.price.toFixed(2)} (${price.priceChangePercentage24h?.toFixed(2)}% em 24h)`);
      });
    } else {
      console.log('❌ Failed to get prices');
    }

    // // Teste 3: Requisição completa
    console.log('\n🔍 Teste 3: Complete request...');
    const response = await cryptoService.getPrices({
      symbols: ['BTC', 'ETH'],
      currency: 'USD'
    });

    if (response.success) {
      console.log(`✅ Sucesso! ${response.data.length} preços obtidos de ${response.source}`);
      console.log(`⏰ Timestamp: ${response.timestamp.toISOString()}`);
    } else {
      console.log('❌ Failed request:');
      response.errors?.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('💥 Error during test:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Executa o teste
testCryptoPriceService();

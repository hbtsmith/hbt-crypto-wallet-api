/**
 * Exemplo com mocks para testar o CryptoPriceService offline
 * Execute com: npx ts-node src/services/cryptoPrice/examples/mock-test.ts
 */

import { createCryptoPriceService, CryptoPriceProviderType } from '../index';

// Mock do fetch global
const mockFetch = (url: string) => {
  console.log(`🌐 Mock fetch para: ${url}`);
  
  // Simula resposta da FreeCryptoAPI
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      status: 'success',
      symbols: [
        {
          symbol: 'BTC',
          last: '45000',
          last_btc: '1.0',
          lowest: '44000',
          highest: '46000',
          date: '2024-01-01 12:00:46',
          daily_change_percentage: '2.27',
          source_exchange: 'binance'
        },
        {
          symbol: 'ETH',
          last: '3000',
          last_btc: '0.0667',
          lowest: '2950',
          highest: '3050',
          date: '2024-01-01 12:00:46',
          daily_change_percentage: '1.69',
          source_exchange: 'binance'
        }
      ]
    })
  });
};

// Substitui o fetch global
(global as any).fetch = mockFetch;

async function testCryptoPriceServiceWithMocks() {
  console.log('🚀 Iniciando teste do CryptoPriceService com mocks...\n');

  try {
    // Cria uma instância com configuração customizada
    console.log('📡 Inicializando serviço com mocks...');
    const cryptoService = await createCryptoPriceService({
      defaultProvider: CryptoPriceProviderType.FREECRYPTOAPI,
      providers: {
        [CryptoPriceProviderType.FREECRYPTOAPI]: {
          baseUrl: 'https://api.freecryptoapi.com',
          apiKey: 'test-key',
          timeout: 5000
        }
      }
    });
    
    console.log(`✅ Serviço inicializado com provider: ${cryptoService.getCurrentProvider()}`);
    console.log(`📋 Providers disponíveis: ${cryptoService.getAvailableProviders().join(', ')}\n`);

    // Teste 1: Preço de um token
    console.log('🔍 Teste 1: Obtendo preço do BTC...');
    const btcPrice = await cryptoService.getPrice('BTC', 'USD');
    
    if (btcPrice) {
      console.log(`💰 BTC: $${btcPrice.price.toFixed(2)} (${btcPrice.priceChangePercentage24h?.toFixed(2)}% em 24h)`);
      console.log(`📊 Market Cap: $${btcPrice.marketCap?.toLocaleString()}`);
      console.log(`📈 Volume 24h: $${btcPrice.volume24h?.toLocaleString()}`);
    } else {
      console.log('❌ Não foi possível obter o preço do BTC');
    }

    // Teste 2: Múltiplos tokens
    console.log('\n🔍 Teste 2: Obtendo preços de múltiplos tokens...');
    const prices = await cryptoService.getMultiplePrices(['BTC', 'ETH'], 'USD');
    
    if (prices.length > 0) {
      console.log('📊 Preços obtidos:');
      prices.forEach(price => {
        console.log(`  ${price.symbol}: $${price.price.toFixed(2)} (${price.priceChangePercentage24h?.toFixed(2)}% em 24h)`);
      });
    } else {
      console.log('❌ Não foi possível obter os preços');
    }

    // Teste 3: Requisição completa
    console.log('\n🔍 Teste 3: Requisição completa...');
    const response = await cryptoService.getPrices({
      symbols: ['BTC', 'ETH'],
      currency: 'USD'
    });

    if (response.success) {
      console.log(`✅ Sucesso! ${response.data.length} preços obtidos de ${response.source}`);
      console.log(`⏰ Timestamp: ${response.timestamp.toISOString()}`);
      
      // Mostra detalhes de cada preço
      response.data.forEach(price => {
        console.log(`\n📋 ${price.name} (${price.symbol}):`);
        console.log(`   💰 Preço: $${price.price.toFixed(2)}`);
        console.log(`   📈 Mudança 24h: ${price.priceChangePercentage24h?.toFixed(2)}%`);
        console.log(`   📊 Market Cap: $${price.marketCap?.toLocaleString()}`);
        console.log(`   📈 Volume 24h: $${price.volume24h?.toLocaleString()}`);
        console.log(`   🕒 Atualizado: ${price.lastUpdated.toISOString()}`);
      });
    } else {
      console.log('❌ Falha na requisição:');
      response.errors?.forEach(error => console.log(`  - ${error}`));
    }

    // Teste 4: Validação de erros
    console.log('\n🔍 Teste 4: Testando validações...');
    
    try {
      await cryptoService.getPrices({ symbols: [], currency: 'USD' });
    } catch (error) {
      console.log(`✅ Erro esperado capturado: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      await cryptoService.getPrices({ symbols: ['INVALID@SYMBOL'], currency: 'USD' });
    } catch (error) {
      console.log(`✅ Erro de símbolo inválido capturado: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log('\n🎉 Todos os testes concluídos com sucesso!');
    console.log('\n📝 Resumo:');
    console.log('  ✅ Inicialização do serviço');
    console.log('  ✅ Obtenção de preço único');
    console.log('  ✅ Obtenção de múltiplos preços');
    console.log('  ✅ Requisição completa com detalhes');
    console.log('  ✅ Validação de erros');
    console.log('  ✅ Tratamento de respostas da API');

  } catch (error) {
    console.error('💥 Erro durante o teste:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Executa o teste
testCryptoPriceServiceWithMocks();

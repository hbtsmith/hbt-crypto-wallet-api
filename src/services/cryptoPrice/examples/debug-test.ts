/**
 * Teste de debug para investigar problemas com providers
 * Execute com: yarn crypto:test:debug
 */

import { 
  createCryptoPriceService, 
  CryptoPriceProviderType,
  CryptoPriceProviderFactory 
} from '../index';

async function debugProviders() {
  console.log('🔍 Debug dos Providers do CryptoPriceService\n');

  // Testa cada provider individualmente
  const providers = [
    CryptoPriceProviderType.FREECRYPTOAPI,
    CryptoPriceProviderType.COINGECKO,
    CryptoPriceProviderType.COINMARKETCAP
  ];

  for (const providerType of providers) {
    console.log(`\n📡 Testando ${providerType.toUpperCase()}:`);
    console.log('─'.repeat(50));

    try {
      // Cria uma instância do provider
      const provider = CryptoPriceProviderFactory.createProvider(providerType, {
        baseUrl: providerType === CryptoPriceProviderType.FREECRYPTOAPI 
          ? 'https://api.freecryptoapi.com'
          : providerType === CryptoPriceProviderType.COINMARKETCAP
          ? 'https://pro-api.coinmarketcap.com'
          : 'https://api.coingecko.com',
        apiKey: process.env[`${providerType.toUpperCase()}_API_KEY`] || 
                process.env[`${providerType.toUpperCase()}_KEY`] || 
                'test-key',
        timeout: 5000
      });

      // Testa disponibilidade
      console.log(`🔍 Verificando disponibilidade...`);
      const isAvailable = await provider.isAvailable();
      console.log(`   Status: ${isAvailable ? '✅ Disponível' : '❌ Indisponível'}`);

      if (isAvailable) {
        // Testa requisição real
        console.log(`🔍 Testando requisição...`);
        const response = await provider.getPrices({
          symbols: ['BTC'],
          currency: 'USD'
        });

        console.log(`   Sucesso: ${response.success ? '✅' : '❌'}`);
        console.log(`   Dados recebidos: ${response.data.length} itens`);
        
        if (response.data.length > 0) {
          const btc = response.data[0];
          console.log(`   BTC Price: $${btc.price || 'undefined'}`);
          console.log(`   BTC Symbol: ${btc.symbol}`);
          console.log(`   BTC Name: ${btc.name}`);
        }

        if (response.errors && response.errors.length > 0) {
          console.log(`   Erros: ${response.errors.join(', ')}`);
        }
      }

    } catch (error) {
      console.log(`   ❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Testa o serviço completo
  console.log(`\n\n🚀 Testando Serviço Completo:`);
  console.log('─'.repeat(50));

  try {
    const cryptoService = await createCryptoPriceService();
    
    console.log(`✅ Serviço inicializado`);
    console.log(`   Provider atual: ${cryptoService.getCurrentProvider()}`);
    console.log(`   Providers disponíveis: ${cryptoService.getAvailableProviders().join(', ')}`);

    const response = await cryptoService.getPrices({
      symbols: ['BTC'],
      currency: 'USD'
    });

    console.log(`\n📊 Resultado final:`);
    console.log(`   Sucesso: ${response.success ? '✅' : '❌'}`);
    console.log(`   Source: ${response.source}`);
    console.log(`   Dados: ${response.data.length} itens`);
    
    if (response.data.length > 0) {
      const btc = response.data[0];
      console.log(`   BTC: $${btc.price || 'undefined'} (${btc.symbol})`);
    }

    if (response.errors && response.errors.length > 0) {
      console.log(`   Erros: ${response.errors.join(', ')}`);
    }

  } catch (error) {
    console.log(`❌ Erro no serviço: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log(`\n🎯 Resumo:`);
  console.log(`   Para usar FreeCryptoAPI: Configure FREECRYPTOAPI_KEY no .env`);
  console.log(`   Para usar CoinMarketCap: Configure COINMARKETCAP_API_KEY no .env`);
  console.log(`   CoinGecko: Funciona sem chave (com limitações)`);
}

// Executa o debug
debugProviders();

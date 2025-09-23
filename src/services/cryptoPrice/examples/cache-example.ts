import { CoinGeckoProvider } from '../providers/CoinGeckoProvider';

/**
 * Exemplo de uso do cache de símbolos do CoinGeckoProvider
 */
async function demonstrateCacheUsage() {
  // Configuração do provider
  const config = {
    baseUrl: 'https://api.coingecko.com',
    timeout: 10000
  };

  const provider = new CoinGeckoProvider(config);

  console.log('=== Demonstração do Cache de Símbolos ===\n');

  // 1. Primeira chamada - vai buscar da API e criar o cache
  console.log('1. Primeira chamada (vai buscar da API):');
  const start1 = Date.now();
  const response1 = await provider.getPrices({
    symbols: ['btc', 'eth', 'ada', 'sol'],
    currency: 'usd'
  });
  const time1 = Date.now() - start1;
  
  console.log(`   Tempo: ${time1}ms`);
  console.log(`   Sucesso: ${response1.success}`);
  console.log(`   Dados: ${response1.data.length} criptomoedas`);
  console.log(`   Cache info:`, provider.getCacheInfo());
  console.log();

  // 2. Segunda chamada - vai usar o cache (muito mais rápida)
  console.log('2. Segunda chamada (vai usar o cache):');
  const start2 = Date.now();
  const response2 = await provider.getPrices({
    symbols: ['btc', 'eth', 'bnb', 'dot'],
    currency: 'usd'
  });
  const time2 = Date.now() - start2;
  
  console.log(`   Tempo: ${time2}ms`);
  console.log(`   Sucesso: ${response2.success}`);
  console.log(`   Dados: ${response2.data.length} criptomoedas`);
  console.log(`   Cache info:`, provider.getCacheInfo());
  console.log();

  // 3. Terceira chamada com símbolos diferentes - ainda usa o cache
  console.log('3. Terceira chamada com símbolos diferentes (ainda usa o cache):');
  const start3 = Date.now();
  const response3 = await provider.getPrices({
    symbols: ['link', 'ltc', 'atom', 'near'],
    currency: 'usd'
  });
  const time3 = Date.now() - start3;
  
  console.log(`   Tempo: ${time3}ms`);
  console.log(`   Sucesso: ${response3.success}`);
  console.log(`   Dados: ${response3.data.length} criptomoedas`);
  console.log(`   Cache info:`, provider.getCacheInfo());
  console.log();

  // 4. Limpar o cache manualmente
  console.log('4. Limpando o cache manualmente:');
  provider.clearSymbolCache();
  console.log(`   Cache info após limpeza:`, provider.getCacheInfo());
  console.log();

  // 5. Chamada após limpar o cache - vai buscar da API novamente
  console.log('5. Chamada após limpar o cache (vai buscar da API novamente):');
  const start5 = Date.now();
  const response5 = await provider.getPrices({
    symbols: ['btc', 'eth'],
    currency: 'usd'
  });
  const time5 = Date.now() - start5;
  
  console.log(`   Tempo: ${time5}ms`);
  console.log(`   Sucesso: ${response5.success}`);
  console.log(`   Dados: ${response5.data.length} criptomoedas`);
  console.log(`   Cache info:`, provider.getCacheInfo());
  console.log();

  // 6. Forçar atualização do cache
  console.log('6. Forçando atualização do cache:');
  try {
    await provider.forceRefreshSymbolCache();
    console.log('   Cache atualizado com sucesso');
    console.log(`   Cache info:`, provider.getCacheInfo());
  } catch (error) {
    console.log('   Erro ao atualizar cache:', error);
  }

  console.log('\n=== Resumo ===');
  console.log(`Primeira chamada (API): ${time1}ms`);
  console.log(`Segunda chamada (cache): ${time2}ms`);
  console.log(`Terceira chamada (cache): ${time3}ms`);
  console.log(`Chamada após limpeza (API): ${time5}ms`);
  console.log(`Melhoria de performance: ${Math.round((time1 - time2) / time1 * 100)}%`);
}

/**
 * Exemplo de tratamento de erro quando a API está indisponível
 */
async function demonstrateErrorHandling() {
  console.log('\n=== Demonstração de Tratamento de Erro ===\n');

  // Configuração com URL inválida para simular erro
  const config = {
    baseUrl: 'https://api-invalida.coingecko.com',
    timeout: 5000
  };

  const provider = new CoinGeckoProvider(config);

  console.log('Tentando buscar preços com API inválida:');
  const response = await provider.getPrices({
    symbols: ['btc', 'eth'],
    currency: 'usd'
  });

  console.log(`Sucesso: ${response.success}`);
  console.log(`Erros: ${response.errors?.join(', ')}`);
  console.log(`Dados: ${response.data.length} criptomoedas`);
  console.log('Nota: O provider usa mapeamento básico como fallback quando a API falha');
}

// Executar exemplos se este arquivo for executado diretamente
if (require.main === module) {
  demonstrateCacheUsage()
    .then(() => demonstrateErrorHandling())
    .catch(console.error);
}

export { demonstrateCacheUsage, demonstrateErrorHandling };

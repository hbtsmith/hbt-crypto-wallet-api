/**
 * Debug específico para CoinGecko API
 */

async function debugCoinGeckoAPI() {
  console.log('🔍 Debug da API do CoinGecko\n');

  try {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true';
    
    console.log(`🌐 Fazendo requisição para: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HBT-Crypto-Wallet-API/1.0'
      }
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`\n📊 Resposta da API:`);
    console.log(JSON.stringify(data, null, 2));

    // Testa o parsing
    console.log(`\n🔍 Testando parsing:`);
    const entries = Object.entries(data);
    console.log(`   Entries: ${entries.length}`);
    
    entries.forEach(([id, item]: [string, any]) => {
      console.log(`   ID: ${id}`);
      console.log(`   Item:`, item);
      console.log(`   USD: ${item.usd}`);
      console.log(`   USD 24h change: ${item.usd_24h_change}`);
      console.log(`   USD market cap: ${item.usd_market_cap}`);
      console.log(`   USD 24h vol: ${item.usd_24h_vol}`);
    });

  } catch (error) {
    console.error('💥 Erro:', error instanceof Error ? error.message : String(error));
  }
}

debugCoinGeckoAPI();

# CryptoPriceService

Serviço genérico e extensível para consulta de preços de tokens cripto. Suporta múltiplos providers com fallback automático.

## Características

- ✅ **Extensível**: Fácil adição de novos providers
- ✅ **Fallback automático**: Se um provider falhar, tenta outros automaticamente
- ✅ **Configurável**: Configurações flexíveis por provider
- ✅ **TypeScript**: Totalmente tipado
- ✅ **Rate limiting**: Controle de taxa de requisições
- ✅ **Error handling**: Tratamento robusto de erros
- ✅ **Singleton**: Instância única para toda a aplicação

## Providers Suportados

- **FreeCryptoAPI** (padrão)
- **CoinMarketCap**
- **CoinGecko**

## Instalação

O serviço já está integrado ao projeto. Para usar, importe:

```typescript
import { getCryptoPriceService, CryptoPriceProviderType } from './services/cryptoPrice';
```

## Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao seu `.env`:

```env
# FreeCryptoAPI (obrigatório para o provider padrão)
FREECRYPTOAPI_KEY=sua_chave_aqui

# CoinMarketCap (opcional)
COINMARKETCAP_API_KEY=sua_chave_aqui

# CoinGecko (opcional - tem limite gratuito)
COINGECKO_API_KEY=sua_chave_aqui
```

### Configuração Customizada

```typescript
import { createCryptoPriceService, CryptoPriceProviderType } from './services/cryptoPrice';

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
```

## Uso Básico

### Obter Preço de um Token

```typescript
const cryptoService = await getCryptoPriceService();
const btcPrice = await cryptoService.getPrice('BTC', 'USD');
console.log(btcPrice);
// Output: { symbol: 'BTC', name: 'Bitcoin', price: 45000, ... }
```

### Obter Preços de Múltiplos Tokens

```typescript
const prices = await cryptoService.getMultiplePrices(['BTC', 'ETH', 'ADA'], 'USD');
console.log(prices);
// Output: [{ symbol: 'BTC', ... }, { symbol: 'ETH', ... }, ...]
```

### Uso Avançado

```typescript
const response = await cryptoService.getPrices({
  symbols: ['BTC', 'ETH', 'SOL'],
  currency: 'USD'
});

if (response.success) {
  console.log('Dados:', response.data);
  console.log('Fonte:', response.source);
  console.log('Timestamp:', response.timestamp);
} else {
  console.error('Erros:', response.errors);
}
```

## Gerenciamento de Providers

### Verificar Providers Disponíveis

```typescript
const availableProviders = cryptoService.getAvailableProviders();
console.log('Providers disponíveis:', availableProviders);
// Output: ['freecryptoapi', 'coingecko']
```

### Alterar Provider

```typescript
await cryptoService.setProvider(CryptoPriceProviderType.COINGECKO);
```

### Usar Provider Específico

```typescript
const response = await cryptoService.getPricesWithProvider(
  CryptoPriceProviderType.COINMARKETCAP,
  { symbols: ['BTC'], currency: 'USD' }
);
```

## Estrutura de Dados

### CryptoPrice

```typescript
interface CryptoPrice {
  symbol: string;           // BTC, ETH, etc.
  name: string;            // Bitcoin, Ethereum, etc.
  price: number;           // Preço atual
  priceChange24h: number;  // Mudança absoluta em 24h
  priceChangePercentage24h: number; // Mudança percentual em 24h
  marketCap?: number;      // Capitalização de mercado
  volume24h?: number;      // Volume em 24h
  lastUpdated: Date;       // Última atualização
  source: string;          // Provider usado
}
```

### CryptoPriceResponse

```typescript
interface CryptoPriceResponse {
  success: boolean;        // Se a requisição foi bem-sucedida
  data: CryptoPrice[];     // Array de preços
  errors?: string[];       // Erros, se houver
  source: string;          // Provider usado
  timestamp: Date;         // Timestamp da resposta
}
```

## Tratamento de Erros

```typescript
try {
  const prices = await cryptoService.getPrices({
    symbols: ['BTC', 'ETH'],
    currency: 'USD'
  });
  
  if (!prices.success) {
    console.error('Erros:', prices.errors);
    return;
  }
  
  // Usar prices.data...
  
} catch (error) {
  console.error('Erro na requisição:', error.message);
}
```

## Adicionando Novos Providers

1. Crie uma nova classe que implemente `CryptoPriceProvider`:

```typescript
export class NovoProvider implements CryptoPriceProvider {
  public readonly name = 'NovoProvider';
  
  async getPrices(request: CryptoPriceRequest): Promise<CryptoPriceResponse> {
    // Implementação...
  }
  
  async isAvailable(): Promise<boolean> {
    // Verificação de disponibilidade...
  }
}
```

2. Adicione o tipo ao enum:

```typescript
export enum CryptoPriceProviderType {
  // ... existentes
  NOVO_PROVIDER = 'novo_provider'
}
```

3. Atualize o factory:

```typescript
case CryptoPriceProviderType.NOVO_PROVIDER:
  provider = new NovoProvider(config);
  break;
```

## Limitações

- Máximo de 100 símbolos por requisição
- Rate limiting configurável por provider
- Timeout padrão de 10 segundos
- Símbolos devem conter apenas letras e números

## Exemplos Completos

Veja o arquivo `examples/usage.ts` para exemplos detalhados de uso.

## Integração com Webhooks

Este serviço foi projetado para ser facilmente integrado com webhooks. O retorno padronizado (`CryptoPriceResponse`) pode ser diretamente usado para notificações.

```typescript
// Exemplo de uso com webhook
const prices = await cryptoService.getPrices({ symbols: ['BTC'], currency: 'USD' });
await webhookService.sendNotification(prices);
```

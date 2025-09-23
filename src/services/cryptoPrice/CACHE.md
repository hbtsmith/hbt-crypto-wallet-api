# Cache de Símbolos - CoinGeckoProvider

## Visão Geral

O `CoinGeckoProvider` implementa um sistema de cache em memória para o mapeamento de símbolos de criptomoedas para IDs do CoinGecko. Isso evita fazer requisições desnecessárias para a API `/api/v3/coins/list` a cada consulta de preços.

## Como Funciona

### 1. Cache em Memória
- O cache é armazenado na memória da aplicação
- Não depende de banco de dados ou sistemas externos
- É independente e auto-contido

### 2. TTL (Time To Live)
- **TTL padrão**: 24 horas (86.400.000 milissegundos)
- Após expirar, o cache é automaticamente atualizado na próxima requisição
- O TTL pode ser configurado modificando a constante `CACHE_TTL`

### 3. Atualização Automática
- Na primeira requisição, busca todos os símbolos da API
- Nas requisições subsequentes, usa o cache se ainda for válido
- Se o cache expirar, atualiza automaticamente em background

### 4. Fallback
- Se a API estiver indisponível, usa um mapeamento básico pré-definido
- Garante que o serviço continue funcionando mesmo com problemas de conectividade

## Estrutura do Cache

```typescript
interface SymbolCache {
  data: Record<string, string>;  // Mapeamento símbolo -> ID
  lastUpdated: Date;             // Timestamp da última atualização
  ttl: number;                   // TTL em milissegundos
}
```

## Métodos Públicos

### `getCacheInfo()`
Retorna informações sobre o estado atual do cache:
```typescript
const info = provider.getCacheInfo();
console.log(info);
// {
//   isValid: true,
//   lastUpdated: Date,
//   size: 15000
// }
```

### `clearSymbolCache()`
Limpa o cache manualmente, forçando uma nova busca na próxima requisição:
```typescript
provider.clearSymbolCache();
```

### `forceRefreshSymbolCache()`
Força a atualização imediata do cache:
```typescript
await provider.forceRefreshSymbolCache();
```

## Exemplo de Uso

```typescript
import { CoinGeckoProvider } from './providers/CoinGeckoProvider';

const provider = new CoinGeckoProvider({
  baseUrl: 'https://api.coingecko.com',
  timeout: 10000
});

// Primeira chamada - busca da API e cria cache
const response1 = await provider.getPrices({
  symbols: ['btc', 'eth', 'ada'],
  currency: 'usd'
});

// Segunda chamada - usa cache (muito mais rápida)
const response2 = await provider.getPrices({
  symbols: ['btc', 'eth', 'sol'],
  currency: 'usd'
});

// Verificar informações do cache
const cacheInfo = provider.getCacheInfo();
console.log(`Cache válido: ${cacheInfo.isValid}`);
console.log(`Última atualização: ${cacheInfo.lastUpdated}`);
console.log(`Número de símbolos: ${cacheInfo.size}`);
```

## Benefícios

### 1. Performance
- **Redução significativa de latência**: De ~2-3 segundos para ~50-100ms
- **Menos requisições à API**: Uma única requisição a cada 24 horas
- **Melhor experiência do usuário**: Respostas mais rápidas

### 2. Confiabilidade
- **Fallback robusto**: Continua funcionando mesmo com API indisponível
- **Tratamento de erros**: Logs informativos e recuperação automática
- **Independência**: Não depende de sistemas externos além da API

### 3. Eficiência
- **Menos uso de banda**: Reduz drasticamente o tráfego de rede
- **Menos carga na API**: Respeita os limites de rate limiting
- **Economia de recursos**: Menos processamento e memória

## Monitoramento

### Logs
O provider gera logs informativos:
```
Cache de símbolos atualizado com 15000 mapeamentos
Cache de símbolos limpo
```

### Métricas
Use `getCacheInfo()` para monitorar:
- Status de validade do cache
- Timestamp da última atualização
- Número de símbolos em cache

## Configuração

### TTL Personalizado
Para alterar o TTL do cache, modifique a constante no construtor:

```typescript
export class CoinGeckoProvider implements CryptoPriceProvider {
  private readonly CACHE_TTL = 12 * 60 * 60 * 1000; // 12 horas
  // ...
}
```

### Timeout da API
Configure o timeout para requisições à API:

```typescript
const provider = new CoinGeckoProvider({
  baseUrl: 'https://api.coingecko.com',
  timeout: 15000 // 15 segundos
});
```

## Considerações

### 1. Memória
- O cache armazena ~15.000 mapeamentos em memória
- Consumo estimado: ~2-3 MB de RAM
- Cache é limpo quando a aplicação é reiniciada

### 2. Sincronização
- Cada instância do provider tem seu próprio cache
- Em aplicações distribuídas, cada instância gerencia seu cache independentemente
- Para sincronização entre instâncias, considere usar Redis ou similar

### 3. Atualizações
- Novos tokens podem não estar disponíveis imediatamente
- Cache é atualizado automaticamente a cada 24 horas
- Para atualizações imediatas, use `forceRefreshSymbolCache()`

## Troubleshooting

### Cache não está funcionando
1. Verifique se o método `getSymbolToIdMap()` está sendo chamado corretamente
2. Confirme que o TTL não está muito baixo
3. Verifique os logs para erros de API

### Performance ainda lenta
1. Verifique se o cache está sendo usado: `getCacheInfo().isValid`
2. Confirme que não está limpando o cache desnecessariamente
3. Verifique a conectividade com a API

### Erros de API
1. O provider usa fallback automático
2. Verifique os logs para detalhes do erro
3. Considere aumentar o timeout se necessário

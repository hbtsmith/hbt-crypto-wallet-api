# Como Testar o CryptoPriceService

Este diretório contém exemplos de como usar e testar o CryptoPriceService.

## 🚀 Formas de Executar os Exemplos

### 1. Usando Yarn (Recomendado)

```bash
# Teste com mocks (offline, mais rápido)
yarn crypto:test

# Teste com APIs reais (requer chaves de API)
yarn crypto:test:real
```

### 2. Usando tsx diretamente

```bash
# Teste com mocks
npx tsx src/services/cryptoPrice/examples/mock-test.ts

# Teste com APIs reais
npx tsx src/services/cryptoPrice/examples/simple-test.ts
```

### 3. Usando ts-node (se instalado)

```bash
# Teste com mocks
npx ts-node src/services/cryptoPrice/examples/mock-test.ts

# Teste com APIs reais
npx ts-node src/services/cryptoPrice/examples/simple-test.ts
```

## 📁 Arquivos de Exemplo

### `mock-test.ts` ✅ **Recomendado para começar**
- **Offline**: Usa mocks, não precisa de chaves de API
- **Rápido**: Execução instantânea
- **Completo**: Testa todas as funcionalidades
- **Seguro**: Não faz requisições reais

### `simple-test.ts` ⚠️ **Requer configuração**
- **Online**: Faz requisições reais para APIs
- **Requer**: Chaves de API configuradas no `.env`
- **Lento**: Depende da velocidade das APIs externas
- **Real**: Testa com dados reais

### `usage.ts` 📚 **Documentação**
- **Exemplos**: Demonstrações de uso
- **Não executável**: Apenas para referência
- **Completo**: Mostra todos os casos de uso

## 🔧 Configuração para Testes Reais

Para usar `simple-test.ts` ou `crypto:test:real`, configure as variáveis de ambiente:

```env
# .env
FREECRYPTOAPI_KEY=sua_chave_aqui
COINMARKETCAP_API_KEY=sua_chave_aqui  # opcional
COINGECKO_API_KEY=sua_chave_aqui      # opcional
```

### Onde obter as chaves:

1. **FreeCryptoAPI**: https://freecryptoapi.com/
2. **CoinMarketCap**: https://coinmarketcap.com/api/
3. **CoinGecko**: https://www.coingecko.com/en/api

## 📊 O que cada teste verifica:

### ✅ Funcionalidades testadas:
- Inicialização do serviço
- Obtenção de preço único
- Obtenção de múltiplos preços
- Requisição completa com detalhes
- Validação de erros
- Tratamento de respostas da API
- Fallback entre providers
- Configurações customizadas

### 🎯 Casos de uso demonstrados:
- Uso básico do serviço
- Configuração de providers
- Tratamento de erros
- Validação de entrada
- Monitoramento de providers

## 🐛 Solução de Problemas

### Erro: "Nenhum provider disponível"
- **Causa**: APIs externas não estão respondendo
- **Solução**: Use `yarn crypto:test` (com mocks)

### Erro: "Cannot read properties of undefined"
- **Causa**: Resposta da API não está no formato esperado
- **Solução**: Verifique se as chaves de API estão corretas

### Erro: "command not found: ts-node"
- **Causa**: ts-node não está instalado
- **Solução**: Use `yarn crypto:test` ou `npx tsx`

## 📝 Exemplo de Saída Esperada

```
🚀 Iniciando teste do CryptoPriceService com mocks...

📡 Inicializando serviço com mocks...
✅ Serviço inicializado com provider: freecryptoapi
📋 Providers disponíveis: freecryptoapi

🔍 Teste 1: Obtendo preço do BTC...
💰 BTC: $45000.00 (2.27% em 24h)
📊 Market Cap: $850,000,000,000
📈 Volume 24h: $25,000,000,000

🔍 Teste 2: Obtendo preços de múltiplos tokens...
📊 Preços obtidos:
  BTC: $45000.00 (2.27% em 24h)
  ETH: $3000.00 (1.69% em 24h)

🎉 Todos os testes concluídos com sucesso!
```

## 🔄 Próximos Passos

Após testar o serviço, você pode:

1. **Integrar no seu código**: Use `getCryptoPriceService()` em seus controllers
2. **Configurar webhooks**: Use as respostas para notificações
3. **Adicionar novos providers**: Implemente outras APIs de cripto
4. **Customizar configurações**: Ajuste timeouts, rate limits, etc.

## 📚 Documentação Adicional

- [README principal](../README.md) - Documentação completa do serviço
- [Tipos e interfaces](../types.ts) - Definições TypeScript
- [Configurações](../config.ts) - Configurações padrão
- [Testes unitários](../../../tests/cryptoPrice.spec.ts) - Testes automatizados

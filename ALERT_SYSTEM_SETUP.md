# Sistema de Alertas de Preços - Configuração

## 📋 Visão Geral

Este sistema implementa alertas de preços de criptomoedas usando:
- **BullMQ + Redis** para agendamento de jobs
- **Firebase Cloud Messaging** para notificações push
- **Verificação automática** a cada 30 minutos

## 🚀 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```bash
# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Alert Scheduler
PRICE_CHECK_INTERVAL="*/30 * * * *"  # A cada 30 minutos
ALERT_MAX_RETRIES="3"
ALERT_RETRY_DELAY="5000"

# Firebase (para notificações push)
FIREBASE_PROJECT_ID="seu-projeto-firebase"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua chave privada aqui\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com"

# API Interna (para desenvolvimento)
INTERNAL_API_KEY="sua-chave-interna-secreta"
```

### 2. Configuração do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Vá em "Project Settings" > "Service Accounts"
4. Clique em "Generate new private key"
5. Baixe o arquivo JSON e extraia:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### 3. Iniciar o Sistema

```bash
# Subir os containers (incluindo Redis)
docker-compose -f docker-compose.dev.yml up -d

# Instalar dependências
yarn install

# Executar migrações
npx prisma migrate dev

# Iniciar o servidor
yarn dev
```

## 📱 Como Usar

### 1. Configurar Device Token

O usuário precisa configurar seu device token para receber notificações:

```bash
PUT /auth/device-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceToken": "token-do-dispositivo-firebase"
}
```

### 2. Criar Alerta

```bash
POST /token-alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbol": "BTC",
  "price": 50000,
  "direction": "CROSS_UP"
}
```

### 3. Monitorar Sistema (Endpoints Internos)

```bash
# Status do sistema
GET /internal/alerts/status
X-Internal-Key: sua-chave-interna-secreta

# Estatísticas da fila
GET /internal/alerts/queue-stats
X-Internal-Key: sua-chave-interna-secreta

# Forçar verificação imediata
POST /internal/alerts/trigger-check
X-Internal-Key: sua-chave-interna-secreta

# Testar notificação
POST /internal/notifications/test
X-Internal-Key: sua-chave-interna-secreta
Content-Type: application/json

{
  "deviceToken": "token-do-dispositivo",
  "title": "Teste",
  "body": "Esta é uma notificação de teste"
}
```

## 🔄 Fluxo de Funcionamento

1. **Agendamento**: Job recorrente executa a cada 30 minutos
2. **Verificação**: Sistema busca todos os alertas ativos
3. **Preços**: Consulta preços atuais via CryptoPriceService
4. **Condições**: Verifica se algum alerta foi acionado
5. **Notificação**: Envia push notification para usuários
6. **Inativação**: Desativa alertas que foram acionados

## 🛠️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BullMQ Jobs   │    │  Redis Queue    │    │  Price Checker  │
│                 │◄──►│                 │◄──►│                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Alert Scheduler │    │   PostgreSQL    │    │  Notification   │
│                 │    │   (Alerts)      │    │    Service      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │    Firebase     │
                                              │   Cloud Msg     │
                                              └─────────────────┘
```

## 🧪 Testando o Sistema

### 1. Criar Alerta de Teste

```bash
# Criar alerta para BTC a $1 (sempre será acionado)
POST /token-alerts
{
  "symbol": "BTC",
  "price": 1,
  "direction": "CROSS_UP"
}
```

### 2. Forçar Verificação

```bash
POST /internal/alerts/trigger-check
X-Internal-Key: sua-chave-interna-secreta
```

### 3. Verificar Logs

O sistema exibe logs detalhados no console:
- ✅ Alertas acionados
- ❌ Erros de processamento
- 📊 Estatísticas de jobs

## 🔧 Troubleshooting

### Redis não conecta
- Verifique se o Redis está rodando: `docker ps`
- Confirme as variáveis `REDIS_HOST` e `REDIS_PORT`

### Firebase não envia notificações
- Verifique as credenciais do Firebase
- Confirme se o `deviceToken` está correto
- Teste com o endpoint `/internal/notifications/test`

### Jobs não executam
- Verifique se o BullMQ está conectado ao Redis
- Confirme o status em `/internal/alerts/status`
- Verifique os logs do servidor

## 📚 Próximos Passos

- [ ] Dashboard web para monitoramento
- [ ] Histórico de notificações
- [ ] Múltiplos tipos de notificação (email, SMS)
- [ ] Configuração de intervalos personalizados
- [ ] Alertas baseados em percentual de mudança

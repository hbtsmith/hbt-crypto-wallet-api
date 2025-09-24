# 🚀 HBT Crypto Wallet API

A comprehensive cryptocurrency portfolio management API with real-time price alerts, built with modern technologies and best practices.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Monitoring & Tools](#-monitoring--tools)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Device token management for push notifications
- Input validation with Zod schemas

### 💰 Portfolio Management
- **Categories**: Organize your crypto assets
- **Tokens**: Track your cryptocurrency holdings
- **Token Balances**: Monitor buy/sell operations
- **Import System**: Bulk import via CSV/Excel files

### 🚨 Price Alert System
- **Real-time Alerts**: Get notified when prices hit your targets
- **Multiple Conditions**: CROSS_UP and CROSS_DOWN triggers
- **Push Notifications**: Firebase Cloud Messaging integration
- **Job Scheduling**: BullMQ + Redis for reliable processing
- **Web Dashboard**: Monitor alerts and queue status

### 📊 Crypto Price Integration
- **Multiple Providers**: CoinGecko, CoinMarketCap, FreeCryptoAPI
- **Fallback System**: Automatic provider switching
- **Caching**: Optimized performance with Redis
- **Rate Limiting**: Respect API limits

### 🔧 Developer Experience
- **TypeScript**: Full type safety
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Comprehensive test suite with Vitest
- **Docker**: Containerized development environment
- **Monitoring**: Bull Board for queue management

## 🛠 Tech Stack

### Backend
- **Node.js** (v18+) - Runtime environment
- **Express.js** (v5.1.0) - Web framework
- **TypeScript** (v5.9.2) - Type-safe JavaScript
- **Prisma** (v6.14.0) - Database ORM
- **PostgreSQL** (v15) - Primary database
- **Redis** (v7) - Caching and job queue

### Job Processing & Notifications
- **BullMQ** (v5.58.7) - Job queue management
- **Firebase Admin SDK** (v13.5.0) - Push notifications
- **Bull Board** (v6.13.0) - Queue monitoring dashboard

### Authentication & Security
- **JWT** (jsonwebtoken v9.0.2) - Token-based auth
- **bcryptjs** (v3.0.2) - Password hashing
- **Zod** (v4.1.5) - Schema validation

### Development & Testing
- **Yarn** (v4.6.0) - Package manager
- **Vitest** (v3.2.4) - Testing framework
- **Docker** - Containerization
- **ts-node-dev** - Development server
- **Concurrently** - Parallel script execution

### External APIs
- **CoinGecko API** - Cryptocurrency prices
- **CoinMarketCap API** - Market data
- **FreeCryptoAPI** - Price information

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Services      │
│   (React/Vue)   │◄──►│   (Express)     │◄──►│   Layer         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Middleware    │    │   Data Layer    │
                       │   (Auth/Val)    │    │   (Prisma)      │
                       └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Job Queue     │    │   Database      │
                       │   (BullMQ)      │    │   (PostgreSQL)  │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Cache         │
                       │   (Redis)       │
                       └─────────────────┘
```

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **Yarn** >= 4.0.0
- **Docker** & **Docker Compose**
- **PostgreSQL** (if running locally)
- **Redis** (if running locally)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/hbt-crypto-wallet-api.git
cd hbt-crypto-wallet-api
```

### 2. Install dependencies
```bash
yarn install
```

### 3. Environment setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

### 4. Database setup
```bash
# Generate Prisma client
yarn prisma:generate

# Run migrations
yarn prisma:migrate
```

## ⚙️ Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crypto"

# JWT
JWT_SECRET="your-jwt-secret"
REFRESH_TOKEN_EXPIRATION_DAYS=7
ACCESS_TOKEN_EXPIRATION_HOURS=8

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Firebase (for push notifications)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL="your-client-email"

# External APIs
COINGECKO_API_KEY="your-coingecko-key"
COINMARKETCAP_API_KEY="your-coinmarketcap-key"
FREECRYPTOAPI_KEY="your-freecryptoapi-key"

# Internal API
INTERNAL_API_KEY="your-internal-key"

# Server
PORT=3000
NODE_ENV=development
```

## 🎯 Usage

### Development Mode
```bash
# Start all services (API + Prisma Studio)
yarn dev

# Start only the API server
yarn dev:server

# Start only Prisma Studio
yarn dev:studio
```

### Docker Development
```bash
# Start all services with Docker
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production Build
```bash
# Build the application
yarn build

# Start production server
yarn start
```

## 📚 API Documentation

### Swagger UI
Access the interactive API documentation at:
```
http://localhost:3000/api-docs
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh JWT token
- `PUT /auth/device-token` - Update device token

#### Categories
- `GET /categories` - List categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

#### Tokens
- `GET /tokens` - List tokens
- `POST /tokens` - Create token
- `PUT /tokens/:id` - Update token
- `DELETE /tokens/:id` - Delete token

#### Token Alerts
- `GET /token-alerts` - List alerts
- `POST /token-alerts` - Create alert
- `PUT /token-alerts/:id` - Update alert
- `DELETE /token-alerts/:id` - Delete alert
- `POST /token-alerts/:id/activate` - Activate alert
- `POST /token-alerts/:id/deactivate` - Deactivate alert

#### Token Balances
- `GET /token-balance` - List balances
- `POST /token-balance` - Create balance
- `PUT /token-balance/:id` - Update balance
- `DELETE /token-balance/:id` - Delete balance

#### Import
- `POST /import/categories` - Import categories from CSV
- `POST /import/tokens` - Import tokens from CSV
- `POST /import/token-balances` - Import balances from CSV

## 🔍 Monitoring & Tools

### Bull Board (Queue Management)
Monitor and manage your job queues:
```
http://localhost:3000/admin/queues
```

### Redis Commander (Redis Management)
Manage Redis data and keys:
```bash
# Start Redis Commander
redis-commander --redis-host=localhost --redis-port=6379 --port=8083

# Access at: http://localhost:8083
```

### Prisma Studio (Database Management)
Visual database management:
```bash
yarn prisma:studio
# Access at: http://localhost:5555
```

### Internal API Endpoints
- `GET /internal/alerts/status` - Queue statistics
- `POST /internal/alerts/trigger-price-check` - Manual price check
- `GET /internal/alerts/queue-stats` - Queue metrics
- `POST /internal/alerts/pause` - Pause queue
- `POST /internal/alerts/resume` - Resume queue

## 🧪 Testing

### Run Tests
```bash
# Run all tests
yarn test

# Run tests with UI
yarn test:ui

# Run tests in watch mode
yarn test:watch

# Run specific test file
yarn test tests/auth.spec.ts
```

### Test Coverage
```bash
# Generate coverage report
yarn test --coverage
```

### Test Categories
- **Authentication Tests** - Login, registration, JWT
- **API Tests** - All endpoints and validations
- **Service Tests** - Business logic and integrations
- **Alert System Tests** - Price checking and notifications
- **Crypto Price Tests** - External API integrations

## 🚀 Deployment

### Docker Production
```bash
# Build production image
docker build -f Dockerfile.prod -t hbt-crypto-api .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup
1. Configure production environment variables
2. Set up SSL certificates
3. Configure reverse proxy (nginx)
4. Set up monitoring and logging
5. Configure backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow conventional commit messages
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Prisma](https://prisma.io/) - Database toolkit
- [BullMQ](https://bullmq.io/) - Job queue
- [Firebase](https://firebase.google.com/) - Push notifications
- [CoinGecko](https://coingecko.com/) - Crypto price data
- [Express.js](https://expressjs.com/) - Web framework

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

<div align="center">
  <p>Made with ❤️ by HBT</p>
  <p>
    <a href="#-hbt-crypto-wallet-api">⬆️ Back to top</a>
  </p>
</div>
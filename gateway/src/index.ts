import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 8000;

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:8002';
const RANK_SERVICE_URL = process.env.RANK_SERVICE_URL || 'http://localhost:8003';
const SUPPORT_SERVICE_URL = process.env.SUPPORT_SERVICE_URL || 'http://localhost:8004';

app.use(cors());
app.use(morgan('dev'));

// Health check do API Gateway
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'GameHub API Gateway',
    timestamp: new Date().toISOString(),
    routes: {
      users: `${USER_SERVICE_URL}/users`,
      games: `${GAME_SERVICE_URL}/games`,
      ranks: `${RANK_SERVICE_URL}/ranks`,
      support: `${SUPPORT_SERVICE_URL}/support`,
    },
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🎮 Bem-vindo ao GameHub API Gateway',
    documentation: '/health',
  });
});

// Proxy para User Service
app.use(
  '/api/users',
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/users' },
  })
);

// Proxy para Game Service
app.use(
  '/api/games',
  createProxyMiddleware({
    target: GAME_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/games': '/games' },
  })
);

// Proxy para Rank Service
app.use(
  '/api/ranks',
  createProxyMiddleware({
    target: RANK_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/ranks': '/ranks' },
  })
);

// Proxy para Support Service
app.use(
  '/api/support',
  createProxyMiddleware({
    target: SUPPORT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/support': '/support' },
  })
);

app.listen(PORT, () => {
  console.log(`🚀 API Gateway rodando na porta ${PORT}`);
  console.log(`📡 Roteando:`);
  console.log(`   - /api/users   -> ${USER_SERVICE_URL}`);
  console.log(`   - /api/games   -> ${GAME_SERVICE_URL}`);
  console.log(`   - /api/ranks   -> ${RANK_SERVICE_URL}`);
  console.log(`   - /api/support -> ${SUPPORT_SERVICE_URL}`);
});

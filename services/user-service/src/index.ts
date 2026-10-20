import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import { initDb } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 8001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'UP',
    service: 'GameHub User Service',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
  });
});

app.use('/users', userRoutes);

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`👤 User Service rodando na porta ${PORT}`);
  });
}

start();

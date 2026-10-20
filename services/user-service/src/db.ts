import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || 'gamehub',
  password: process.env.POSTGRES_PASSWORD || 'gamehub_secret',
  database: process.env.POSTGRES_DB || 'gamehub_user_db',
  connectionTimeoutMillis: 3000,
});

let isPgConnected = false;

// Fallback em memória caso o PostgreSQL esteja iniciando ou indisponível no momento
export interface UserRecord {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export const inMemoryUsers: UserRecord[] = [
  {
    id: 'u-1',
    username: 'pro_gamer',
    email: 'pro@gamehub.io',
    password_hash: 'mock_hash',
    avatar_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
    bio: 'Veterano dos fliperamas e speedrunner!',
    created_at: new Date().toISOString(),
  },
  {
    id: 'u-2',
    username: 'pixel_queen',
    email: 'pixel@gamehub.io',
    password_hash: 'mock_hash',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Apaixonada por indie games e pixel art.',
    created_at: new Date().toISOString(),
  },
];

export async function initDb(): Promise<void> {
  try {
    const client = await pool.connect();
    isPgConnected = true;
    console.log('✅ [User Service] Conectado ao PostgreSQL com sucesso.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    client.release();
  } catch (err: any) {
    isPgConnected = false;
    console.warn('⚠️ [User Service] PostgreSQL não disponível. Utilizando armazenamento em memória temporário.');
  }
}

export function isDbConnected(): boolean {
  return isPgConnected;
}

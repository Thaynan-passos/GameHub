import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gamehub_games';

let client: MongoClient | null = null;
let db: Db | null = null;
let isMongoConnected = false;

export interface GameRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  banner: string;
  rating: number;
  playCount: number;
  gameType: 'canvas' | 'iframe' | 'wasm';
  embedUrl?: string;
  createdAt: string;
}

export const inMemoryGames: GameRecord[] = [
  {
    id: 'game-1',
    title: 'Neon Space Invaders',
    slug: 'neon-space-invaders',
    description: 'Defenda a galáxia contra hordas alienígenas com gráficos retro neon futuristas!',
    category: 'Arcade',
    tags: ['Retro', 'Space', 'Shooter'],
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
    rating: 4.8,
    playCount: 14200,
    gameType: 'canvas',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'game-2',
    title: 'Cyber Runner 2099',
    slug: 'cyber-runner-2099',
    description: 'Corra pelas coberturas de uma metrópole cyberpunk desviando de drones e obstáculos.',
    category: 'Ação',
    tags: ['Cyberpunk', 'Runner', 'Fast-Paced'],
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
    rating: 4.9,
    playCount: 28900,
    gameType: 'canvas',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'game-3',
    title: 'Pixel Dungeon Quest',
    slug: 'pixel-dungeon-quest',
    description: 'Explore masmorras perigosas geradas proceduralmente e derrote monstros lendários.',
    category: 'RPG',
    tags: ['Roguelike', 'Pixel Art', 'RPG'],
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
    rating: 4.7,
    playCount: 9400,
    gameType: 'canvas',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'game-4',
    title: 'Speedway Turbo Drift',
    slug: 'speedway-turbo-drift',
    description: 'Acelere em pistas de drift desafiadoras com física arcade precisa.',
    category: 'Corrida',
    tags: ['Racing', 'Drift', 'Multiplayer'],
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200',
    rating: 4.6,
    playCount: 18100,
    gameType: 'canvas',
    createdAt: new Date().toISOString(),
  },
];

export async function initDb(): Promise<void> {
  try {
    client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    await client.connect();
    db = client.db();
    isMongoConnected = true;
    console.log('✅ [Game Service] Conectado ao MongoDB com sucesso.');

    // Seed se a collection estiver vazia
    const collection = db.collection('games');
    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(inMemoryGames as any);
      console.log('🌱 [Game Service] Jogos iniciais populados no MongoDB.');
    }
  } catch (err: any) {
    isMongoConnected = false;
    console.warn('⚠️ [Game Service] MongoDB não disponível. Utilizando catálogo em memória temporário.');
  }
}

export function getDb(): Db | null {
  return db;
}

export function isDbConnected(): boolean {
  return isMongoConnected;
}

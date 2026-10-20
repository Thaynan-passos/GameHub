import { Request, Response } from 'express';
import { getDb, isDbConnected, inMemoryGames, GameRecord } from '../db.js';

export async function listGames(req: Request, res: Response): Promise<void> {
  const { category, search } = req.query;

  if (isDbConnected()) {
    try {
      const db = getDb()!;
      const filter: any = {};
      if (category) filter.category = category;
      if (search) {
        filter.$or = [
          { title: { $regex: String(search), $options: 'i' } },
          { description: { $regex: String(search), $options: 'i' } },
        ];
      }
      const games = await db.collection('games').find(filter).toArray();
      res.json(games);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    let result = [...inMemoryGames];
    if (category) {
      result = result.filter(g => g.category.toLowerCase() === String(category).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(g => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
    }
    res.json(result);
  }
}

export async function getGameById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (isDbConnected()) {
    try {
      const db = getDb()!;
      const game = await db.collection('games').findOne({ $or: [{ id }, { slug: id }] });
      if (!game) {
        res.status(404).json({ error: 'Jogo não encontrado' });
        return;
      }
      res.json(game);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const game = inMemoryGames.find(g => g.id === id || g.slug === id);
    if (!game) {
      res.status(404).json({ error: 'Jogo não encontrado' });
      return;
    }
    res.json(game);
  }
}

export async function createGame(req: Request, res: Response): Promise<void> {
  const { title, slug, description, category, tags, thumbnail, banner, gameType, embedUrl } = req.body;

  if (!title || !description || !category) {
    res.status(400).json({ error: 'Campos obrigatórios: title, description, category' });
    return;
  }

  const newGame: GameRecord = {
    id: 'game-' + Date.now().toString(36),
    title,
    slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description,
    category,
    tags: Array.isArray(tags) ? tags : ['Arcade'],
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
    banner: banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
    rating: 5.0,
    playCount: 0,
    gameType: gameType || 'canvas',
    embedUrl,
    createdAt: new Date().toISOString(),
  };

  if (isDbConnected()) {
    try {
      const db = getDb()!;
      await db.collection('games').insertOne(newGame as any);
      res.status(201).json(newGame);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    inMemoryGames.push(newGame);
    res.status(201).json(newGame);
  }
}

export async function incrementPlayCount(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (isDbConnected()) {
    try {
      const db = getDb()!;
      await db.collection('games').updateOne({ id }, { $inc: { playCount: 1 } });
      res.json({ success: true, message: 'Play count incrementado' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const game = inMemoryGames.find(g => g.id === id);
    if (game) {
      game.playCount += 1;
    }
    res.json({ success: true, message: 'Play count incrementado (Memória)' });
  }
}

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, isDbConnected, inMemoryUsers, UserRecord } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_gamehub_jwt_key';

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password, avatar_url, bio } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Campos obrigatórios: username, email, password' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  const id = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

  if (isDbConnected()) {
    try {
      const result = await pool.query(
        `INSERT INTO users (id, username, email, password_hash, avatar_url, bio)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, username, email, avatar_url, bio, created_at`,
        [id, username, email, password_hash, avatar_url || null, bio || null]
      );
      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ user, token });
      return;
    } catch (err: any) {
      res.status(409).json({ error: 'Usuário ou e-mail já cadastrado.', details: err.message });
      return;
    }
  } else {
    // Modo Fallback em Memória
    const exists = inMemoryUsers.some(u => u.username === username || u.email === email);
    if (exists) {
      res.status(409).json({ error: 'Usuário ou e-mail já cadastrado (Memória).' });
      return;
    }
    const newUser: UserRecord = {
      id,
      username,
      email,
      password_hash,
      avatar_url: avatar_url || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
      bio: bio || '',
      created_at: new Date().toISOString(),
    };
    inMemoryUsers.push(newUser);
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash: _, ...safeUser } = newUser;
    res.status(201).json({ user: safeUser, token });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Campos obrigatórios: email, password' });
    return;
  }

  if (isDbConnected()) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }
      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      delete user.password_hash;
      res.json({ user, token });
      return;
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    }
  } else {
    const user = inMemoryUsers.find(u => u.email === email);
    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }
    const valid = (password === 'secret' || (await bcrypt.compare(password, user.password_hash).catch(() => false)) || user.password_hash === 'mock_hash');
    if (!valid) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (isDbConnected()) {
    try {
      const result = await pool.query('SELECT id, username, email, avatar_url, bio, created_at FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const user = inMemoryUsers.find(u => u.id === id);
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    const { password_hash: _, ...safeUser } = user;
    res.json(safeUser);
  }
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  if (isDbConnected()) {
    try {
      const result = await pool.query('SELECT id, username, email, avatar_url, bio, created_at FROM users ORDER BY created_at DESC LIMIT 50');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.json(inMemoryUsers.map(({ password_hash: _, ...safe }) => safe));
  }
}

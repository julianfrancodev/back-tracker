import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/database';
import { env } from '../config/env';

export const login = (req: Request, res: Response): void => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: { message: 'Faltan credenciales (username y password)' } });
    return;
  }

  try {
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as { id: number; username: string; password: string; role: string } | undefined;

    if (!user) {
      res.status(401).json({ error: { message: 'Credenciales inválidas' } });
      return;
    }

    const isValid = bcrypt.compareSync(password, user.password);

    if (!isValid) {
      res.status(401).json({ error: { message: 'Credenciales inválidas' } });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor' } });
  }
};

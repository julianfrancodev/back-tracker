import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login } from '../controllers/auth.controller';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // 5 intentos
  message: { error: { message: 'Demasiados intentos de login, por favor intente de nuevo más tarde' } }
});

router.post('/login', loginLimiter, login);

export default router;

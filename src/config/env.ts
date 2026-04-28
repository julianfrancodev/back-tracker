import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default('development'),
  JWT_SECRET: z.string().min(10, "JWT_SECRET debe tener al menos 10 caracteres"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Error en las variables de entorno:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;


import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Basic validation
if (Number.isNaN(env.PORT)) {
  throw new Error('PORT must be a valid number');
}

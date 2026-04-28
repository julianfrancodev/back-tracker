import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, addCorrelationId } from './middlewares/errorHandler';
import { connectDB } from './config/database';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(addCorrelationId);

// Rutas
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', correlationId: req.headers['x-correlation-id'] });
});

// Ejemplo de ruta que lanza un error para probar el middleware
app.get('/error', (req, res, next) => {
  const error = new Error('Error de prueba');
  (error as any).statusCode = 400;
  next(error);
});

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

let server: ReturnType<typeof app.listen>;

const startServer = async () => {
  try {
    connectDB();


    server = app.listen(env.PORT, () => {
      console.log(`🚀 Servidor ejecutándose en el puerto ${env.PORT} en modo ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Falla crítica al iniciar:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Seal SIGTERM recibida: cerrando servidor HTTP');
  if (server) {
    server.close(() => {
      console.log('Servidor HTTP cerrado');
    });
  }
});

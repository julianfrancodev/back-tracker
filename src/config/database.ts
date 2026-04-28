import { DatabaseSync } from 'node:sqlite';
import path from 'path';

let db: DatabaseSync;

export const connectDB = () => {
  if (db) return db;

  try {
    db = new DatabaseSync(path.resolve(process.cwd(), 'database.sqlite'));
    console.log('✅ Conexión a la base de datos SQLite (nativa) establecida.');

    // Crear la tabla si no existe
    db.exec(`
      CREATE TABLE IF NOT EXISTS routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        origin_city TEXT,
        destination_city TEXT,
        distance_km REAL,
        estimated_time_hours REAL,
        vehicle_type TEXT,
        carrier TEXT,
        cost_usd REAL,
        status TEXT,
        created_at TEXT
      );
    `);

    // Crear índices explícitos
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_routes_origin_city ON routes(origin_city);
      CREATE INDEX IF NOT EXISTS idx_routes_destination_city ON routes(destination_city);
      CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
    `);

    console.log('✅ Tablas e índices verificados.');

    return db;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos SQLite nativa:', error);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('La base de datos no está inicializada. Llama a connectDB() primero.');
  }
  return db;
};

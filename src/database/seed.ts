import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { connectDB } from '../config/database';

export const seedDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const db = connectDB();
      
      // Validar si la tabla ya tiene datos
      const stmtCount = db.prepare('SELECT COUNT(*) as count FROM routes');
      const row = stmtCount.get() as { count: number };
      
      if (row && row.count > 0) {
        console.log('✅ La base de datos ya está poblada. No se requiere seed.');
        return resolve();
      }

      console.log('⏳ Iniciando la carga de datos desde CSV...');

      const csvFilePath = path.resolve(process.cwd(), 'routes_dataset.csv');
      
      if (!fs.existsSync(csvFilePath)) {
        console.warn('⚠️ No se encontró el archivo routes_dataset.csv en la raíz del proyecto. Saltando seed.');
        return resolve();
      }

      const results: Record<string, string>[] = [];

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('error', (err) => {
          console.error('❌ Error al leer el CSV:', err);
          reject(err);
        })
        .on('end', () => {
          try {
            // Usar una transacción para insertar de forma eficiente
            db.exec('BEGIN TRANSACTION');

            const stmt = db.prepare(`
              INSERT INTO routes (
                origin_city, destination_city, distance_km, estimated_time_hours, 
                vehicle_type, carrier, cost_usd, status, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const row of results) {
              stmt.run(
                row.origin_city,
                row.destination_city,
                parseFloat(row.distance_km),
                parseFloat(row.estimated_time_hours),
                row.vehicle_type,
                row.carrier,
                parseFloat(row.cost_usd),
                row.status,
                row.created_at || new Date().toISOString()
              );
            }

            db.exec('COMMIT');
            console.log(`✅ Se insertaron ${results.length} registros exitosamente.`);
            resolve();
          } catch (error) {
            db.exec('ROLLBACK');
            console.error('❌ Error durante la inserción de datos:', error);
            reject(error);
          }
        });

    } catch (error) {
      console.error('❌ Error general en el proceso de seed:', error);
      reject(error);
    }
  });
};

// Autoejecución si se llama directamente con ts-node
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🏁 Proceso de seed finalizado.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('💥 Fallo crítico en el seed:', err);
      process.exit(1);
    });
}

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { connectDB } from '../config/database';

const seedDatabase = () => {
  try {
    const db = connectDB();
    
    // Validar si la tabla ya tiene datos
    const stmtCount = db.prepare('SELECT COUNT(*) as count FROM routes');
    const row = stmtCount.get() as { count: number };
    
    if (row && row.count > 0) {
      console.log('✅ La base de datos ya está poblada. No se requiere seed.');
      db.close();
      process.exit(0);
    }

    console.log('⏳ Iniciando la carga de datos desde CSV...');

    const csvFilePath = path.resolve(process.cwd(), 'routes_dataset.csv');
    
    if (!fs.existsSync(csvFilePath)) {
      console.error('❌ No se encontró el archivo routes_dataset.csv en la raíz del proyecto.');
      db.close();
      process.exit(1);
    }

    const results: Record<string, string>[] = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
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
        } catch (error) {
          db.exec('ROLLBACK');
          console.error('❌ Error durante la inserción de datos:', error);
          process.exit(1);
        } finally {
          db.close();
          console.log('🔌 Conexión a la base de datos cerrada.');
          process.exit(0);
        }
      });

  } catch (error) {
    console.error('❌ Error general en el proceso de seed:', error);
    process.exit(1);
  }
};

seedDatabase();

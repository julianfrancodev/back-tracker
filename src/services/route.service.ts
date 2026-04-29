import { getDB } from '../config/database';
import { RouteRepository } from '../repositories/route.repository';
import { AppError } from '../middlewares/errorHandler';
import { CreateRouteDTO, UpdateRouteDTO, RouteQueryDTO, Route } from '../dtos/route.dto';

export class RouteService {
  private _repository?: RouteRepository;

  private get repository(): RouteRepository {
    if (!this._repository) {
      this._repository = new RouteRepository(getDB());
    }
    return this._repository;
  }

  getAllRoutes(filters: Omit<RouteQueryDTO, 'page' | 'limit'>, page: number, limit: number): { data: Route[]; total: number } {
    const offset = (page - 1) * limit;
    return this.repository.findAll(filters, { limit, offset });
  }

  getRouteById(id: number): Route {
    const route = this.repository.findById(id);
    if (!route) {
      const error = new Error('Ruta no encontrada') as AppError;
      error.statusCode = 404;
      throw error;
    }
    return route;
  }

  createRoute(data: CreateRouteDTO): Route {
    return this.repository.create(data);
  }

  updateRoute(id: number, data: UpdateRouteDTO): Route | undefined {
    this.getRouteById(id);
    return this.repository.update(id, data);
  }

  deleteRoute(id: number): Route | undefined {
    this.getRouteById(id);
    return this.repository.softDelete(id);
  }

  getDashboardMetrics(startDate?: string, endDate?: string) {
    return this.repository.getDashboardMetrics(startDate, endDate);
  }

  importRoutes(fileBuffer: Buffer): Promise<{ imported: number; failed: number; errors: any[] }> {
    return new Promise((resolve) => {
      const csvParser = require('csv-parser');
      const { Readable } = require('stream');
      const { CreateRouteSchema } = require('../dtos/route.dto');
      
      const results: any[] = [];
      const errors: any[] = [];
      let imported = 0;
      let failed = 0;
      let rowNumber = 1;

      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);

      readableStream
        .pipe(csvParser())
        .on('data', (data: any) => {
          rowNumber++;
          try {
            // Convertir strings a números según corresponda
            if (data.distance_km) data.distance_km = Number(data.distance_km);
            if (data.estimated_time_hours) data.estimated_time_hours = Number(data.estimated_time_hours);
            if (data.cost_usd) data.cost_usd = Number(data.cost_usd);

            const parsedData = CreateRouteSchema.parse(data);
            this.repository.create(parsedData);
            imported++;
          } catch (error: any) {
            failed++;
            errors.push({
              row: rowNumber,
              data,
              error: error.errors || error.message
            });
          }
        })
        .on('end', () => {
          resolve({ imported, failed, errors });
        })
        .on('error', (err: any) => {
          resolve({ imported, failed, errors: [{ error: 'Error al procesar el archivo CSV', detail: err.message }] });
        });
    });
  }
}

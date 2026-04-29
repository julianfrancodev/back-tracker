import { getDB } from '../config/database';
import { RouteRepository } from '../repositories/route.repository';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { ZodError } from 'zod';
import { AppError } from '../middlewares/errorHandler';
import { CreateRouteDTO, UpdateRouteDTO, RouteQueryDTO, Route, CreateRouteSchema } from '../dtos/route.dto';

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
      throw new AppError('Ruta no encontrada', 404);
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

  importRoutes(fileBuffer: Buffer): Promise<{ imported: number; failed: number; errors: Record<string, unknown>[] }> {
    return new Promise((resolve) => {
      const errors: Record<string, unknown>[] = [];
      let imported = 0;
      let failed = 0;
      let rowNumber = 1;

      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);

      readableStream
        .pipe(csvParser())
        .on('data', (data: Record<string, string | number>) => {
          rowNumber++;
          try {
            // Convertir strings a números según corresponda
            if (data.distance_km) data.distance_km = Number(data.distance_km);
            if (data.estimated_time_hours) data.estimated_time_hours = Number(data.estimated_time_hours);
            if (data.cost_usd) data.cost_usd = Number(data.cost_usd);

            const parsedData = CreateRouteSchema.parse(data);
            this.repository.create(parsedData);
            imported++;
          } catch (error) {
            failed++;
            errors.push({
              row: rowNumber,
              data,
              error: error instanceof ZodError ? error.errors : (error as Error).message
            });
          }
        })
        .on('end', () => {
          resolve({ imported, failed, errors });
        })
        .on('error', (err: Error) => {
          resolve({ imported, failed, errors: [{ error: 'Error al procesar el archivo CSV', detail: err.message }] });
        });
    });
  }
}

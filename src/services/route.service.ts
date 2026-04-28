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
}

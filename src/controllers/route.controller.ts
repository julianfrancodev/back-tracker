import { Request, Response, NextFunction } from 'express';
import { RouteService } from '../services/route.service';
import { CreateRouteSchema, UpdateRouteSchema, RouteQuerySchema } from '../dtos/route.dto';

// Instancia única del servicio
const routeService = new RouteService();

export class RouteController {
  
  static getAll(req: Request, res: Response, next: NextFunction): void {
    try {
      const query = RouteQuerySchema.parse(req.query);
      const { page, limit, ...filters } = query;
      
      const result = routeService.getAllRoutes(filters, page, limit);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: error.errors });
        return;
      }
      next(error);
    }
  }

  static getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const route = routeService.getRouteById(id);
      res.status(200).json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  }

  static create(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = CreateRouteSchema.parse(req.body);
      const newRoute = routeService.createRoute(data);
      res.status(201).json({ success: true, data: newRoute });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: error.errors });
        return;
      }
      next(error);
    }
  }

  static update(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const data = UpdateRouteSchema.parse(req.body);
      const updatedRoute = routeService.updateRoute(id, data);
      res.status(200).json({ success: true, data: updatedRoute });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, error: error.errors });
        return;
      }
      next(error);
    }
  }

  static delete(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }

      const deletedRoute = routeService.deleteRoute(id);
      res.status(200).json({ success: true, data: deletedRoute, message: 'Ruta inhabilitada correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

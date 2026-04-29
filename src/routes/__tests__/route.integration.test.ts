import request from 'supertest';
import { app } from '../../index';
import { RouteRepository } from '../../repositories/route.repository';
import { RouteService } from '../../services/route.service';

// 1. Mocking global de autenticación
jest.mock('../../middlewares/auth.middleware.ts', () => ({
  verifyToken: (req: any, res: any, next: any) => {
    // Inyectamos el usuario a la request para que pase requireRole
    req.user = { id: 1, username: 'admin', role: 'ADMIN' };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next()
}));

// 2. Mocking de Repositorio o Base de Datos
jest.mock('../../repositories/route.repository.ts');
jest.mock('../../config/database', () => ({
  getDB: jest.fn()
}));

// Mock de validación para saltar las reglas estrictas de Zod durante el test
jest.mock('../../dtos/route.dto', () => ({
  CreateRouteSchema: {
    parse: jest.fn().mockImplementation((data) => data)
  },
  RouteQuerySchema: {
    parse: jest.fn().mockImplementation((data) => data)
  },
  UpdateRouteSchema: {
    parse: jest.fn().mockImplementation((data) => data)
  }
}));

describe('Route Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/routes', () => {
    it('should return 200 and paginated structure', async () => {
      // Configuramos el mock
      RouteService.prototype.getAllRoutes = jest.fn().mockReturnValue({ data: [], total: 0 });

      const response = await request(app).get('/api/routes?page=1&limit=20');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  describe('POST /api/routes', () => {
    it('should return 201 with valid payload', async () => {
      const payload = {
        origin_city: 'Bogota',
        destination_city: 'Medellin',
        distance_km: 400,
        estimated_time_hours: 8,
        vehicle_type: 'Truck',
        carrier: 'FastLogistics',
        cost_usd: 1500,
        status: 'ACTIVA'
      };

      RouteService.prototype.createRoute = jest.fn().mockReturnValue({ id: 1, ...payload });

      const response = await request(app)
        .post('/api/routes')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.origin_city).toBe('Bogota');
    });
  });

  describe('GET /api/routes/:id', () => {
    it('should return 200 and the route data', async () => {
      RouteService.prototype.getRouteById = jest.fn().mockReturnValue({ id: 1, origin_city: 'Bogota' });
      const response = await request(app).get('/api/routes/1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/api/routes/invalid_id');
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('ID inválido');
    });
  });

  describe('PUT /api/routes/:id', () => {
    it('should return 200 and updated route', async () => {
      RouteService.prototype.updateRoute = jest.fn().mockReturnValue({ id: 1, origin_city: 'Cali' });
      const response = await request(app).put('/api/routes/1').send({ origin_city: 'Cali' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.origin_city).toBe('Cali');
    });
  });

  describe('DELETE /api/routes/:id', () => {
    it('should return 200 and soft delete route', async () => {
      RouteService.prototype.deleteRoute = jest.fn().mockReturnValue({ id: 1, status: 'INHABILITADA' });
      const response = await request(app).delete('/api/routes/1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('INHABILITADA');
    });
  });

  describe('GET /api/routes/dashboard/metrics', () => {
    it('should return 200 and dashboard metrics', async () => {
      RouteService.prototype.getDashboardMetrics = jest.fn().mockReturnValue({ status_counts: [], top_expensive: [] });
      const response = await request(app).get('/api/routes/dashboard/metrics');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status_counts');
    });
  });

  describe('POST /api/routes/import', () => {
    it('should return 200 with import summary when uploading a CSV buffer', async () => {
      // Mockeamos la capa de servicio para no lidiar con csv-parser en el test de integración
      // ya que queremos probar el endpoint HTTP y multer.
      RouteService.prototype.importRoutes = jest.fn().mockResolvedValue({
        imported: 10,
        failed: 0,
        errors: []
      });

      const fakeCsvContent = Buffer.from('origin_city,destination_city\nBogota,Medellin');

      const response = await request(app)
        .post('/api/routes/import')
        .attach('file', fakeCsvContent, 'test.csv');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        imported: 10,
        failed: 0,
        errors: []
      });
    });
  });
});

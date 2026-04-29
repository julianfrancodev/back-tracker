/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RouteService } from '../route.service';
import { RouteRepository } from '../../repositories/route.repository';
import { AppError } from '../../middlewares/errorHandler';

jest.mock('../../repositories/route.repository.ts');
jest.mock('../../config/database', () => ({
  getDB: jest.fn()
}));

describe('RouteService', () => {
  let routeService: RouteService;
  let mockRepository: jest.Mocked<RouteRepository>;

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
    
    // Instantiate service
    routeService = new RouteService();
    
    // The repository is lazily created inside the getter, 
    // but since we mocked the class, we can access the mocked methods
    // We'll spy on the mocked instance's methods directly later or cast it
  });

  describe('getAllRoutes', () => {
    it('should call repository.findAll with correct pagination and return data', () => {
      const mockData = { data: [{ id: 1, origin_city: 'Bogota' } as any], total: 1 };
      
      // Override the prototype method of the mocked class
      RouteRepository.prototype.findAll = jest.fn().mockReturnValue(mockData);

      const result = routeService.getAllRoutes({}, 2, 10);

      expect(RouteRepository.prototype.findAll).toHaveBeenCalledWith({}, { limit: 10, offset: 10 });
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteRoute', () => {
    it('should throw AppError 404 if route does not exist', () => {
      RouteRepository.prototype.findById = jest.fn().mockReturnValue(undefined);

      try {
        routeService.deleteRoute(999);
        fail('Expected error was not thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Ruta no encontrada');
      }
    });

    it('should call repository.softDelete if route exists', () => {
      RouteRepository.prototype.findById = jest.fn().mockReturnValue({ id: 1 } as any);
      RouteRepository.prototype.softDelete = jest.fn().mockReturnValue({ id: 1, status: 'INHABILITADA' } as any);

      const result = routeService.deleteRoute(1);

      expect(RouteRepository.prototype.findById).toHaveBeenCalledWith(1);
      expect(RouteRepository.prototype.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, status: 'INHABILITADA' });
    });
  });

  describe('createRoute', () => {
    it('should call repository.create and return new route', () => {
      const mockRoute = { origin_city: 'A', destination_city: 'B' };
      RouteRepository.prototype.create = jest.fn().mockReturnValue({ id: 1, ...mockRoute });

      const result = routeService.createRoute(mockRoute as any);
      expect(RouteRepository.prototype.create).toHaveBeenCalledWith(mockRoute);
      expect(result).toEqual({ id: 1, ...mockRoute });
    });
  });

  describe('updateRoute', () => {
    it('should verify route exists and call repository.update', () => {
      RouteRepository.prototype.findById = jest.fn().mockReturnValue({ id: 1 });
      RouteRepository.prototype.update = jest.fn().mockReturnValue({ id: 1, origin_city: 'C' });

      const result = routeService.updateRoute(1, { origin_city: 'C' } as any);
      
      expect(RouteRepository.prototype.findById).toHaveBeenCalledWith(1);
      expect(RouteRepository.prototype.update).toHaveBeenCalledWith(1, { origin_city: 'C' });
      expect(result).toEqual({ id: 1, origin_city: 'C' });
    });
  });

  describe('getDashboardMetrics', () => {
    it('should call repository.getDashboardMetrics', () => {
      const mockMetrics = { status_counts: [], top_expensive: [] };
      RouteRepository.prototype.getDashboardMetrics = jest.fn().mockReturnValue(mockMetrics);

      const result = routeService.getDashboardMetrics('2024-01-01', '2024-12-31');
      expect(RouteRepository.prototype.getDashboardMetrics).toHaveBeenCalledWith('2024-01-01', '2024-12-31');
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('importRoutes', () => {
    it('should process a valid CSV buffer and return imported count', async () => {
      const csvBuffer = Buffer.from('origin_city,destination_city,distance_km,estimated_time_hours,vehicle_type,carrier,cost_usd,status\nBogota,Medellin,400,8,TRUCK,Fedex,100,ACTIVA');
      
      RouteRepository.prototype.create = jest.fn();

      const result = await routeService.importRoutes(csvBuffer);
      
      expect(result.imported).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(RouteRepository.prototype.create).toHaveBeenCalledTimes(1);
    });

    it('should process invalid CSV rows and return failed count', async () => {
      const csvBuffer = Buffer.from('origin_city,destination_city,distance_km\nBogota,Medellin,400'); // Faltan campos requeridos
      
      RouteRepository.prototype.create = jest.fn();

      const result = await routeService.importRoutes(csvBuffer);
      
      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].row).toBe(2);
      expect(RouteRepository.prototype.create).not.toHaveBeenCalled();
    });
  });
});

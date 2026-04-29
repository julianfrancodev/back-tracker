import { Request, Response, NextFunction } from 'express';
import { TrackingService } from '../services/tracking.service';

const trackingService = new TrackingService();

export class TrackingController {
  static async getRouteTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      // Llamada al servicio
      const data = await trackingService.getRouteTracking(id);
      
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

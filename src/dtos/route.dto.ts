import { z } from 'zod';

export const CreateRouteSchema = z.object({
  origin_city: z.string().min(1, 'La ciudad de origen es requerida'),
  destination_city: z.string().min(1, 'La ciudad de destino es requerida'),
  distance_km: z.number().positive('La distancia debe ser mayor a 0'),
  estimated_time_hours: z.number().positive('El tiempo estimado debe ser mayor a 0'),
  vehicle_type: z.string().min(1, 'El tipo de vehículo es requerido'),
  carrier: z.string().min(1, 'El transportista es requerido'),
  cost_usd: z.number().positive('El costo debe ser mayor a 0'),
  status: z.string().min(1, 'El estado es requerido'),
});

export const UpdateRouteSchema = CreateRouteSchema.partial();

export const RouteQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  origin_city: z.string().optional(),
  destination_city: z.string().optional(),
  vehicle_type: z.string().optional(),
  status: z.string().optional(),
  carrier: z.string().optional(),
});

// Infered Types for TypeScript
export type CreateRouteDTO = z.infer<typeof CreateRouteSchema>;
export type UpdateRouteDTO = z.infer<typeof UpdateRouteSchema>;
export type RouteQueryDTO = z.infer<typeof RouteQuerySchema>;

// Business Entity Interface
export interface Route {
  id: number;
  origin_city: string;
  destination_city: string;
  distance_km: number;
  estimated_time_hours: number;
  vehicle_type: string;
  carrier: string;
  cost_usd: number;
  status: string;
  created_at: string;
}

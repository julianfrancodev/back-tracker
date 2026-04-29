import { Router } from 'express';
import multer from 'multer';
import { RouteController } from '../controllers/route.controller';
import { TrackingController } from '../controllers/tracking.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Todas las rutas de 'routes' requieren estar autenticadas
router.use(verifyToken);

// Dashboard (debe ir antes de /:id para evitar colisiones)
router.get('/dashboard/metrics', requireRole(['ADMIN', 'OPERADOR']), RouteController.getDashboard);

// Importación masiva
router.post('/import', requireRole(['ADMIN']), upload.single('file'), RouteController.import);

// GET: Abierto para ADMIN y OPERADOR
router.get('/', requireRole(['ADMIN', 'OPERADOR']), RouteController.getAll);
router.get('/:id', requireRole(['ADMIN', 'OPERADOR']), RouteController.getById);
router.get('/:id/tracking', requireRole(['ADMIN', 'OPERADOR']), TrackingController.getRouteTracking);

// POST, PUT, DELETE: Solo para ADMIN
router.post('/', requireRole(['ADMIN']), RouteController.create);
router.put('/:id', requireRole(['ADMIN']), RouteController.update);
router.delete('/:id', requireRole(['ADMIN']), RouteController.delete); // Soft delete

export default router;

import { Router } from 'express';
import { createResourceController } from '../controllers/resourceController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const resources = ['tasks', 'subjects', 'schedule', 'notes', 'habits', 'savingsGoals'];

resources.forEach(resource => {
  const controller = createResourceController(resource);
  
  router.get(`/${resource}`, authenticate as any, controller.list as any);
  router.post(`/${resource}`, authenticate as any, controller.create as any);
  router.put(`/${resource}/:id`, authenticate as any, controller.update as any);
  router.delete(`/${resource}/:id`, authenticate as any, controller.delete as any);
});

export default router;
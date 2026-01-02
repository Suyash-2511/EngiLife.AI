import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// Map URL resource names to Prisma model names
const modelMap: Record<string, any> = {
  'tasks': prisma.task,
  'subjects': prisma.subject,
  'schedule': prisma.scheduleItem,
  'notes': prisma.note,
  'habits': prisma.habit,
  'savingsGoals': prisma.savingsGoal
};

export const createResourceController = (resource: string) => {
  const model = modelMap[resource];

  return {
    list: async (req: AuthRequest, res: Response) => {
      if (!req.user) return (res as any).status(401).json({ error: 'Unauthorized' });
      try {
        const items = await model.findMany({ where: { userId: req.user.id } });
        (res as any).json(items);
      } catch (error) {
        (res as any).status(500).json({ error: 'Fetch failed' });
      }
    },

    create: async (req: AuthRequest, res: Response) => {
      if (!req.user) return (res as any).status(401).json({ error: 'Unauthorized' });
      try {
        const { id, ...data } = (req as any).body;
        // If ID provided by frontend, use it. Otherwise Prisma/DB generates uuid (if model configured, but here we enforce frontend ID compatibility)
        const item = await model.create({
          data: {
            ...data,
            id: id || undefined, 
            userId: req.user.id
          }
        });
        (res as any).json(item);
      } catch (error) {
        console.error(error);
        (res as any).status(500).json({ error: 'Create failed' });
      }
    },

    update: async (req: AuthRequest, res: Response) => {
      if (!req.user) return (res as any).status(401).json({ error: 'Unauthorized' });
      try {
        const { id } = (req as any).params;
        // Verify ownership
        const existing = await model.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user.id) {
          return (res as any).status(404).json({ error: 'Not found' });
        }

        const updated = await model.update({
          where: { id },
          data: (req as any).body
        });
        (res as any).json(updated);
      } catch (error) {
        (res as any).status(500).json({ error: 'Update failed' });
      }
    },

    delete: async (req: AuthRequest, res: Response) => {
      if (!req.user) return (res as any).status(401).json({ error: 'Unauthorized' });
      try {
        const { id } = (req as any).params;
        const existing = await model.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user.id) {
            return (res as any).status(404).json({ error: 'Not found' });
        }

        await model.delete({ where: { id } });
        (res as any).json({ success: true });
      } catch (error) {
        (res as any).status(500).json({ error: 'Delete failed' });
      }
    }
  };
};
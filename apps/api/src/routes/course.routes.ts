import { Router } from 'express';
import { z } from 'zod';

import { lessonProgressSchema } from '@devagentshub/validation';

import { courseController } from '../controllers/course.controller';
import { requireAuth } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validate';

const slugParamsSchema = z.object({
  slug: z.string().min(1),
});

const idParamsSchema = z.object({
  id: z.string().min(1),
});

export const courseRoutes = Router();

courseRoutes.get('/', courseController.list);
courseRoutes.get('/lessons/:slug', validateParams(slugParamsSchema), courseController.getLessonBySlug);
courseRoutes.post(
  '/lessons/:id/progress',
  requireAuth,
  validateParams(idParamsSchema),
  validateBody(lessonProgressSchema),
  courseController.updateProgress,
);
courseRoutes.get('/:slug', validateParams(slugParamsSchema), courseController.getBySlug);


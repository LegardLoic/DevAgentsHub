import { Router } from 'express';
import { z } from 'zod';

import {
  adminArticleSchema,
  adminCourseSchema,
  adminLessonSchema,
} from '@devagentshub/validation';

import { adminContentController } from '../controllers/admin-content.controller';
import { requireAdmin } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validate';

const idParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const adminRoutes = Router();

adminRoutes.use(requireAdmin);

adminRoutes.get('/articles', adminContentController.listArticles);
adminRoutes.get('/articles/:id', validateParams(idParamsSchema), adminContentController.getArticle);
adminRoutes.post('/articles', validateBody(adminArticleSchema), adminContentController.createArticle);
adminRoutes.patch(
  '/articles/:id',
  validateParams(idParamsSchema),
  validateBody(adminArticleSchema),
  adminContentController.updateArticle,
);

adminRoutes.get('/courses', adminContentController.listCourses);
adminRoutes.get('/courses/:id', validateParams(idParamsSchema), adminContentController.getCourse);
adminRoutes.post('/courses', validateBody(adminCourseSchema), adminContentController.createCourse);
adminRoutes.patch(
  '/courses/:id',
  validateParams(idParamsSchema),
  validateBody(adminCourseSchema),
  adminContentController.updateCourse,
);
adminRoutes.post(
  '/courses/:id/lessons',
  validateParams(idParamsSchema),
  validateBody(adminLessonSchema),
  adminContentController.createLesson,
);
adminRoutes.patch(
  '/lessons/:id',
  validateParams(idParamsSchema),
  validateBody(adminLessonSchema),
  adminContentController.updateLesson,
);

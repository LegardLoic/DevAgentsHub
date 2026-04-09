import { Router } from 'express';
import { z } from 'zod';

import { discussionReplySchema, discussionSchema } from '@devagentshub/validation';

import { discussionController } from '../controllers/discussion.controller';
import { requireAuth } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validate';

const slugParamsSchema = z.object({
  slug: z.string().min(1),
});

const idParamsSchema = z.object({
  id: z.string().min(1),
});

export const discussionRoutes = Router();

discussionRoutes.get('/', discussionController.list);
discussionRoutes.post('/', requireAuth, validateBody(discussionSchema), discussionController.create);
discussionRoutes.get('/:slug', validateParams(slugParamsSchema), discussionController.getBySlug);
discussionRoutes.post(
  '/:id/replies',
  requireAuth,
  validateParams(idParamsSchema),
  validateBody(discussionReplySchema),
  discussionController.reply,
);

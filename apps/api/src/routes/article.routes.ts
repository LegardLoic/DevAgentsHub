import { Router } from 'express';
import { z } from 'zod';

import { articleController } from '../controllers/article.controller';
import { validateParams } from '../middlewares/validate';

const slugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const articleRoutes = Router();

articleRoutes.get('/', articleController.list);
articleRoutes.get('/:slug/metadata', validateParams(slugParamsSchema), articleController.getMetadataBySlug);
articleRoutes.get('/:slug', validateParams(slugParamsSchema), articleController.getBySlug);

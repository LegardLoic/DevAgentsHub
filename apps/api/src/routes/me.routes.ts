import { Router } from 'express';
import { z } from 'zod';

import { createTemplateSchema, updateTemplateSchema } from '@devagentshub/validation';

import { meController } from '../controllers/me.controller';
import { requireAuth } from '../middlewares/auth';
import { validateBody, validateParams } from '../middlewares/validate';

const toolRunParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const meRoutes = Router();

meRoutes.use(requireAuth);

meRoutes.get('/tool-runs', meController.listToolRuns);
meRoutes.get('/tool-runs/:id', validateParams(toolRunParamsSchema), meController.getToolRun);
meRoutes.get('/templates', meController.listTemplates);
meRoutes.get('/templates/:id', validateParams(toolRunParamsSchema), meController.getTemplate);
meRoutes.post('/templates', validateBody(createTemplateSchema), meController.createTemplate);
meRoutes.patch(
  '/templates/:id',
  validateParams(toolRunParamsSchema),
  validateBody(updateTemplateSchema),
  meController.updateTemplate,
);

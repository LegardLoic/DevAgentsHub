import { Router } from 'express';
import { z } from 'zod';

import {
  debugHelperSchema,
  projectStructureSchema,
  promptGeneratorSchema,
} from '@devagentshub/validation';

import { toolController } from '../controllers/tool.controller';
import { validateBody, validateParams } from '../middlewares/validate';

const slugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const toolRoutes = Router();

toolRoutes.get('/', toolController.list);
toolRoutes.post(
  '/prompt-generator/run',
  validateBody(promptGeneratorSchema),
  toolController.runPromptGenerator,
);
toolRoutes.post(
  '/project-structure-generator/run',
  validateBody(projectStructureSchema),
  toolController.runProjectStructureGenerator,
);
toolRoutes.post('/debug-helper/run', validateBody(debugHelperSchema), toolController.runDebugHelper);
toolRoutes.get('/:slug', validateParams(slugParamsSchema), toolController.getBySlug);


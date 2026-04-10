import { Router } from 'express';
import { z } from 'zod';

import { meController } from '../controllers/me.controller';
import { requireAuth } from '../middlewares/auth';
import { validateParams } from '../middlewares/validate';

const toolRunParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const meRoutes = Router();

meRoutes.use(requireAuth);

meRoutes.get('/tool-runs', meController.listToolRuns);
meRoutes.get('/tool-runs/:id', validateParams(toolRunParamsSchema), meController.getToolRun);

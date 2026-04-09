import { Router } from 'express';

import { loginSchema, registerSchema } from '@devagentshub/validation';

import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate';

export const authRoutes = Router();

authRoutes.post('/register', validateBody(registerSchema), authController.register);
authRoutes.post('/login', validateBody(loginSchema), authController.login);
authRoutes.post('/logout', authController.logout);
authRoutes.get('/me', authController.me);


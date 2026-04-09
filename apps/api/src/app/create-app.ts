import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from '../config/env';
import { attachAuthUser } from '../middlewares/auth';
import { errorHandler } from '../middlewares/error-handler';
import { notFoundHandler } from '../middlewares/not-found';
import { articleRoutes } from '../routes/article.routes';
import { authRoutes } from '../routes/auth.routes';
import { courseRoutes } from '../routes/course.routes';
import { discussionRoutes } from '../routes/discussion.routes';
import { toolRoutes } from '../routes/tool.routes';

export const createApp = () => {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(attachAuthUser);

  app.get('/health', (_req, res) => {
    res.json({
      data: {
        status: 'ok',
      },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/tools', toolRoutes);
  app.use('/api/articles', articleRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/discussions', discussionRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};


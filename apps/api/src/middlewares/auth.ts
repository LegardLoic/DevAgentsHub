import type { NextFunction, Request, Response } from 'express';

import { AUTH_COOKIE_NAME } from '../constants/auth';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';
import { verifyAuthToken } from '../utils/jwt';

const extractToken = (req: Request): string | null => {
  if (req.cookies?.[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }

  const authorization = req.header('authorization');

  if (authorization?.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '').trim();
  }

  return null;
};

export const attachAuthUser = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = extractToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await userRepository.findById(payload.userId);

    if (user) {
      req.authUser = user;
    }
  } catch {
    req.authUser = undefined;
  }

  next();
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.authUser) {
    next(new AppError('Authentication is required for this action.', 401, 'UNAUTHORIZED'));
    return;
  }

  next();
};

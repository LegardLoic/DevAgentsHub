import type { Response } from 'express';

import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from '../constants/auth';
import { env } from '../config/env';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/app-error';
import { authService, type AuthService } from '../services/auth.service';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: env.isProduction ? 'none' : 'lax',
    secure: env.isProduction,
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
};

export class AuthController {
  constructor(private readonly auth: AuthService = authService) {}

  register = asyncHandler(async (req, res) => {
    const result = await this.auth.register(req.body);

    setAuthCookie(res, result.token);

    res.status(201).json({
      data: {
        user: result.user,
      },
    });
  });

  login = asyncHandler(async (req, res) => {
    const result = await this.auth.login(req.body);

    setAuthCookie(res, result.token);

    res.status(200).json({
      data: {
        user: result.user,
      },
    });
  });

  logout = asyncHandler(async (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: env.isProduction ? 'none' : 'lax',
      secure: env.isProduction,
    });

    res.status(200).json({
      data: {
        success: true,
      },
    });
  });

  me = asyncHandler(async (req, res) => {
    if (!req.authUser) {
      throw new AppError('Authentication is required for this action.', 401, 'UNAUTHORIZED');
    }

    res.status(200).json({
      data: {
        user: req.authUser,
      },
    });
  });
}

export const authController = new AuthController();

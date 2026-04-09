import jwt from 'jsonwebtoken';

import { env } from '../config/env';

interface TokenPayload {
  userId: string;
}

export const signAuthToken = (userId: string): string =>
  jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: '7d',
  });

export const verifyAuthToken = (token: string): TokenPayload =>
  jwt.verify(token, env.jwtSecret) as TokenPayload;


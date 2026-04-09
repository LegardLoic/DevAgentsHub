import type { AuthUser } from '@devagentshub/types';

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export {};


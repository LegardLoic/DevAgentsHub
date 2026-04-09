import type { Prisma } from '@prisma/client';

import type { AuthUser, UserRole } from '@devagentshub/types';

import { prisma } from '../lib/prisma';

const userInclude = {
  profile: true,
} satisfies Prisma.UserInclude;

type UserRecord = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

export const serializeAuthUser = (user: UserRecord): AuthUser => ({
  id: user.id,
  email: user.email,
  role: user.role as UserRole,
  createdAt: user.createdAt.toISOString(),
  profile: user.profile
    ? {
        displayName: user.profile.displayName,
        bio: user.profile.bio,
        avatarUrl: user.profile.avatarUrl,
      }
    : null,
});

export class UserRepository {
  async findForAuthByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: userInclude,
    });
  }

  async findRecordById(id: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = await this.findRecordById(id);
    return user ? serializeAuthUser(user) : null;
  }

  async createUser(input: {
    email: string;
    passwordHash: string;
    displayName: string;
    role?: UserRole;
  }): Promise<UserRecord> {
    return prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        role: input.role,
        profile: {
          create: {
            displayName: input.displayName,
          },
        },
      },
      include: userInclude,
    });
  }
}

export const userRepository = new UserRepository();


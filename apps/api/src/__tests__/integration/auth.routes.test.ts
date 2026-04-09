import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: prismaMock,
}));

import { createApp } from '../../app/create-app';
import { AUTH_COOKIE_NAME } from '../../constants/auth';
import { hashPassword } from '../../utils/password';

const baseDates = {
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const buildUserRecord = async (overrides?: Partial<{ id: string; email: string; displayName: string }>) => ({
  id: overrides?.id ?? 'user_1',
  email: overrides?.email ?? 'user@example.com',
  passwordHash: await hashPassword('Password123'),
  role: 'USER',
  profile: {
    id: 'profile_1',
    userId: overrides?.id ?? 'user_1',
    displayName: overrides?.displayName ?? 'Demo User',
    bio: null,
    avatarUrl: null,
    ...baseDates,
  },
  ...baseDates,
});

describe('auth routes', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.user.create.mockReset();
  });

  it('registers a user and sets the auth cookie', async () => {
    const createdUser = await buildUserRecord({
      id: 'user_new',
      email: 'new-user@example.com',
      displayName: 'New User',
    });

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce(createdUser);

    const response = await request(createApp()).post('/api/auth/register').send({
      displayName: 'New User',
      email: 'new-user@example.com',
      password: 'Password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user).toMatchObject({
      id: 'user_new',
      email: 'new-user@example.com',
      profile: {
        displayName: 'New User',
      },
    });
    expect(response.headers['set-cookie']?.[0]).toContain(`${AUTH_COOKIE_NAME}=`);
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
  });

  it('logs in, exposes the current user, and clears the cookie on logout', async () => {
    const existingUser = await buildUserRecord();
    const agent = request.agent(createApp());

    prismaMock.user.findUnique
      .mockResolvedValueOnce(existingUser)
      .mockResolvedValueOnce(existingUser);

    const loginResponse = await agent.post('/api/auth/login').send({
      email: existingUser.email,
      password: 'Password123',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data.user.email).toBe(existingUser.email);
    expect(loginResponse.headers['set-cookie']?.[0]).toContain(`${AUTH_COOKIE_NAME}=`);

    const meResponse = await agent.get('/api/auth/me');

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.user).toMatchObject({
      id: existingUser.id,
      email: existingUser.email,
    });

    const logoutResponse = await agent.post('/api/auth/logout').send({});

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.data.success).toBe(true);
    expect(logoutResponse.headers['set-cookie']?.[0]).toContain(`${AUTH_COOKIE_NAME}=;`);

    const meAfterLogoutResponse = await agent.get('/api/auth/me');

    expect(meAfterLogoutResponse.status).toBe(401);
    expect(meAfterLogoutResponse.body.error.code).toBe('UNAUTHORIZED');
  });
});

import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const loginMock = vi.hoisted(() => vi.fn());

vi.mock('../../services/auth.service', () => ({
  authService: {
    login: loginMock,
  },
  AuthService: class {},
}));

import { createApp } from '../../app/create-app';

describe('auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the logged-in user and sets the auth cookie', async () => {
    loginMock.mockResolvedValueOnce({
      user: {
        id: 'user_1',
        email: 'user@example.com',
        role: 'USER',
        createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        profile: {
          displayName: 'Demo User',
          bio: null,
          avatarUrl: null,
        },
      },
      token: 'signed-token',
    });

    const response = await request(createApp()).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'Password123',
    });

    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('user@example.com');
    expect(response.headers['set-cookie']?.[0]).toContain('devagentshub_token=');
  });

  it('returns a validation error before the controller runs', async () => {
    const response = await request(createApp()).post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'short',
    });

    expect(response.status).toBe(400);
    expect(loginMock).not.toHaveBeenCalled();
  });
});

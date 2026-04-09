import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../services/auth.service';
import { hashPassword } from '../../utils/password';

type MockUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: 'USER';
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: string;
    userId: string;
    displayName: string;
    bio: null;
    avatarUrl: null;
    createdAt: Date;
    updatedAt: Date;
  };
};

const buildUserRecord = (overrides?: Partial<MockUserRecord>): MockUserRecord => ({
  id: 'user_1',
  email: 'user@example.com',
  passwordHash: 'hashed',
  role: 'USER',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  profile: {
    id: 'profile_1',
    userId: 'user_1',
    displayName: 'Demo User',
    bio: null,
    avatarUrl: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  ...overrides,
});

describe('AuthService', () => {
  const repository = {
    findForAuthByEmail: vi.fn(),
    createUser: vi.fn(),
  };

  const service = new AuthService(repository as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a new user and returns a signed session payload', async () => {
    repository.findForAuthByEmail.mockResolvedValueOnce(null);
    repository.createUser.mockImplementationOnce(async (input) =>
      buildUserRecord({
        email: input.email,
        passwordHash: input.passwordHash,
      }),
    );

    const result = await service.register({
      displayName: 'Demo User',
      email: 'User@Example.com',
      password: 'Password123',
    });

    expect(repository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'User@Example.com',
        displayName: 'Demo User',
      }),
    );
    expect(result.user.email).toBe('User@Example.com');
    expect(result.token).toBeTypeOf('string');
  });

  it('rejects invalid login credentials', async () => {
    repository.findForAuthByEmail.mockResolvedValueOnce(
      buildUserRecord({
        passwordHash: await hashPassword('CorrectPassword123'),
      }),
    );

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'WrongPassword123',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      statusCode: 401,
    });
  });
});

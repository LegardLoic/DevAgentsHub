import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  toolRun: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: prismaMock,
}));

import { createApp } from '../../app/create-app';
import { AUTH_COOKIE_NAME } from '../../constants/auth';
import { signAuthToken } from '../../utils/jwt';

const baseDates = {
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const authUserRecord = {
  id: 'user_saved_runs',
  email: 'saved-runs@example.com',
  passwordHash: 'hashed-password',
  role: 'USER',
  profile: {
    id: 'profile_saved_runs',
    userId: 'user_saved_runs',
    displayName: 'Saved Runs User',
    bio: null,
    avatarUrl: null,
    ...baseDates,
  },
  ...baseDates,
};

const authCookie = `${AUTH_COOKIE_NAME}=${signAuthToken(authUserRecord.id)}`;

const promptRunRecord = {
  id: 'run_prompt_1',
  toolId: 'tool_prompt',
  userId: authUserRecord.id,
  inputJson: {
    projectType: 'Fullstack platform',
    stack: 'Next.js, Express, Prisma',
    goal: 'Add a dashboard for saved runs.',
    constraints: 'Keep the scope within the MVP.',
    detailLevel: 'balanced',
  },
  outputJson: {
    title: 'Structured fullstack prompt',
    summary: 'A prompt for continuing an MVP feature flow.',
    prompt:
      'You are a senior engineer. Project type: Fullstack platform. Goal: Add a dashboard for saved runs.',
    sections: [
      {
        label: 'Project Type',
        value: 'Fullstack platform',
      },
    ],
  },
  createdAt: new Date('2026-03-01T09:00:00.000Z'),
  tool: {
    id: 'tool_prompt',
    slug: 'prompt-generator',
    name: 'Prompt Generator',
    description: 'Build structured prompts for coding agents.',
    category: 'PROMPTING',
    isPublished: true,
  },
};

const debugRunRecord = {
  id: 'run_debug_1',
  toolId: 'tool_debug',
  userId: authUserRecord.id,
  inputJson: {
    errorMessage: 'TypeError: Cannot read properties of undefined',
    codeSnippet: 'return user.profile.displayName;',
    technicalContext: 'Dashboard page rendering the current user name.',
  },
  outputJson: {
    summary: 'Check whether the user can exist without a profile payload.',
    possibleCauses: ['The profile object can be undefined for some users.'],
    resolutionSteps: ['Guard the profile access before rendering the name.'],
    debugChecklist: ['Reproduce the issue with a user missing profile data.'],
  },
  createdAt: new Date('2026-03-02T09:00:00.000Z'),
  tool: {
    id: 'tool_debug',
    slug: 'debug-helper',
    name: 'Debug Helper',
    description: 'Turn failures into a debugging plan.',
    category: 'DEBUGGING',
    isPublished: true,
  },
};

describe('me routes', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.toolRun.findMany.mockReset();
    prismaMock.toolRun.findFirst.mockReset();
  });

  it('lists the authenticated user saved tool runs', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.toolRun.findMany.mockResolvedValueOnce([debugRunRecord, promptRunRecord]);

    const response = await request(createApp()).get('/api/me/tool-runs').set('Cookie', authCookie);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([
      expect.objectContaining({
        id: 'run_debug_1',
        tool: expect.objectContaining({
          slug: 'debug-helper',
        }),
      }),
      expect.objectContaining({
        id: 'run_prompt_1',
        preview: expect.stringContaining('You are a senior engineer'),
      }),
    ]);
    expect(prismaMock.toolRun.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: authUserRecord.id,
        },
      }),
    );
  });

  it('rejects unauthenticated access to saved runs', async () => {
    const response = await request(createApp()).get('/api/me/tool-runs');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(prismaMock.toolRun.findMany).not.toHaveBeenCalled();
  });

  it('returns a saved run owned by the authenticated user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.toolRun.findFirst.mockResolvedValueOnce(promptRunRecord);

    const response = await request(createApp()).get('/api/me/tool-runs/run_prompt_1').set('Cookie', authCookie);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: 'run_prompt_1',
      tool: {
        slug: 'prompt-generator',
      },
      input: {
        projectType: 'Fullstack platform',
      },
      output: {
        title: 'Structured fullstack prompt',
      },
    });
  });

  it('does not expose another user saved run', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.toolRun.findFirst.mockResolvedValueOnce(null);

    const response = await request(createApp()).get('/api/me/tool-runs/run_other_user').set('Cookie', authCookie);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('TOOL_RUN_NOT_FOUND');
  });

  it('returns not found when the requested saved run does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.toolRun.findFirst.mockResolvedValueOnce(null);

    const response = await request(createApp()).get('/api/me/tool-runs/run_missing').set('Cookie', authCookie);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('TOOL_RUN_NOT_FOUND');
  });
});

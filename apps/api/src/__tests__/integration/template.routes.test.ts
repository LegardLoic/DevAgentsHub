import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  tool: {
    findUnique: vi.fn(),
  },
  template: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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
  id: 'user_templates',
  email: 'templates@example.com',
  passwordHash: 'hashed-password',
  role: 'USER',
  profile: {
    id: 'profile_templates',
    userId: 'user_templates',
    displayName: 'Template User',
    bio: null,
    avatarUrl: null,
    ...baseDates,
  },
  ...baseDates,
};

const authCookie = `${AUTH_COOKIE_NAME}=${signAuthToken(authUserRecord.id)}`;

const promptToolRecord = {
  id: 'tool_prompt',
  slug: 'prompt-generator',
  name: 'Prompt Generator',
  description: 'Build structured prompts for coding agents.',
  category: 'PROMPTING',
  isPublished: true,
};

const promptTemplateRecord = {
  id: 'template_prompt_1',
  userId: authUserRecord.id,
  name: 'React SaaS launch prompt',
  toolSlug: 'prompt-generator',
  inputJson: {
    projectType: 'React SaaS',
    stack: 'Next.js, Prisma, PostgreSQL',
    goal: 'Ship a reusable onboarding prompt.',
    constraints: 'Stay within the current MVP.',
    detailLevel: 'detailed',
  },
  tool: promptToolRecord,
  createdAt: new Date('2026-03-05T09:00:00.000Z'),
  updatedAt: new Date('2026-03-06T09:00:00.000Z'),
};

const debugToolRecord = {
  id: 'tool_debug',
  slug: 'debug-helper',
  name: 'Debug Helper',
  description: 'Turn failures into a debugging plan.',
  category: 'DEBUGGING',
  isPublished: true,
};

const debugTemplateRecord = {
  id: 'template_debug_1',
  userId: authUserRecord.id,
  name: 'Undefined profile crash',
  toolSlug: 'debug-helper',
  inputJson: {
    errorMessage: 'TypeError: Cannot read properties of undefined',
    codeSnippet: 'return user.profile.displayName;',
    technicalContext: 'Dashboard greeting for partially seeded users.',
  },
  tool: debugToolRecord,
  createdAt: new Date('2026-03-07T09:00:00.000Z'),
  updatedAt: new Date('2026-03-07T09:00:00.000Z'),
};

describe('template routes', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.tool.findUnique.mockReset();
    prismaMock.template.findMany.mockReset();
    prismaMock.template.findFirst.mockReset();
    prismaMock.template.create.mockReset();
    prismaMock.template.update.mockReset();
  });

  it('lists the authenticated user templates', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.template.findMany.mockResolvedValueOnce([debugTemplateRecord, promptTemplateRecord]);

    const response = await request(createApp()).get('/api/me/templates').set('Cookie', authCookie);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([
      expect.objectContaining({
        id: 'template_debug_1',
        tool: expect.objectContaining({
          slug: 'debug-helper',
        }),
      }),
      expect.objectContaining({
        id: 'template_prompt_1',
        name: 'React SaaS launch prompt',
      }),
    ]);
    expect(prismaMock.template.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: authUserRecord.id,
        },
      }),
    );
  });

  it('rejects unauthenticated access to templates', async () => {
    const response = await request(createApp()).get('/api/me/templates');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(prismaMock.template.findMany).not.toHaveBeenCalled();
  });

  it('returns one template owned by the authenticated user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.template.findFirst.mockResolvedValueOnce(promptTemplateRecord);

    const response = await request(createApp())
      .get('/api/me/templates/template_prompt_1')
      .set('Cookie', authCookie);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: 'template_prompt_1',
      name: 'React SaaS launch prompt',
      tool: {
        slug: 'prompt-generator',
      },
      input: {
        projectType: 'React SaaS',
      },
    });
  });

  it('does not expose another user template', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.template.findFirst.mockResolvedValueOnce(null);

    const response = await request(createApp())
      .get('/api/me/templates/template_other_user')
      .set('Cookie', authCookie);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('TEMPLATE_NOT_FOUND');
  });

  it('creates a template for the authenticated user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.tool.findUnique.mockResolvedValueOnce(promptToolRecord);
    prismaMock.template.create.mockResolvedValueOnce(promptTemplateRecord);

    const response = await request(createApp())
      .post('/api/me/templates')
      .set('Cookie', authCookie)
      .send({
        name: 'React SaaS launch prompt',
        toolSlug: 'prompt-generator',
        input: {
          projectType: 'React SaaS',
          stack: 'Next.js, Prisma, PostgreSQL',
          goal: 'Ship a reusable onboarding prompt.',
          constraints: 'Stay within the current MVP.',
          detailLevel: 'detailed',
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      id: 'template_prompt_1',
      name: 'React SaaS launch prompt',
      toolSlug: 'prompt-generator',
    });
    expect(prismaMock.tool.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: 'prompt-generator',
        },
      }),
    );
    expect(prismaMock.template.create).toHaveBeenCalled();
  });

  it('updates a template for the authenticated user', async () => {
    const updatedTemplateRecord = {
      ...promptTemplateRecord,
      name: 'React SaaS prompt v2',
      inputJson: {
        ...promptTemplateRecord.inputJson,
        goal: 'Ship a reusable onboarding prompt with clearer constraints.',
      },
      updatedAt: new Date('2026-03-08T09:00:00.000Z'),
    };

    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.template.findFirst
      .mockResolvedValueOnce(promptTemplateRecord)
      .mockResolvedValueOnce(promptTemplateRecord);
    prismaMock.template.update.mockResolvedValueOnce(updatedTemplateRecord);

    const response = await request(createApp())
      .patch('/api/me/templates/template_prompt_1')
      .set('Cookie', authCookie)
      .send({
        name: 'React SaaS prompt v2',
        input: {
          ...promptTemplateRecord.inputJson,
          goal: 'Ship a reusable onboarding prompt with clearer constraints.',
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: 'template_prompt_1',
      name: 'React SaaS prompt v2',
      input: {
        goal: 'Ship a reusable onboarding prompt with clearer constraints.',
      },
    });
    expect(prismaMock.template.update).toHaveBeenCalled();
  });

  it('rejects invalid tool slugs on create', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);

    const response = await request(createApp())
      .post('/api/me/templates')
      .set('Cookie', authCookie)
      .send({
        name: 'Invalid tool',
        toolSlug: 'unknown-tool',
        input: {},
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(prismaMock.tool.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.template.create).not.toHaveBeenCalled();
  });

  it('returns not found when the requested template does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(authUserRecord);
    prismaMock.template.findFirst.mockResolvedValueOnce(null);

    const response = await request(createApp())
      .get('/api/me/templates/template_missing')
      .set('Cookie', authCookie);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('TEMPLATE_NOT_FOUND');
  });
});

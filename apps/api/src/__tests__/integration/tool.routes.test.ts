import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  tool: {
    findFirst: vi.fn(),
  },
  toolRun: {
    create: vi.fn(),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: prismaMock,
}));

import { createApp } from '../../app/create-app';

const buildToolRecord = (overrides: {
  id: string;
  slug: 'prompt-generator' | 'project-structure-generator' | 'debug-helper';
  name: string;
  description: string;
  category: 'PROMPTING' | 'ARCHITECTURE' | 'DEBUGGING';
}) => ({
  ...overrides,
  isPublished: true,
});

describe('tool routes', () => {
  beforeEach(() => {
    prismaMock.tool.findFirst.mockReset();
    prismaMock.toolRun.create.mockReset();
  });

  it('runs the prompt generator flow', async () => {
    prismaMock.tool.findFirst.mockResolvedValueOnce(
      buildToolRecord({
        id: 'tool_prompt',
        slug: 'prompt-generator',
        name: 'Prompt Generator',
        description: 'Builds structured implementation briefs.',
        category: 'PROMPTING',
      }),
    );
    prismaMock.toolRun.create.mockResolvedValueOnce(undefined);

    const response = await request(createApp()).post('/api/tools/prompt-generator/run').send({
      projectType: 'Production-ready MVP',
      stack: 'Next.js + Express + Prisma',
      goal: 'Ship an end-to-end MVP for developers.',
      constraints: 'Preserve clean architecture and strict typing.',
      detailLevel: 'balanced',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.tool.slug).toBe('prompt-generator');
    expect(response.body.data.output.prompt).toContain('Production-ready MVP');
    expect(response.body.data.output.sections).toHaveLength(5);
    expect(prismaMock.toolRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          toolId: 'tool_prompt',
          userId: null,
        }),
      }),
    );
  });

  it('runs the project structure generator flow', async () => {
    prismaMock.tool.findFirst.mockResolvedValueOnce(
      buildToolRecord({
        id: 'tool_structure',
        slug: 'project-structure-generator',
        name: 'Project Structure Generator',
        description: 'Returns an opinionated project tree.',
        category: 'ARCHITECTURE',
      }),
    );
    prismaMock.toolRun.create.mockResolvedValueOnce(undefined);

    const response = await request(createApp())
      .post('/api/tools/project-structure-generator/run')
      .send({
        projectName: 'DevAgentsHub',
        template: 'fullstack-monorepo',
        includeTesting: true,
        includeDocker: true,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.tool.slug).toBe('project-structure-generator');
    expect(response.body.data.output.projectName).toBe('devagentshub');
    expect(response.body.data.output.tree).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'apps',
          type: 'directory',
        }),
      ]),
    );
    expect(response.body.data.output.notes).toHaveLength(3);
  });

  it('runs the debug helper flow', async () => {
    prismaMock.tool.findFirst.mockResolvedValueOnce(
      buildToolRecord({
        id: 'tool_debug',
        slug: 'debug-helper',
        name: 'Debug Helper',
        description: 'Returns a structured debug plan.',
        category: 'DEBUGGING',
      }),
    );
    prismaMock.toolRun.create.mockResolvedValueOnce(undefined);

    const response = await request(createApp()).post('/api/tools/debug-helper/run').send({
      errorMessage: 'TypeError: Cannot read properties of undefined',
      codeSnippet: 'return data.user.profile.displayName;',
      technicalContext: 'Next.js page rendering a profile panel after an API request.',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.tool.slug).toBe('debug-helper');
    expect(response.body.data.output.summary).toContain('narrowing the failing boundary');
    expect(response.body.data.output.possibleCauses.length).toBeGreaterThan(0);
    expect(response.body.data.output.debugChecklist).toContain(
      'Add a focused regression test once the fix is confirmed.',
    );
  });
});

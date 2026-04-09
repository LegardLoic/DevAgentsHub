import { describe, expect, it } from 'vitest';

import { generatePrompt, slugify } from './index';

describe('slugify', () => {
  it('normalizes strings into URL safe slugs', () => {
    expect(slugify('Dev Agents Hub MVP')).toBe('dev-agents-hub-mvp');
  });
});

describe('generatePrompt', () => {
  it('builds a structured prompt with the requested detail level', () => {
    const output = generatePrompt({
      projectType: 'Fullstack monorepo',
      stack: 'Next.js, Express, Prisma',
      goal: 'Create a production-ready scaffold',
      constraints: 'Use strict typing and keep modules small',
      detailLevel: 'detailed',
    });

    expect(output.title).toContain('Fullstack monorepo');
    expect(output.prompt).toContain('Use strict typing');
    expect(output.sections).toHaveLength(5);
  });
});


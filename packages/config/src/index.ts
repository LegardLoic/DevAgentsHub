import type { CourseSummary, ToolSummary } from '@devagentshub/types';

export const siteConfig = {
  name: 'DevAgentsHub',
  description:
    'A developer platform that combines AI-focused tooling, guides, learning paths, and community discussions.',
  tagline: 'Ship faster with better prompts, cleaner architecture, and a focused learning loop.',
};

export const navigationItems = [
  { href: '/', label: 'Home' },
  { href: '/tools', label: 'Tools' },
  { href: '/guides', label: 'Guides' },
  { href: '/formations', label: 'Formations' },
  { href: '/community', label: 'Community' },
];

export const toolCatalog: Array<Omit<ToolSummary, 'id'>> = [
  {
    slug: 'prompt-generator',
    name: 'Prompt Generator',
    description:
      'Build structured prompts for coding agents with project type, stack, goal, and constraint context.',
    category: 'PROMPTING',
    isPublished: true,
  },
  {
    slug: 'project-structure-generator',
    name: 'Project Structure Generator',
    description:
      'Generate opinionated project trees for frontend, backend, and monorepo development work.',
    category: 'ARCHITECTURE',
    isPublished: true,
  },
  {
    slug: 'debug-helper',
    name: 'Debug Helper',
    description:
      'Turn an error message and code snippet into a practical debugging plan with likely root causes.',
    category: 'DEBUGGING',
    isPublished: true,
  },
];

export const featuredCourse: Omit<CourseSummary, 'id'> = {
  slug: 'ai-agents-for-developers',
  title: 'Getting Started with AI Agents for Development',
  description:
    'A compact learning path on briefing agents well, structuring delivery, and reviewing results critically.',
  isPublished: true,
  lessonsCount: 3,
};

export const gitWorkflow = ['main', 'develop', 'feature/*', 'fix/*', 'hotfix/*'];


import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';

interface GuideSeoEntry {
  title: string;
  description: string;
}

const guideSeoBySlug: Record<string, GuideSeoEntry> = {
  'brief-coding-agents-clearly': {
    title: 'How to Brief Coding Agents Clearly',
    description:
      'Learn how to brief coding agents with explicit scope, constraints, and delivery expectations to reduce rework.',
  },
  'structure-ai-dev-projects-cleanly': {
    title: 'How to Structure AI-Assisted Projects Cleanly',
    description:
      'Use a clean project structure for AI-assisted development without collapsing responsibilities or losing maintainability.',
  },
  'use-ai-agents-in-dev-workflow': {
    title: 'How to Use AI Agents in a Practical Development Workflow',
    description:
      'A practical workflow for using AI agents in software delivery without skipping review, testing, and architecture checks.',
  },
};

export const guidesPageMetadata: Metadata = {
  title: `Guides | ${siteConfig.name}`,
  description:
    'Editorial guides for production-minded AI-assisted development, covering prompts, project structure, and practical delivery workflows.',
};

export const buildGuideMetadata = (slug: string): Metadata => {
  const entry = guideSeoBySlug[slug];

  if (!entry) {
    return {
      title: `Guide | ${siteConfig.name}`,
      description: 'Read practical guides for AI-assisted development on DevAgentsHub.',
    };
  }

  return {
    title: `${entry.title} | Guides | ${siteConfig.name}`,
    description: entry.description,
    openGraph: {
      title: entry.title,
      description: entry.description,
      type: 'article',
    },
  };
};

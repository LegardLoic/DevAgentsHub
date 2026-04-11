import type { Metadata } from 'next';

import { siteConfig } from '@devagentshub/config';
import type { ArticleMetadata } from '@devagentshub/types';

import { apiFetch } from './api';
import { buildSeoMetadata } from './seo';

interface GuideSeoEntry {
  title: string;
  description: string;
  keywords: string[];
}

const guideSeoBySlug: Record<string, GuideSeoEntry> = {
  'brief-coding-agents-clearly': {
    title: 'How to Brief Coding Agents Clearly',
    description:
      'Learn how to brief coding agents with explicit scope, constraints, and delivery expectations to reduce rework.',
    keywords: ['coding agents', 'AI prompts', 'prompt engineering for developers', 'agent briefing'],
  },
  'structure-ai-dev-projects-cleanly': {
    title: 'How to Structure AI-Assisted Projects Cleanly',
    description:
      'Use a clean project structure for AI-assisted development without collapsing responsibilities or losing maintainability.',
    keywords: ['AI-assisted development', 'project structure', 'software architecture', 'monorepo structure'],
  },
  'use-ai-agents-in-dev-workflow': {
    title: 'How to Use AI Agents in a Practical Development Workflow',
    description:
      'A practical workflow for using AI agents in software delivery without skipping review, testing, and architecture checks.',
    keywords: ['AI agents workflow', 'developer productivity', 'AI coding workflow', 'software delivery'],
  },
};

export const guidesPageMetadata: Metadata = buildSeoMetadata({
  title: 'AI Development Guides for Prompting, Architecture, and Workflow',
  description:
    'Editorial guides for production-minded AI-assisted development, covering prompts, project structure, and practical delivery workflows.',
  path: '/guides',
  keywords: ['AI development guides', 'developer prompts', 'AI-assisted development', 'coding agents'],
});

const fetchGuideArticleMetadata = async (slug: string): Promise<ArticleMetadata | null> => {
  try {
    return await apiFetch<ArticleMetadata>(`/api/articles/${slug}/metadata`);
  } catch {
    return null;
  }
};

const getFallbackGuideMetadata = (slug: string): Metadata => {
  const entry = guideSeoBySlug[slug];

  if (!entry) {
    return buildSeoMetadata({
      title: `Guide | ${siteConfig.name}`,
      description: 'Read practical guides for AI-assisted development on DevAgentsHub.',
      path: `/guides/${slug}`,
      type: 'article',
    });
  }

  return buildSeoMetadata({
    title: entry.title,
    description: entry.description,
    path: `/guides/${slug}`,
    type: 'article',
    keywords: entry.keywords,
  });
};

export const buildGuideMetadata = async (slug: string): Promise<Metadata> => {
  const article = await fetchGuideArticleMetadata(slug);

  if (!article) {
    return getFallbackGuideMetadata(slug);
  }

  const entry = guideSeoBySlug[slug];
  const description = article.metaDescription?.trim() || article.excerpt;

  return buildSeoMetadata({
    title: article.title,
    description,
    path: `/guides/${article.slug}`,
    type: 'article',
    keywords: entry?.keywords,
  });
};

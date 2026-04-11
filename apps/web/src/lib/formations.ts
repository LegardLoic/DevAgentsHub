import type { Metadata } from 'next';

import { featuredCourse, siteConfig } from '@devagentshub/config';

import { buildSeoMetadata } from './seo';

interface LessonSeoEntry {
  title: string;
  description: string;
}

const lessonSeoBySlug: Record<string, LessonSeoEntry> = {
  'understanding-agent-responsibilities': {
    title: 'Understanding AI Agent Responsibilities',
    description:
      'Learn how to scope coding-agent responsibilities so AI-assisted development stays reviewable and maintainable.',
  },
  'writing-effective-briefs': {
    title: 'Writing Effective Briefs for Coding Agents',
    description:
      'Learn how to write AI coding briefs with goals, constraints, architecture context, and acceptance checks.',
  },
  'reviewing-agent-output': {
    title: 'Reviewing AI Agent Output Critically',
    description:
      'Review AI-generated code like teammate work: check architecture, validation, tests, and regression risks before merging.',
  },
};

export const formationsPageMetadata: Metadata = buildSeoMetadata({
  title: 'AI Development Formations and Lessons',
  description:
    'Follow compact lessons for briefing AI agents, structuring delivery, reviewing output, and turning one-off results into repeatable development habits.',
  path: '/formations',
  keywords: ['AI development course', 'coding agents course', 'AI-assisted development lessons'],
});

export const buildCourseMetadata = (slug: string): Metadata => {
  if (slug !== featuredCourse.slug) {
    return buildSeoMetadata({
      title: `Formation | ${siteConfig.name}`,
      description: 'Follow practical DevAgentsHub formations for AI-assisted software delivery.',
      path: `/formations/${slug}`,
    });
  }

  return buildSeoMetadata({
    title: 'Getting Started with AI Agents for Development',
    description: featuredCourse.description,
    path: `/formations/${featuredCourse.slug}`,
    keywords: ['AI agents for developers', 'coding agents course', 'AI development workflow'],
  });
};

export const buildLessonMetadata = (slug: string): Metadata => {
  const entry = lessonSeoBySlug[slug];

  if (!entry) {
    return buildSeoMetadata({
      title: `Lesson | ${siteConfig.name}`,
      description: 'Study practical DevAgentsHub lessons for AI-assisted development workflows.',
      path: `/formations/lessons/${slug}`,
    });
  }

  return buildSeoMetadata({
    title: entry.title,
    description: entry.description,
    path: `/formations/lessons/${slug}`,
    keywords: ['AI agent lesson', 'coding agent workflow', 'developer education'],
  });
};

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

import { featuredCourse, toolCatalog } from '@devagentshub/config';
import { excerpt, slugify } from '@devagentshub/utils';

const prisma = new PrismaClient();

const adminEmail = 'admin@devagentshub.local';
const adminPassword = 'Admin12345';

const articles = [
  {
    slug: 'brief-coding-agents-clearly',
    title: 'How to Brief Coding Agents Clearly',
    metaDescription:
      'Learn how to brief coding agents with clear scope, constraints, and delivery expectations for production work.',
    content: `# Brief coding agents clearly

Strong briefs reduce rework. Start with the product goal, the active constraints, and the expected delivery shape.

## What a useful brief includes

- The current architecture and folder boundaries
- The business goal and MVP limits
- Non-negotiable stack choices
- Validation, testing, and deployment expectations

## What to avoid

- Vague prompts that ask the agent to "improve everything"
- Missing environment assumptions
- Ambiguous ownership for shared modules

The tighter the brief, the more reliable the delivery and review process becomes.`,
  },
  {
    slug: 'structure-ai-dev-projects-cleanly',
    title: 'How to Structure AI-Assisted Projects Cleanly',
    metaDescription:
      'Structure AI-assisted development projects with clear boundaries, shared packages, and maintainable delivery rules.',
    content: `# Structure AI-assisted projects cleanly

AI speed creates a temptation to collapse responsibilities. Resist it early.

## Recommended baseline

- Domain-oriented routes and services
- Shared validation and types packages
- Dedicated infrastructure folders
- Predictable scripts for local setup

Clean structure lets both humans and agents make safe changes without guessing where logic belongs.`,
  },
  {
    slug: 'use-ai-agents-in-dev-workflow',
    title: 'How to Use AI Agents in a Practical Development Workflow',
    metaDescription:
      'Use AI agents in a practical developer workflow while preserving review, testing, and architectural judgment.',
    content: `# Use AI agents in a practical development workflow

Treat agents like fast contributors, not final arbiters.

## A durable workflow

1. Define scope tightly
2. Ask for concrete implementation, not vague advice
3. Review architectural fit before merging
4. Verify with tests and local runs

This keeps the velocity gains while protecting long-term maintainability.`,
  },
];

const lessons = [
  {
    slug: 'understanding-agent-responsibilities',
    title: 'Understanding Agent Responsibilities',
    order: 1,
    content: `# Understanding agent responsibilities

Agents are effective when they receive clear scope, current repository context, and explicit constraints.

Focus on:

- what belongs in the current change
- what must not change
- what verification is required`,
  },
  {
    slug: 'writing-effective-briefs',
    title: 'Writing Effective Briefs',
    order: 2,
    content: `# Writing effective briefs

Effective briefs define the goal, the architecture, and the delivery bar.

A strong brief includes:

- feature scope
- tech stack
- environment assumptions
- acceptance checks`,
  },
  {
    slug: 'reviewing-agent-output',
    title: 'Reviewing Agent Output Critically',
    order: 3,
    content: `# Reviewing agent output critically

Review the result as if it came from a human teammate. Check architecture, validation, tests, and failure modes before merge.`,
  },
];

const discussions = [
  {
    slug: 'how-do-you-brief-agents-for-monorepos',
    title: 'How do you brief agents for monorepos without losing structure?',
    content:
      'I want prompts that let agents move quickly without having them scatter logic across unrelated folders. What context do you always include first?',
  },
  {
    slug: 'best-way-to-review-generated-prs',
    title: 'What is your best review checklist for generated pull requests?',
    content:
      'I already check tests and lint, but I want a tighter review pass for architecture drift, over-abstraction, and accidental regressions.',
  },
];

const main = async () => {
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  });

  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {
      displayName: 'DevAgentsHub Admin',
      bio: 'Maintains the MVP foundation, content, and moderation workflow.',
    },
    create: {
      userId: admin.id,
      displayName: 'DevAgentsHub Admin',
      bio: 'Maintains the MVP foundation, content, and moderation workflow.',
    },
  });

  for (const tool of toolCatalog) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: tool,
      create: tool,
    });
  }

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        ...article,
        excerpt: excerpt(article.content.replace(/[#*`>-]/g, '').replace(/\n/g, ' '), 160),
        isPublished: true,
      },
      create: {
        ...article,
        excerpt: excerpt(article.content.replace(/[#*`>-]/g, '').replace(/\n/g, ' '), 160),
        isPublished: true,
      },
    });
  }

  const course = await prisma.course.upsert({
    where: { slug: featuredCourse.slug },
    update: {
      title: featuredCourse.title,
      description: featuredCourse.description,
      isPublished: true,
    },
    create: {
      slug: featuredCourse.slug,
      title: featuredCourse.title,
      description: featuredCourse.description,
      isPublished: true,
    },
  });

  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      update: {
        title: lesson.title,
        excerpt: excerpt(lesson.content.replace(/[#*`>-]/g, '').replace(/\n/g, ' '), 120),
        content: lesson.content,
        order: lesson.order,
        courseId: course.id,
      },
      create: {
        courseId: course.id,
        slug: lesson.slug,
        title: lesson.title,
        excerpt: excerpt(lesson.content.replace(/[#*`>-]/g, '').replace(/\n/g, ' '), 120),
        content: lesson.content,
        order: lesson.order,
      },
    });
  }

  for (const entry of discussions) {
    const discussion = await prisma.discussion.upsert({
      where: { slug: entry.slug },
      update: {
        title: entry.title,
        content: entry.content,
        userId: admin.id,
      },
      create: {
        slug: entry.slug,
        title: entry.title,
        content: entry.content,
        userId: admin.id,
      },
    });

    const repliesCount = await prisma.discussionReply.count({
      where: { discussionId: discussion.id },
    });

    if (repliesCount === 0) {
      await prisma.discussionReply.create({
        data: {
          discussionId: discussion.id,
          userId: admin.id,
          content: `A practical starting point is to document the architecture, current constraints, and verification bar before asking for implementation details on ${slugify(entry.title)}.`,
        },
      });
    }
  }

  console.log('Seed completed');
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import type { Prisma } from '@prisma/client';

import type { DiscussionDetail, DiscussionPreview } from '@devagentshub/types';

import { prisma } from '../lib/prisma';
import { serializeAuthUser } from './user.repository';

const authorInclude = {
  profile: true,
} satisfies Prisma.UserInclude;

export class DiscussionRepository {
  async listAll(): Promise<DiscussionPreview[]> {
    const discussions = await prisma.discussion.findMany({
      include: {
        user: {
          include: authorInclude,
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return discussions.map((discussion) => ({
      id: discussion.id,
      slug: discussion.slug,
      title: discussion.title,
      content: discussion.content,
      createdAt: discussion.createdAt.toISOString(),
      author: serializeAuthUser(discussion.user),
      repliesCount: discussion._count.replies,
    }));
  }

  async findBySlug(slug: string): Promise<DiscussionDetail | null> {
    const discussion = await prisma.discussion.findUnique({
      where: { slug },
      include: {
        user: {
          include: authorInclude,
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              include: authorInclude,
            },
          },
        },
      },
    });

    if (!discussion) {
      return null;
    }

    return {
      id: discussion.id,
      slug: discussion.slug,
      title: discussion.title,
      content: discussion.content,
      createdAt: discussion.createdAt.toISOString(),
      author: serializeAuthUser(discussion.user),
      repliesCount: discussion.replies.length,
      replies: discussion.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        author: serializeAuthUser(reply.user),
      })),
    };
  }

  async findRecordById(id: string) {
    return prisma.discussion.findUnique({
      where: { id },
    });
  }

  async createDiscussion(input: {
    userId: string;
    slug: string;
    title: string;
    content: string;
  }): Promise<DiscussionDetail> {
    const discussion = await prisma.discussion.create({
      data: input,
      include: {
        user: {
          include: authorInclude,
        },
        replies: true,
      },
    });

    return {
      id: discussion.id,
      slug: discussion.slug,
      title: discussion.title,
      content: discussion.content,
      createdAt: discussion.createdAt.toISOString(),
      author: serializeAuthUser(discussion.user),
      repliesCount: 0,
      replies: [],
    };
  }

  async createReply(input: {
    discussionId: string;
    userId: string;
    content: string;
  }) {
    const reply = await prisma.discussionReply.create({
      data: input,
      include: {
        user: {
          include: authorInclude,
        },
      },
    });

    return {
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      author: serializeAuthUser(reply.user),
    };
  }
}

export const discussionRepository = new DiscussionRepository();


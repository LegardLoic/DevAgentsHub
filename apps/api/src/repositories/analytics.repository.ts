import type { Prisma } from '@prisma/client';

import type {
  AnalyticsActivityItem,
  AnalyticsOverview,
  AnalyticsRankedItem,
  AnalyticsTotalMetric,
} from '@devagentshub/types';

import { prisma } from '../lib/prisma';

export const productEventTypes = {
  articleViewed: 'article_viewed',
  courseViewed: 'course_viewed',
  templateDuplicated: 'template_duplicated',
} as const;

export type ProductEventType = (typeof productEventTypes)[keyof typeof productEventTypes];

export interface CreateProductEventInput {
  eventType: ProductEventType;
  userId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

const topLimit = 5;
const recentLimit = 5;

type ProductEventGroup = {
  entityId: string | null;
  _count: {
    _all: number;
  };
};

const sortRankings = (items: AnalyticsRankedItem[]): AnalyticsRankedItem[] =>
  [...items].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)).slice(0, topLimit);

const metric = (
  key: string,
  label: string,
  value: number,
  helper: string,
): AnalyticsTotalMetric => ({
  key,
  label,
  value,
  helper,
});

export class AnalyticsRepository {
  async createEvent(input: CreateProductEventInput): Promise<void> {
    await prisma.productEvent.create({
      data: {
        eventType: input.eventType,
        userId: input.userId ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        metadata: input.metadata,
      },
    });
  }

  async getOverview(): Promise<AnalyticsOverview> {
    const [
      totalRuns,
      tools,
      recentRuns,
      totalTemplates,
      recentTemplates,
      duplicatedTemplates,
      totalBookmarks,
      articleBookmarks,
      courseBookmarks,
      articleViews,
      courseViews,
      articleViewGroups,
      courseViewGroups,
      totalDiscussions,
      totalReplies,
      recentDiscussions,
    ] = await Promise.all([
      prisma.toolRun.count(),
      prisma.tool.findMany({
        select: {
          slug: true,
          name: true,
          category: true,
          _count: {
            select: {
              runs: true,
            },
          },
        },
      }),
      prisma.toolRun.findMany({
        take: recentLimit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          createdAt: true,
          tool: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      }),
      prisma.template.count(),
      prisma.template.findMany({
        take: recentLimit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          toolSlug: true,
          createdAt: true,
        },
      }),
      prisma.productEvent.count({
        where: {
          eventType: productEventTypes.templateDuplicated,
        },
      }),
      prisma.bookmark.count(),
      prisma.bookmark.count({
        where: {
          articleId: {
            not: null,
          },
        },
      }),
      prisma.bookmark.count({
        where: {
          courseId: {
            not: null,
          },
        },
      }),
      prisma.productEvent.count({
        where: {
          eventType: productEventTypes.articleViewed,
        },
      }),
      prisma.productEvent.count({
        where: {
          eventType: productEventTypes.courseViewed,
        },
      }),
      prisma.productEvent.groupBy({
        by: ['entityId'],
        where: {
          eventType: productEventTypes.articleViewed,
          entityType: 'article',
          entityId: {
            not: null,
          },
        },
        _count: {
          _all: true,
        },
      }),
      prisma.productEvent.groupBy({
        by: ['entityId'],
        where: {
          eventType: productEventTypes.courseViewed,
          entityType: 'course',
          entityId: {
            not: null,
          },
        },
        _count: {
          _all: true,
        },
      }),
      prisma.discussion.count(),
      prisma.discussionReply.count(),
      prisma.discussion.findMany({
        take: recentLimit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          slug: true,
          title: true,
          createdAt: true,
          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),
    ]);

    const [topArticles, topCourses] = await Promise.all([
      this.buildArticleRankings(articleViewGroups as ProductEventGroup[]),
      this.buildCourseRankings(courseViewGroups as ProductEventGroup[]),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      totals: [
        metric('toolRuns', 'Tool runs', totalRuns, 'Generated prompt, structure, and debug runs.'),
        metric('templates', 'Templates', totalTemplates, 'Reusable saved tool inputs.'),
        metric('bookmarks', 'Bookmarks', totalBookmarks, 'Intentional saved guides and courses.'),
        metric('articleViews', 'Guide views', articleViews, 'Tracked guide detail opens.'),
        metric('courseViews', 'Course views', courseViews, 'Tracked course detail opens.'),
        metric(
          'community',
          'Community posts',
          totalDiscussions + totalReplies,
          'Threads plus replies.',
        ),
      ],
      tools: {
        totalRuns,
        runsByTool: sortRankings(
          tools.map((tool) => ({
            key: tool.slug,
            label: tool.name,
            value: tool._count.runs,
            description: tool.category,
            href: `/tools/${tool.slug}`,
          })),
        ),
        recentRuns: recentRuns.map(
          (run): AnalyticsActivityItem => ({
            id: run.id,
            label: run.tool.name,
            description: `Tool run through ${run.tool.slug}`,
            createdAt: run.createdAt.toISOString(),
            href: `/tools/${run.tool.slug}`,
          }),
        ),
      },
      templates: {
        totalTemplates,
        duplicatedTemplates,
        recentTemplates: recentTemplates.map(
          (template): AnalyticsActivityItem => ({
            id: template.id,
            label: template.name,
            description: `Template for ${template.toolSlug}`,
            createdAt: template.createdAt.toISOString(),
            href: `/dashboard/templates/${template.id}`,
          }),
        ),
      },
      bookmarks: {
        totalBookmarks,
        split: [
          {
            key: 'article',
            label: 'Article bookmarks',
            value: articleBookmarks,
            href: '/dashboard/bookmarks',
          },
          {
            key: 'course',
            label: 'Course bookmarks',
            value: courseBookmarks,
            href: '/dashboard/bookmarks',
          },
        ],
      },
      content: {
        articleViews,
        courseViews,
        topArticles,
        topCourses,
      },
      community: {
        totalDiscussions,
        totalReplies,
        recentDiscussions: recentDiscussions.map(
          (discussion): AnalyticsActivityItem => ({
            id: discussion.id,
            label: discussion.title,
            description: `${discussion._count.replies} ${discussion._count.replies === 1 ? 'reply' : 'replies'}`,
            createdAt: discussion.createdAt.toISOString(),
            href: `/community/${discussion.slug}`,
          }),
        ),
      },
    };
  }

  private async buildArticleRankings(groups: ProductEventGroup[]): Promise<AnalyticsRankedItem[]> {
    const ids = groups.map((group) => group.entityId).filter((id): id is string => Boolean(id));

    if (!ids.length) {
      return [];
    }

    const articles = await prisma.article.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
      },
    });

    const articleById = new Map(articles.map((article) => [article.id, article]));

    return sortRankings(
      groups.flatMap((group) => {
        if (!group.entityId) {
          return [];
        }

        const article = articleById.get(group.entityId);

        if (!article) {
          return [];
        }

        return {
          key: article.id,
          label: article.title,
          value: group._count._all,
          description: article.excerpt,
          href: `/guides/${article.slug}`,
        };
      }),
    );
  }

  private async buildCourseRankings(groups: ProductEventGroup[]): Promise<AnalyticsRankedItem[]> {
    const ids = groups.map((group) => group.entityId).filter((id): id is string => Boolean(id));

    if (!ids.length) {
      return [];
    }

    const courses = await prisma.course.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
      },
    });

    const courseById = new Map(courses.map((course) => [course.id, course]));

    return sortRankings(
      groups.flatMap((group) => {
        if (!group.entityId) {
          return [];
        }

        const course = courseById.get(group.entityId);

        if (!course) {
          return [];
        }

        return {
          key: course.id,
          label: course.title,
          value: group._count._all,
          description: course.description,
          href: `/formations/${course.slug}`,
        };
      }),
    );
  }
}

export const analyticsRepository = new AnalyticsRepository();

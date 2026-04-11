import type { Prisma } from '@prisma/client';

import type {
  SearchFilter,
  SearchResultGroup,
  SearchResultItem,
  SearchResultType,
} from '@devagentshub/types';
import { excerpt } from '@devagentshub/utils';

import { prisma } from '../lib/prisma';

const resultLimit = 5;

const groupLabels: Record<SearchResultType, string> = {
  tool: 'Tools',
  guide: 'Guides',
  course: 'Formations',
  discussion: 'Community',
};

const filterToTypes: Record<SearchFilter, SearchResultType[]> = {
  all: ['tool', 'guide', 'course', 'discussion'],
  tools: ['tool'],
  guides: ['guide'],
  courses: ['course'],
  discussions: ['discussion'],
};

const contains = (query: string) =>
  ({
    contains: query,
    mode: 'insensitive',
  }) satisfies Prisma.StringFilter;

const makeGroup = (type: SearchResultType, items: SearchResultItem[]): SearchResultGroup => ({
  type,
  label: groupLabels[type],
  count: items.length,
  items,
});

export class SearchRepository {
  async search(query: string, filter: SearchFilter): Promise<SearchResultGroup[]> {
    const requestedTypes = filterToTypes[filter];
    const groups = await Promise.all(
      requestedTypes.map(async (type) => {
        switch (type) {
          case 'tool':
            return makeGroup(type, await this.searchTools(query));
          case 'guide':
            return makeGroup(type, await this.searchGuides(query));
          case 'course':
            return makeGroup(type, await this.searchCourses(query));
          case 'discussion':
            return makeGroup(type, await this.searchDiscussions(query));
        }
      }),
    );

    return groups;
  }

  emptyGroups(filter: SearchFilter): SearchResultGroup[] {
    return filterToTypes[filter].map((type) => makeGroup(type, []));
  }

  private async searchTools(query: string): Promise<SearchResultItem[]> {
    const tools = await prisma.tool.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: contains(query) },
          { slug: contains(query) },
          { description: contains(query) },
        ],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: resultLimit,
    });

    return tools.map((tool) => ({
      id: tool.id,
      type: 'tool',
      title: tool.name,
      href: `/tools/${tool.slug}`,
      description: tool.description,
      meta: tool.category,
    }));
  }

  private async searchGuides(query: string): Promise<SearchResultItem[]> {
    const articles = await prisma.article.findMany({
      where: {
        isPublished: true,
        OR: [{ title: contains(query) }, { slug: contains(query) }, { excerpt: contains(query) }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: resultLimit,
    });

    return articles.map((article) => ({
      id: article.id,
      type: 'guide',
      title: article.title,
      href: `/guides/${article.slug}`,
      description: article.excerpt,
      meta: 'Guide',
    }));
  }

  private async searchCourses(query: string): Promise<SearchResultItem[]> {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: contains(query) },
          { slug: contains(query) },
          { description: contains(query) },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        _count: {
          select: {
            lessons: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: resultLimit,
    });

    return courses.map((course) => ({
      id: course.id,
      type: 'course',
      title: course.title,
      href: `/formations/${course.slug}`,
      description: course.description,
      meta: `${course._count.lessons} ${course._count.lessons === 1 ? 'lesson' : 'lessons'}`,
    }));
  }

  private async searchDiscussions(query: string): Promise<SearchResultItem[]> {
    const discussions = await prisma.discussion.findMany({
      where: {
        OR: [{ title: contains(query) }, { content: contains(query) }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        createdAt: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: resultLimit,
    });

    return discussions.map((discussion) => ({
      id: discussion.id,
      type: 'discussion',
      title: discussion.title,
      href: `/community/${discussion.slug}`,
      description: excerpt(discussion.content, 180),
      meta: `${discussion._count.replies} ${discussion._count.replies === 1 ? 'reply' : 'replies'}`,
    }));
  }
}

export const searchRepository = new SearchRepository();

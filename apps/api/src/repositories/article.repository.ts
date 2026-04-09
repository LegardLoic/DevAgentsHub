import type { Prisma } from '@prisma/client';

import type { ArticleDetail, ArticlePreview } from '@devagentshub/types';

import { prisma } from '../lib/prisma';

const articleSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ArticleSelect;

type ArticleRecord = Prisma.ArticleGetPayload<{
  select: typeof articleSelect;
}>;

const serializeArticle = (article: ArticleRecord): ArticleDetail => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt,
  content: article.content,
  createdAt: article.createdAt.toISOString(),
  updatedAt: article.updatedAt.toISOString(),
});

export class ArticleRepository {
  async listPublished(): Promise<ArticlePreview[]> {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      select: articleSelect,
      orderBy: { createdAt: 'desc' },
    });

    return articles.map(serializeArticle);
  }

  async findPublishedBySlug(slug: string): Promise<ArticleDetail | null> {
    const article = await prisma.article.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      select: articleSelect,
    });

    return article ? serializeArticle(article) : null;
  }
}

export const articleRepository = new ArticleRepository();


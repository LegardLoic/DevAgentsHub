import type { Prisma } from '@prisma/client';

import type {
  AdminArticleDetail,
  AdminArticleSummary,
  ArticleDetail,
  ArticleMetadata,
  ArticlePreview,
} from '@devagentshub/types';
import type { AdminArticleInput } from '@devagentshub/validation';

import { prisma } from '../lib/prisma';

const articleSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  metaDescription: true,
  content: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ArticleSelect;

type ArticleRecord = Prisma.ArticleGetPayload<{
  select: typeof articleSelect;
}>;

const adminArticleSelect = {
  ...articleSelect,
  isPublished: true,
} satisfies Prisma.ArticleSelect;

type AdminArticleRecord = Prisma.ArticleGetPayload<{
  select: typeof adminArticleSelect;
}>;

const articleMetadataSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  metaDescription: true,
} satisfies Prisma.ArticleSelect;

type ArticleMetadataRecord = Prisma.ArticleGetPayload<{
  select: typeof articleMetadataSelect;
}>;

const normalizeArticleInput = (input: AdminArticleInput): Prisma.ArticleCreateInput => ({
  title: input.title,
  slug: input.slug,
  excerpt: input.excerpt,
  metaDescription: input.metaDescription?.trim() ? input.metaDescription.trim() : null,
  content: input.content,
  isPublished: input.isPublished,
});

const serializeArticle = (article: ArticleRecord): ArticleDetail => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt,
  metaDescription: article.metaDescription,
  content: article.content,
  createdAt: article.createdAt.toISOString(),
  updatedAt: article.updatedAt.toISOString(),
});

const serializeArticleMetadata = (article: ArticleMetadataRecord): ArticleMetadata => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt,
  metaDescription: article.metaDescription,
});

const serializeAdminArticleSummary = (article: AdminArticleRecord): AdminArticleSummary => ({
  id: article.id,
  slug: article.slug,
  title: article.title,
  excerpt: article.excerpt,
  metaDescription: article.metaDescription,
  isPublished: article.isPublished,
  createdAt: article.createdAt.toISOString(),
  updatedAt: article.updatedAt.toISOString(),
});

const serializeAdminArticleDetail = (article: AdminArticleRecord): AdminArticleDetail => ({
  ...serializeAdminArticleSummary(article),
  content: article.content,
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

  async findPublishedMetadataBySlug(slug: string): Promise<ArticleMetadata | null> {
    const article = await prisma.article.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      select: articleMetadataSelect,
    });

    return article ? serializeArticleMetadata(article) : null;
  }

  async findPublishedById(id: string): Promise<ArticlePreview | null> {
    const article = await prisma.article.findFirst({
      where: {
        id,
        isPublished: true,
      },
      select: articleSelect,
    });

    return article ? serializeArticle(article) : null;
  }

  async listAll(): Promise<AdminArticleSummary[]> {
    const articles = await prisma.article.findMany({
      select: adminArticleSelect,
      orderBy: { updatedAt: 'desc' },
    });

    return articles.map(serializeAdminArticleSummary);
  }

  async findById(id: string): Promise<AdminArticleDetail | null> {
    const article = await prisma.article.findUnique({
      where: { id },
      select: adminArticleSelect,
    });

    return article ? serializeAdminArticleDetail(article) : null;
  }

  async findBySlug(slug: string): Promise<AdminArticleSummary | null> {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: adminArticleSelect,
    });

    return article ? serializeAdminArticleSummary(article) : null;
  }

  async createArticle(input: AdminArticleInput): Promise<AdminArticleDetail> {
    const article = await prisma.article.create({
      data: normalizeArticleInput(input),
      select: adminArticleSelect,
    });

    return serializeAdminArticleDetail(article);
  }

  async updateArticle(id: string, input: AdminArticleInput): Promise<AdminArticleDetail> {
    const article = await prisma.article.update({
      where: { id },
      data: normalizeArticleInput(input),
      select: adminArticleSelect,
    });

    return serializeAdminArticleDetail(article);
  }
}

export const articleRepository = new ArticleRepository();

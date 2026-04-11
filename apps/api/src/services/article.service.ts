import { AppError } from '../utils/app-error';
import { articleRepository, type ArticleRepository } from '../repositories/article.repository';
import { analyticsService, type AnalyticsService } from './analytics.service';

export class ArticleService {
  constructor(
    private readonly articles: ArticleRepository = articleRepository,
    private readonly analytics: AnalyticsService = analyticsService,
  ) {}

  async listArticles() {
    return this.articles.listPublished();
  }

  async getArticle(slug: string, userId?: string | null) {
    const article = await this.articles.findPublishedBySlug(slug);

    if (!article) {
      throw new AppError('The requested article could not be found.', 404, 'ARTICLE_NOT_FOUND');
    }

    await this.analytics.trackArticleView(article, userId);

    return article;
  }
}

export const articleService = new ArticleService();

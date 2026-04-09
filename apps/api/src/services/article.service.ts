import { AppError } from '../utils/app-error';
import { articleRepository, type ArticleRepository } from '../repositories/article.repository';

export class ArticleService {
  constructor(private readonly articles: ArticleRepository = articleRepository) {}

  async listArticles() {
    return this.articles.listPublished();
  }

  async getArticle(slug: string) {
    const article = await this.articles.findPublishedBySlug(slug);

    if (!article) {
      throw new AppError('The requested article could not be found.', 404, 'ARTICLE_NOT_FOUND');
    }

    return article;
  }
}

export const articleService = new ArticleService();


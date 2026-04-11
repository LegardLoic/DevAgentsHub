import { asyncHandler } from '../utils/async-handler';
import { articleService, type ArticleService } from '../services/article.service';

export class ArticleController {
  constructor(private readonly articles: ArticleService = articleService) {}

  list = asyncHandler(async (_req, res) => {
    const items = await this.articles.listArticles();

    res.status(200).json({
      data: items,
    });
  });

  getBySlug = asyncHandler(async (req, res) => {
    const article = await this.articles.getArticle(req.params.slug as string, req.authUser?.id);

    res.status(200).json({
      data: article,
    });
  });
}

export const articleController = new ArticleController();

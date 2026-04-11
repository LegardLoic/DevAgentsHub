import { searchQuerySchema } from '@devagentshub/validation';

import { searchService, type SearchService } from '../services/search.service';
import { asyncHandler } from '../utils/async-handler';

export class SearchController {
  constructor(private readonly search: SearchService = searchService) {}

  searchProducts = asyncHandler(async (req, res) => {
    const input = searchQuerySchema.parse({
      q: typeof req.query.q === 'string' ? req.query.q : '',
      type: typeof req.query.type === 'string' ? req.query.type : undefined,
    });

    const results = await this.search.searchProducts(input);

    res.status(200).json({
      data: results,
    });
  });
}

export const searchController = new SearchController();

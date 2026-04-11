import type { SearchResponse } from '@devagentshub/types';
import type { SearchQueryInput } from '@devagentshub/validation';

import { searchRepository, type SearchRepository } from '../repositories/search.repository';

const minimumQueryLength = 2;

export class SearchService {
  constructor(private readonly search: SearchRepository = searchRepository) {}

  async searchProducts(input: SearchQueryInput): Promise<SearchResponse> {
    const query = input.q.trim();
    const type = input.type;

    if (query.length < minimumQueryLength) {
      const groups = this.search.emptyGroups(type);

      return {
        query,
        type,
        minimumQueryLength,
        totalCount: 0,
        groups,
      };
    }

    const groups = await this.search.search(query, type);

    return {
      query,
      type,
      minimumQueryLength,
      totalCount: groups.reduce((total, group) => total + group.count, 0),
      groups,
    };
  }
}

export const searchService = new SearchService();

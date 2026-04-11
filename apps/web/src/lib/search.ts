import type { SearchFilter, SearchResponse } from '@devagentshub/types';

import { apiFetch } from './api';

export const searchFilters: Array<{ label: string; value: SearchFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Tools', value: 'tools' },
  { label: 'Guides', value: 'guides' },
  { label: 'Formations', value: 'courses' },
  { label: 'Community', value: 'discussions' },
];

export const isSearchFilter = (value: string | null): value is SearchFilter =>
  searchFilters.some((filter) => filter.value === value);

export const fetchSearchResults = (query: string, type: SearchFilter) => {
  const params = new URLSearchParams({
    q: query,
  });

  if (type !== 'all') {
    params.set('type', type);
  }

  return apiFetch<SearchResponse>(`/api/search?${params.toString()}`);
};

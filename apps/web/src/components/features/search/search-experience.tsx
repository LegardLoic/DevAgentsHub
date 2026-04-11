'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Compass, Search } from 'lucide-react';

import type { SearchFilter, SearchResultGroup } from '@devagentshub/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
} from '@devagentshub/ui';

import { getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { fetchSearchResults, isSearchFilter, searchFilters } from '../../../lib/search';
import { StatusPanel } from '../../layout/status-panel';

const minimumQueryLength = 2;

const SearchGroup = ({ group }: { group: SearchResultGroup }) => (
  <Card>
    <CardHeader>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge>{group.label}</Badge>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
          {group.count} {group.count === 1 ? 'result' : 'results'}
        </span>
      </div>
    </CardHeader>
    <CardContent>
      {group.items.length ? (
        <div className="space-y-3">
          {group.items.map((item) => (
            <Link
              className="block rounded-2xl border border-[var(--color-border)] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              href={item.href}
              key={`${item.type}-${item.id}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--color-ink)]">{item.title}</p>
                    {item.meta ? <Badge>{item.meta}</Badge> : null}
                  </div>
                  <p className="text-sm leading-6 text-[var(--color-subtle)]">{item.description}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-[var(--color-accent)]" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-subtle)]">
          No matching {group.label.toLowerCase()} for this query.
        </p>
      )}
    </CardContent>
  </Card>
);

export const SearchExperience = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const urlType = searchParams.get('type');
  const selectedType: SearchFilter = isSearchFilter(urlType) ? urlType : 'all';
  const selectedFilterLabel =
    searchFilters.find((filter) => filter.value === selectedType)?.label ?? 'All';
  const [inputValue, setInputValue] = useState(urlQuery);
  const trimmedQuery = urlQuery.trim();
  const canSearch = trimmedQuery.length >= minimumQueryLength;

  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  const searchQuery = useQuery({
    queryKey: queryKeys.search(trimmedQuery, selectedType),
    queryFn: () => fetchSearchResults(trimmedQuery, selectedType),
    enabled: canSearch,
  });

  const updateSearchUrl = (query: string, type: SearchFilter) => {
    const params = new URLSearchParams();
    const nextQuery = query.trim();

    if (nextQuery) {
      params.set('q', nextQuery);
    }

    if (type !== 'all') {
      params.set('type', type);
    }

    router.push(params.size ? `/search?${params.toString()}` : '/search');
  };

  const submitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearchUrl(inputValue, selectedType);
  };

  return (
    <div className="space-y-8">
      <Card className="bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(255,255,255,0.95))]">
        <CardHeader>
          <Badge>Search</Badge>
          <CardTitle>Search across DevAgentsHub</CardTitle>
          <CardDescription>
            Find tools, guides, formations, and public community discussions from one lightweight
            search page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submitHandler}>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-subtle)]" />
              <Input
                className="pl-11"
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Search for prompts, debugging, architecture, courses..."
                value={inputValue}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex flex-wrap gap-3">
            {searchFilters.map((filter) => (
              <Button
                key={filter.value}
                onClick={() => updateSearchUrl(inputValue, filter.value)}
                size="sm"
                variant={selectedType === filter.value ? 'default' : 'secondary'}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {!trimmedQuery ? (
        <EmptyState
          description="Start with a tool name, guide topic, course phrase, or community question."
          icon={<Compass className="h-6 w-6 text-[var(--color-accent)]" />}
          title="Search the product"
        />
      ) : !canSearch ? (
        <EmptyState
          description={`Type at least ${minimumQueryLength} characters to search across product surfaces.`}
          icon={<Search className="h-6 w-6 text-[var(--color-accent)]" />}
          title="Query too short"
        />
      ) : searchQuery.isLoading ? (
        <StatusPanel
          description={`Searching DevAgentsHub for "${trimmedQuery}".`}
          title="Searching"
          tone="loading"
        />
      ) : searchQuery.isError ? (
        <StatusPanel
          description={getApiClientErrorMessage(
            searchQuery.error,
            'Search results could not be loaded from the API.',
          )}
          title="Search unavailable"
          tone="error"
        />
      ) : searchQuery.data?.totalCount ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
              {searchQuery.data.totalCount}{' '}
              {searchQuery.data.totalCount === 1 ? 'result' : 'results'} for "
              {searchQuery.data.query}"
            </p>
            <Badge>{selectedFilterLabel}</Badge>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            {searchQuery.data.groups.map((group) => (
              <SearchGroup group={group} key={group.type} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          description="Try a broader term, search another content type, or start from Tools, Guides, Formations, or Community."
          icon={<Search className="h-6 w-6 text-[var(--color-accent)]" />}
          title={`No results for "${trimmedQuery}"`}
        />
      )}
    </div>
  );
};

'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, History, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { toolCatalog } from '@devagentshub/config';
import type { SavedToolRunSummary, ToolSlug } from '@devagentshub/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Section,
} from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { ApiClientError, apiFetch, getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { useCurrentUser } from '../../../hooks/use-auth';
import { DashboardAuthRequired } from './dashboard-auth-required';
import { StatusPanel } from '../../layout/status-panel';
import { getToolPath } from '../../../lib/tool-runs';

export const SavedRunsList = () => {
  const userQuery = useCurrentUser();
  const [toolFilter, setToolFilter] = useState<'all' | ToolSlug>('all');

  const runsQuery = useQuery({
    queryKey: queryKeys.savedRuns(userQuery.data?.id ?? 'anonymous'),
    queryFn: () => apiFetch<SavedToolRunSummary[]>('/api/me/tool-runs'),
    enabled: Boolean(userQuery.data),
  });

  if (userQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Checking your authenticated session." title="Loading saved runs" tone="loading" />
      </Section>
    );
  }

  if (userQuery.isError) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(userQuery.error, 'The saved runs area could not be loaded.')}
          title="Dashboard unavailable"
          tone="error"
        />
      </Section>
    );
  }

  if (!userQuery.data) {
    return (
      <Section className="space-y-6">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <DashboardAuthRequired
          description="Login to review your saved tool history and reopen previous results."
          nextPath="/dashboard/saved-runs"
        />
      </Section>
    );
  }

  if (runsQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching your saved tool runs." title="Loading saved runs" tone="loading" />
      </Section>
    );
  }

  if (runsQuery.isError) {
    const isUnauthorized = runsQuery.error instanceof ApiClientError && runsQuery.error.statusCode === 401;

    return (
      <Section>
        {isUnauthorized ? (
          <DashboardAuthRequired
            description="Your session expired. Login again to access your saved runs."
            nextPath="/dashboard/saved-runs"
          />
        ) : (
          <StatusPanel
            description={getApiClientErrorMessage(runsQuery.error, 'Your saved runs could not be loaded.')}
            title="Saved runs unavailable"
            tone="error"
          />
        )}
      </Section>
    );
  }

  const runs = runsQuery.data ?? [];
  const filteredRuns =
    toolFilter === 'all' ? runs : runs.filter((run) => run.toolSlug === toolFilter);

  if (!runs.length) {
    return (
      <Section className="space-y-6">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <EmptyState
          description="Run one of the tools while logged in and the result will appear here automatically."
          icon={<History className="h-6 w-6 text-[var(--color-accent)]" />}
          title="No saved runs yet"
        />
        <Button asChild>
          <Link href="/tools">Open tools</Link>
        </Button>
      </Section>
    );
  }

  return (
    <Section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/dashboard">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="space-y-3">
        <Badge>Saved runs</Badge>
        <h1 className="headline text-5xl font-bold">Your recent tool history</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          Reopen previous outputs, copy what matters, or jump back into the original tool with the same input.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Quick filter</Badge>
          </div>
          <CardTitle>Filter by tool</CardTitle>
          <CardDescription>
            Keep the history compact if you only want to review one tool family.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => setToolFilter('all')} size="sm" variant={toolFilter === 'all' ? 'default' : 'secondary'}>
            All runs
          </Button>
          {toolCatalog.map((tool) => (
            <Button
              key={tool.slug}
              onClick={() => setToolFilter(tool.slug)}
              size="sm"
              variant={toolFilter === tool.slug ? 'default' : 'secondary'}
            >
              {tool.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      {filteredRuns.length ? (
        <div className="grid gap-6">
          {filteredRuns.map((run) => (
            <Card key={run.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>{run.tool.category}</Badge>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    Saved {formatDate(run.createdAt)}
                  </span>
                </div>
                <CardTitle>{run.tool.name}</CardTitle>
                <CardDescription>{run.preview}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-[var(--color-subtle)]">{run.tool.slug}</div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={getToolPath(run.toolSlug)}>Open tool</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/saved-runs/${run.id}`}>
                      View saved run
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          description="No saved runs match the current filter. Switch back to all runs or choose another tool."
          title="Nothing in this filter"
        />
      )}
    </Section>
  );
};

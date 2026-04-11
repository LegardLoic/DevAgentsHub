'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, History, RefreshCw } from 'lucide-react';

import type { SavedToolRunDetail as SavedToolRunDetailType } from '@devagentshub/types';
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
import { getToolContextualLinks } from '../../../lib/contextual-links';
import { queryKeys } from '../../../lib/query-keys';
import { useCurrentUser } from '../../../hooks/use-auth';
import { buildSavedRunReuseHref, getSavedRunPrimaryCopyText, getToolPath } from '../../../lib/tool-runs';
import { getSuggestedTemplateName } from '../../../lib/templates';
import { ContextualLinkCards } from '../../layout/contextual-link-cards';
import { StatusPanel } from '../../layout/status-panel';
import { DashboardAuthRequired } from './dashboard-auth-required';
import { CopyActionButton } from './copy-action-button';
import { ProjectTreePreview } from '../tools/project-tree-preview';
import { JsonBlock, ToolInputSummary } from './tool-input-summary';
import { SaveTemplateCard } from './save-template-card';

const DetailList = ({ items, title }: { items: string[]; title: string }) => (
  <div className="rounded-3xl bg-[var(--color-surface)] p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">{title}</p>
    <ul className="mt-3 space-y-3 text-sm leading-7 text-[var(--color-ink)]">
      {items.map((item) => (
        <li key={item}>- {item}</li>
      ))}
    </ul>
  </div>
);

const OutputSummary = ({ run }: { run: SavedToolRunDetailType }) => {
  switch (run.toolSlug) {
    case 'prompt-generator':
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            {run.output.sections.map((section) => (
              <div key={section.label} className="rounded-2xl bg-[var(--color-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                  {section.label}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{section.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl bg-[#10253f] p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Generated prompt</p>
            <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-7">{run.output.prompt}</pre>
          </div>
        </div>
      );

    case 'project-structure-generator':
      return (
        <div className="space-y-5">
          <p className="text-sm leading-7 text-[var(--color-subtle)]">{run.output.description}</p>
          <ProjectTreePreview tree={run.output.tree} />
          <DetailList items={run.output.notes} title="Implementation notes" />
        </div>
      );

    case 'debug-helper':
      return (
        <div className="space-y-5">
          <div className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
            {run.output.summary}
          </div>
          <DetailList items={run.output.possibleCauses} title="Possible causes" />
          <DetailList items={run.output.resolutionSteps} title="Resolution steps" />
          <DetailList items={run.output.debugChecklist} title="Debug checklist" />
        </div>
      );
  }
};

export const SavedRunDetail = ({ id }: { id: string }) => {
  const userQuery = useCurrentUser();

  const runQuery = useQuery({
    queryKey: queryKeys.savedRun(userQuery.data?.id ?? 'anonymous', id),
    queryFn: () => apiFetch<SavedToolRunDetailType>(`/api/me/tool-runs/${id}`),
    enabled: Boolean(userQuery.data),
  });

  if (userQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Checking your authenticated session." title="Loading saved run" tone="loading" />
      </Section>
    );
  }

  if (userQuery.isError) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(userQuery.error, 'The saved run could not be loaded.')}
          title="Dashboard unavailable"
          tone="error"
        />
      </Section>
    );
  }

  if (!userQuery.data) {
    return (
      <Section className="space-y-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
          href="/dashboard/saved-runs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to saved runs
        </Link>
        <DashboardAuthRequired
          description="Login to inspect your saved run details and reuse previous tool inputs."
          nextPath={`/dashboard/saved-runs/${id}`}
        />
      </Section>
    );
  }

  if (runQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching the saved run from the API." title="Loading saved run" tone="loading" />
      </Section>
    );
  }

  if (runQuery.isError || !runQuery.data) {
    const isMissingRun = runQuery.error instanceof ApiClientError && runQuery.error.statusCode === 404;
    const isUnauthorized = runQuery.error instanceof ApiClientError && runQuery.error.statusCode === 401;

    return (
      <Section className="space-y-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
          href="/dashboard/saved-runs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to saved runs
        </Link>
        {isUnauthorized ? (
          <DashboardAuthRequired
            description="Your session expired. Login again to access this saved run."
            nextPath={`/dashboard/saved-runs/${id}`}
          />
        ) : isMissingRun ? (
          <EmptyState
            description="The saved run does not exist or does not belong to your account."
            icon={<History className="h-6 w-6 text-[var(--color-accent)]" />}
            title="Saved run not found"
          />
        ) : (
          <StatusPanel
            description={getApiClientErrorMessage(runQuery.error, 'The saved run could not be loaded.')}
            title="Saved run unavailable"
            tone="error"
          />
        )}
      </Section>
    );
  }

  const run = runQuery.data;
  const reuseHref = buildSavedRunReuseHref(run);

  return (
    <Section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/dashboard/saved-runs">
        <ArrowLeft className="h-4 w-4" />
        Back to saved runs
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-6">
          <Card>
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Original input</CardTitle>
            <CardDescription>These are the parameters that produced the saved run.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToolInputSummary source={run} />
              <JsonBlock value={run.input} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved output</CardTitle>
              <CardDescription>Review the exact result generated by the tool.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <OutputSummary run={run} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <Badge>Actions</Badge>
              <CardTitle>Reuse or copy this result</CardTitle>
              <CardDescription>Jump back into the tool or copy the output in the format that is most useful.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href={reuseHref}>
                  Reuse saved input
                  <RefreshCw className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="w-full" variant="secondary">
                <Link href={getToolPath(run.toolSlug)}>
                  Open original tool
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <CopyActionButton content={getSavedRunPrimaryCopyText(run)} defaultLabel="Copy primary result" />
              <CopyActionButton content={JSON.stringify(run.output, null, 2)} defaultLabel="Copy output JSON" />
              <CopyActionButton content={JSON.stringify(run.input, null, 2)} defaultLabel="Copy input JSON" />
            </CardContent>
          </Card>
          <SaveTemplateCard
            input={run.input}
            suggestedName={getSuggestedTemplateName(run.toolSlug, run.input)}
            toolSlug={run.toolSlug}
            userId={userQuery.data.id}
          />

          <ContextualLinkCards
            description="Use this saved result as part of a wider workflow instead of leaving it as isolated history."
            eyebrow="Related next moves"
            layout="stack"
            links={getToolContextualLinks(run.toolSlug)}
            title="Connect this run"
          />

          <Card>
            <CardHeader>
              <Badge>Tool reference</Badge>
              <CardTitle>{run.tool.slug}</CardTitle>
              <CardDescription>{run.tool.description}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </Section>
  );
};

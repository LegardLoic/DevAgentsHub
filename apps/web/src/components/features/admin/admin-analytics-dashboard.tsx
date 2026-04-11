'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Layers3,
  MessageSquare,
  MousePointerClick,
  Wrench,
} from 'lucide-react';

import type {
  AnalyticsActivityItem,
  AnalyticsOverview,
  AnalyticsRankedItem,
} from '@devagentshub/types';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Section,
} from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { fetchAdminAnalyticsOverview } from '../../../lib/admin-analytics';
import { getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { StatusPanel } from '../../layout/status-panel';
import { AdminGate } from './admin-gate';

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);

const MetricCard = ({ helper, label, value }: { helper: string; label: string; value: number }) => (
  <Card>
    <CardHeader>
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-4xl">{formatNumber(value)}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm leading-6 text-[var(--color-subtle)]">{helper}</p>
    </CardContent>
  </Card>
);

const RankingList = ({
  emptyDescription,
  items,
  title,
  valueLabel,
}: {
  emptyDescription: string;
  items: AnalyticsRankedItem[];
  title: string;
  valueLabel: string;
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
    {items.length ? (
      <div className="space-y-3">
        {items.map((item) => (
          <div
            className="rounded-2xl border border-[var(--color-border)] bg-white p-4"
            key={item.key}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-semibold text-[var(--color-ink)]">{item.label}</p>
                {item.description ? (
                  <p className="text-sm leading-6 text-[var(--color-subtle)]">{item.description}</p>
                ) : null}
              </div>
              <Badge>
                {formatNumber(item.value)} {valueLabel}
              </Badge>
            </div>
            {item.href ? (
              <Link
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
                href={item.href}
              >
                Open surface
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    ) : (
      <EmptyState description={emptyDescription} title="No data yet" />
    )}
  </div>
);

const ActivityList = ({
  emptyDescription,
  items,
  title,
}: {
  emptyDescription: string;
  items: AnalyticsActivityItem[];
  title: string;
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
    {items.length ? (
      <div className="space-y-3">
        {items.map((item) => (
          <div
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-4"
            key={item.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-semibold text-[var(--color-ink)]">{item.label}</p>
                <p className="text-sm leading-6 text-[var(--color-subtle)]">{item.description}</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                {formatDate(item.createdAt)}
              </span>
            </div>
            {item.href ? (
              <Link
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
                href={item.href}
              >
                Inspect
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    ) : (
      <EmptyState description={emptyDescription} title="No recent activity yet" />
    )}
  </div>
);

const AnalyticsContent = ({ overview }: { overview: AnalyticsOverview }) => (
  <Section className="space-y-8">
    <Link
      className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
      href="/admin"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to admin
    </Link>

    <div className="space-y-3">
      <Badge>Analytics</Badge>
      <h1 className="headline text-5xl font-bold">Light product analytics</h1>
      <p className="max-w-3xl text-lg leading-8 text-[var(--color-subtle)]">
        Internal usage signals from persisted product activity plus approximate guide and course
        view events. Last generated {formatDate(overview.generatedAt)}.
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {overview.totals.map((item) => (
        <MetricCard helper={item.helper} key={item.key} label={item.label} value={item.value} />
      ))}
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Wrench className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Tools</Badge>
          </div>
          <CardTitle>Tool usage</CardTitle>
          <CardDescription>
            Total and recent tool runs are computed from saved ToolRun records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RankingList
            emptyDescription="Run a tool to start building usage history."
            items={overview.tools.runsByTool}
            title="Runs by tool"
            valueLabel="runs"
          />
          <ActivityList
            emptyDescription="Recent tool runs will appear here."
            items={overview.tools.recentRuns}
            title="Recent runs"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <MousePointerClick className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Content</Badge>
          </div>
          <CardTitle>Guide and course views</CardTitle>
          <CardDescription>
            Popularity is based on lightweight detail-view events tracked by the API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RankingList
            emptyDescription="Guide detail views will appear once readers open guides."
            items={overview.content.topArticles}
            title="Top guides"
            valueLabel="views"
          />
          <RankingList
            emptyDescription="Course detail views will appear once readers open formations."
            items={overview.content.topCourses}
            title="Top courses"
            valueLabel="views"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Layers3 className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Templates</Badge>
          </div>
          <CardTitle>Reusable assets</CardTitle>
          <CardDescription>
            Template totals are computed from templates; duplication count is tracked as events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              helper="Current reusable templates."
              label="Templates"
              value={overview.templates.totalTemplates}
            />
            <MetricCard
              helper="Duplicate actions tracked since analytics was enabled."
              label="Duplicates"
              value={overview.templates.duplicatedTemplates}
            />
          </div>
          <ActivityList
            emptyDescription="New templates will appear here."
            items={overview.templates.recentTemplates}
            title="Recent templates"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bookmark className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Bookmarks</Badge>
          </div>
          <CardTitle>Saved content intent</CardTitle>
          <CardDescription>
            Bookmark totals and split are computed from current Bookmark records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RankingList
            emptyDescription="Bookmarks will appear after users save articles or courses."
            items={overview.bookmarks.split}
            title="Bookmark split"
            valueLabel="saved"
          />
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Community</Badge>
          </div>
          <CardTitle>Community activity</CardTitle>
          <CardDescription>
            Discussion and reply totals are computed directly from community tables.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <div className="grid gap-3">
            <MetricCard
              helper="Created discussion threads."
              label="Discussions"
              value={overview.community.totalDiscussions}
            />
            <MetricCard
              helper="Replies posted across threads."
              label="Replies"
              value={overview.community.totalReplies}
            />
          </div>
          <ActivityList
            emptyDescription="Recent threads will appear here."
            items={overview.community.recentDiscussions}
            title="Recent discussions"
          />
        </CardContent>
      </Card>
    </div>
  </Section>
);

export const AdminAnalyticsDashboard = () => (
  <AdminGate nextPath="/admin/analytics">{() => <AdminAnalyticsDashboardContent />}</AdminGate>
);

const AdminAnalyticsDashboardContent = () => {
  const analyticsQuery = useQuery({
    queryKey: queryKeys.adminAnalytics,
    queryFn: fetchAdminAnalyticsOverview,
  });

  if (analyticsQuery.isLoading) {
    return (
      <Section>
        <StatusPanel
          description="Aggregating internal product metrics."
          title="Loading analytics"
          tone="loading"
        />
      </Section>
    );
  }

  if (analyticsQuery.isError || !analyticsQuery.data) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(
            analyticsQuery.error,
            'The analytics overview could not be loaded.',
          )}
          title="Analytics unavailable"
          tone="error"
        />
      </Section>
    );
  }

  return <AnalyticsContent overview={analyticsQuery.data} />;
};

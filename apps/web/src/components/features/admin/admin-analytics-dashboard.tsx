'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bookmark,
  Layers3,
  MessageSquare,
  MousePointerClick,
  TrendingUp,
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

interface InsightItem {
  title: string;
  value: string;
  description: string;
  href?: string;
}

interface ProductAreaSignal {
  key: string;
  label: string;
  value: number;
  helper: string;
}

const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(value);

const formatRatio = (value: number, total: number): string => {
  if (!total) {
    return '0%';
  }

  return `${Math.round((value / total) * 100)}%`;
};

const topItem = (items: AnalyticsRankedItem[]): AnalyticsRankedItem | undefined =>
  items.length ? items[0] : undefined;

const contentLeadLabel = (overview: AnalyticsOverview): string => {
  if (overview.content.articleViews === overview.content.courseViews) {
    return 'Balanced content attention';
  }

  return overview.content.articleViews > overview.content.courseViews
    ? 'Guides lead'
    : 'Formations lead';
};

const bookmarkPreferenceLabel = (articleBookmarks: number, courseBookmarks: number): string => {
  if (articleBookmarks === courseBookmarks) {
    return 'Balanced';
  }

  return articleBookmarks > courseBookmarks ? 'Guides saved more' : 'Courses saved more';
};

const buildAreaSignals = (overview: AnalyticsOverview): ProductAreaSignal[] => [
  {
    key: 'tools',
    label: 'Tools usage',
    value: overview.tools.totalRuns,
    helper: 'Saved tool executions',
  },
  {
    key: 'workspace',
    label: 'Workspace retention',
    value: overview.templates.totalTemplates + overview.bookmarks.totalBookmarks,
    helper: 'Templates plus bookmarks',
  },
  {
    key: 'content',
    label: 'Content attention',
    value: overview.content.articleViews + overview.content.courseViews,
    helper: 'Guide plus course views',
  },
  {
    key: 'community',
    label: 'Community activity',
    value: overview.community.totalDiscussions + overview.community.totalReplies,
    helper: 'Threads plus replies',
  },
];

const buildInsights = (overview: AnalyticsOverview): InsightItem[] => {
  const areaSignals = buildAreaSignals(overview);
  const activeAreas = areaSignals.filter((area) => area.value > 0);
  const fallbackArea = {
    key: 'none',
    label: 'No product area',
    value: 0,
    helper: 'No usage signal yet',
  };
  const mostActiveArea = [...areaSignals].sort((a, b) => b.value - a.value)[0] ?? fallbackArea;
  const leastUsedArea = [...areaSignals].sort((a, b) => a.value - b.value)[0] ?? fallbackArea;
  const topTool = topItem(overview.tools.runsByTool);
  const topGuide = topItem(overview.content.topArticles);
  const topCourse = topItem(overview.content.topCourses);
  const articleBookmarks =
    overview.bookmarks.split.find((item) => item.key === 'article')?.value ?? 0;
  const courseBookmarks = overview.bookmarks.split.find((item) => item.key === 'course')?.value ?? 0;
  const workspaceAssets = overview.templates.totalTemplates + overview.bookmarks.totalBookmarks;
  const contentViews = overview.content.articleViews + overview.content.courseViews;
  const communityPosts = overview.community.totalDiscussions + overview.community.totalReplies;

  const insights: InsightItem[] = [
    {
      title: 'Most active product area',
      value: activeAreas.length ? mostActiveArea.label : 'No activity yet',
      description: activeAreas.length
        ? `${formatNumber(mostActiveArea.value)} signals currently make this the strongest surface.`
        : 'Run tools, open content, or start discussions to generate the first product signals.',
    },
    {
      title: 'Lowest signal area',
      value: leastUsedArea.label,
      description: `${formatNumber(leastUsedArea.value)} signals. This is the first place to inspect when prioritizing polish or onboarding.`,
    },
    {
      title: 'Top tool',
      value: topTool?.label ?? 'No tool runs yet',
      description: topTool
        ? `${formatNumber(topTool.value)} runs. This indicates where execution value is currently concentrated.`
        : 'Tool usage will appear after authenticated or anonymous tool runs are created.',
      href: topTool?.href,
    },
    {
      title: 'Workspace capture',
      value: formatRatio(overview.templates.totalTemplates, Math.max(overview.tools.totalRuns, 1)),
      description: `${formatNumber(overview.templates.totalTemplates)} templates from ${formatNumber(overview.tools.totalRuns)} tool runs. Use this as a rough saved-work signal, not a strict conversion funnel.`,
    },
    {
      title: 'Content pull',
      value: contentLeadLabel(overview),
      description: `${formatNumber(overview.content.articleViews)} guide views and ${formatNumber(overview.content.courseViews)} course views tracked from detail opens.`,
      href: overview.content.articleViews >= overview.content.courseViews ? topGuide?.href : topCourse?.href,
    },
    {
      title: 'Bookmark preference',
      value: bookmarkPreferenceLabel(articleBookmarks, courseBookmarks),
      description: `${formatNumber(articleBookmarks)} guide bookmarks and ${formatNumber(courseBookmarks)} course bookmarks show what users intentionally keep.`,
    },
    {
      title: 'Community shape',
      value:
        overview.community.totalReplies > overview.community.totalDiscussions
          ? 'Replies are leading'
          : 'Threads are leading',
      description: `${formatNumber(overview.community.totalDiscussions)} threads and ${formatNumber(overview.community.totalReplies)} replies. Healthy discussions should eventually produce more replies than new threads.`,
    },
    {
      title: 'Product loop coverage',
      value:
        [overview.tools.totalRuns, workspaceAssets, contentViews, communityPosts].filter(Boolean)
          .length >= 3
          ? 'Multi-surface activity'
          : 'Narrow activity',
      description:
        'Compares execution, workspace retention, content attention, and community activity to show whether usage is spread across the product loop.',
    },
  ];

  return insights;
};

const MetricCard = ({
  helper,
  label,
  value,
}: {
  helper: string;
  label: string;
  value: number;
}) => (
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

const CompactMetric = ({
  helper,
  label,
  value,
}: {
  helper: string;
  label: string;
  value: number;
}) => (
  <div className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
      {label}
    </p>
    <p className="mt-2 text-3xl font-bold text-[var(--color-ink)]">{formatNumber(value)}</p>
    <p className="mt-2 text-sm leading-6 text-[var(--color-subtle)]">{helper}</p>
  </div>
);

const AreaSignalCard = ({ signal }: { signal: ProductAreaSignal }) => (
  <div className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-[var(--color-ink)]">{signal.label}</p>
        <p className="text-sm leading-6 text-[var(--color-subtle)]">{signal.helper}</p>
      </div>
      <Badge>{formatNumber(signal.value)}</Badge>
    </div>
  </div>
);

const InsightCard = ({ insight }: { insight: InsightItem }) => (
  <Card className="h-full bg-[var(--color-surface)]/90 shadow-none">
    <CardHeader>
      <CardDescription>{insight.title}</CardDescription>
      <CardTitle>{insight.value}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm leading-6 text-[var(--color-subtle)]">{insight.description}</p>
      {insight.href ? (
        <Link
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
          href={insight.href}
        >
          Inspect surface
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
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
        {items.map((item, index) => (
          <div
            className="rounded-2xl border border-[var(--color-border)] bg-white p-4"
            key={item.key}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge>#{index + 1}</Badge>
                  <p className="font-semibold text-[var(--color-ink)]">{item.label}</p>
                </div>
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

const AnalyticsContent = ({ overview }: { overview: AnalyticsOverview }) => {
  const insights = buildInsights(overview);
  const areaSignals = buildAreaSignals(overview);
  const headlineInsights = insights.slice(0, 4);
  const secondaryInsights = insights.slice(4);

  return (
    <Section className="space-y-8">
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
        href="/admin"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <Badge>Analytics</Badge>
          <h1 className="headline text-5xl font-bold">Product signals that explain what matters</h1>
          <p className="max-w-3xl text-lg leading-8 text-[var(--color-subtle)]">
            Internal usage signals from persisted product activity plus approximate guide and course
            view events. Last generated {formatDate(overview.generatedAt)}.
          </p>
        </div>
        <Card className="bg-[linear-gradient(135deg,rgba(15,118,110,0.14),rgba(255,255,255,0.96))]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-[var(--color-accent)]" />
              <Badge>Decision snapshot</Badge>
            </div>
            <CardTitle>{headlineInsights[0]?.value ?? 'No activity yet'}</CardTitle>
            <CardDescription>
              {headlineInsights[0]?.description ??
                'Product activity will appear once users start interacting with the platform.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {areaSignals.map((signal) => (
                <AreaSignalCard key={signal.key} signal={signal} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {headlineInsights.map((insight) => (
          <InsightCard insight={insight} key={insight.title} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overview.totals.map((item) => (
          <MetricCard helper={item.helper} key={item.key} label={item.label} value={item.value} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Product loop health</Badge>
          </div>
          <CardTitle>How the core loops are behaving</CardTitle>
          <CardDescription>
            These summaries are derived from existing aggregate data. They are directional signals,
            not a full funnel or attribution model.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {secondaryInsights.map((insight) => (
              <InsightCard insight={insight} key={insight.title} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-[var(--color-accent)]" />
              <Badge>Tools usage</Badge>
            </div>
            <CardTitle>Execution demand</CardTitle>
            <CardDescription>
              Total and recent tool runs are computed from saved ToolRun records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RankingList
              emptyDescription="Run a tool to start building usage history."
              items={overview.tools.runsByTool}
              title="Top tools by runs"
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
              <Badge>Content usage</Badge>
            </div>
            <CardTitle>Attention across guides and formations</CardTitle>
            <CardDescription>
              Popularity is based on lightweight detail-view events tracked by the API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RankingList
              emptyDescription="Guide detail views will appear once readers open guides."
              items={overview.content.topArticles}
              title="Top guides by views"
              valueLabel="views"
            />
            <RankingList
              emptyDescription="Course detail views will appear once readers open formations."
              items={overview.content.topCourses}
              title="Top formations by views"
              valueLabel="views"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Layers3 className="h-5 w-5 text-[var(--color-accent)]" />
              <Badge>Workspace usage</Badge>
            </div>
            <CardTitle>Reusable assets</CardTitle>
            <CardDescription>
              Template totals are computed from templates; duplication count is tracked as events.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <CompactMetric
                helper="Current reusable templates."
                label="Templates"
                value={overview.templates.totalTemplates}
              />
              <CompactMetric
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
              <Badge>Saved content</Badge>
            </div>
            <CardTitle>Bookmark intent</CardTitle>
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
              <Badge>Community activity</Badge>
            </div>
            <CardTitle>Discussion health</CardTitle>
            <CardDescription>
              Discussion and reply totals are computed directly from community tables.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 xl:grid-cols-[280px_1fr]">
            <div className="grid gap-3">
              <CompactMetric
                helper="Created discussion threads."
                label="Discussions"
                value={overview.community.totalDiscussions}
              />
              <CompactMetric
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
};

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

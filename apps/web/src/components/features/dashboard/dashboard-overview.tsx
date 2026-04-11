'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookOpenText,
  CheckCircle2,
  Compass,
  History,
  Layers3,
  LayoutDashboard,
  MessagesSquare,
  Search,
  Sparkles,
  Wrench,
} from 'lucide-react';

import type { BookmarkSummary, SavedTemplateSummary, SavedToolRunSummary } from '@devagentshub/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Section,
} from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { useCurrentUser } from '../../../hooks/use-auth';
import { apiFetch, getApiClientErrorMessage } from '../../../lib/api';
import { listBookmarks } from '../../../lib/bookmarks';
import { dashboardContextualLinks } from '../../../lib/contextual-links';
import { queryKeys } from '../../../lib/query-keys';
import { listTemplates } from '../../../lib/templates';
import { getToolPath } from '../../../lib/tool-runs';
import { ContextualLinkCards } from '../../layout/contextual-link-cards';
import { StatusPanel } from '../../layout/status-panel';
import { DashboardAuthRequired } from './dashboard-auth-required';

const RECENT_LIMIT = 3;

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  description: string;
  href: string;
}

interface QuickAction {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  label: string;
}

interface RecentActivityItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  href: string;
  actionLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

interface RecentActivityGroupProps {
  actionHref: string;
  actionLabel: string;
  emptyActionHref: string;
  emptyActionLabel: string;
  emptyDescription: string;
  emptyTitle: string;
  error: unknown;
  icon: ReactNode;
  isError: boolean;
  isLoading: boolean;
  items: RecentActivityItem[];
  title: string;
}

interface OnboardingStep {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
}

const quickActions: QuickAction[] = [
  {
    href: '/tools',
    icon: <Wrench className="h-4 w-4 text-[var(--color-accent)]" />,
    title: 'Run a tool',
    description: 'Generate a prompt, project structure, or debug plan.',
    label: 'Open tools',
  },
  {
    href: '/dashboard/templates',
    icon: <Layers3 className="h-4 w-4 text-[var(--color-accent)]" />,
    title: 'Reuse a template',
    description: 'Launch a saved input when a workflow repeats.',
    label: 'Open templates',
  },
  {
    href: '/search',
    icon: <Search className="h-4 w-4 text-[var(--color-accent)]" />,
    title: 'Search the product',
    description: 'Find tools, guides, courses, and discussions quickly.',
    label: 'Search',
  },
  {
    href: '/guides',
    icon: <BookOpenText className="h-4 w-4 text-[var(--color-accent)]" />,
    title: 'Start a guide',
    description: 'Frame the next decision before executing it.',
    label: 'Browse guides',
  },
];

const onboardingSteps: OnboardingStep[] = [
  {
    href: '/tools/prompt-generator',
    eyebrow: 'Step 1',
    title: 'Run your first tool',
    description: 'Start with a prompt generator run so the dashboard has a concrete result to save.',
    actionLabel: 'Open prompt generator',
  },
  {
    href: '/dashboard/saved-runs',
    eyebrow: 'Step 2',
    title: 'Review the result',
    description: 'Saved runs become your history. Reopen one, copy the output, or turn it into a template.',
    actionLabel: 'View saved runs',
  },
  {
    href: '/guides',
    eyebrow: 'Step 3',
    title: 'Frame the next decision',
    description: 'Use guides and courses to understand what to try next, then loop back into the tools.',
    actionLabel: 'Browse guides',
  },
];

const formatMetricValue = (value: number | undefined, isLoading: boolean, isError: boolean) => {
  if (isLoading) {
    return '...';
  }

  if (isError) {
    return '-';
  }

  return value ?? 0;
};

const buildRunItems = (runs: SavedToolRunSummary[]): RecentActivityItem[] =>
  runs.slice(0, RECENT_LIMIT).map((run) => ({
    id: run.id,
    eyebrow: run.tool.category,
    title: run.tool.name,
    description: run.preview,
    meta: `Saved ${formatDate(run.createdAt)}`,
    href: `/dashboard/saved-runs/${run.id}`,
    actionLabel: 'Open run',
    secondaryHref: getToolPath(run.toolSlug),
    secondaryLabel: 'Run tool',
  }));

const buildTemplateItems = (templates: SavedTemplateSummary[]): RecentActivityItem[] =>
  templates.slice(0, RECENT_LIMIT).map((template) => ({
    id: template.id,
    eyebrow: template.tool.category,
    title: template.name,
    description: template.preview,
    meta: `Updated ${formatDate(template.updatedAt)}`,
    href: `/dashboard/templates/${template.id}`,
    actionLabel: 'Edit / run',
    secondaryHref: getToolPath(template.toolSlug),
    secondaryLabel: 'Blank tool',
  }));

const buildBookmarkItems = (bookmarks: BookmarkSummary[]): RecentActivityItem[] =>
  bookmarks.slice(0, RECENT_LIMIT).map((bookmark) => ({
    id: bookmark.id,
    eyebrow: bookmark.targetType === 'article' ? 'Guide' : 'Course',
    title: bookmark.title,
    description: bookmark.description,
    meta: `Bookmarked ${formatDate(bookmark.createdAt)}`,
    href: bookmark.href,
    actionLabel: 'Open content',
  }));

const MetricCard = ({ icon, label, value, description, href }: MetricCardProps) => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon}
          <Badge>{label}</Badge>
        </div>
        <span className="headline text-3xl font-bold text-[var(--color-ink)]">{value}</span>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href={href}>
        Review
        <ArrowRight className="h-4 w-4" />
      </Link>
    </CardContent>
  </Card>
);

const GettingStartedBlock = () => (
  <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(15,118,110,0.14),rgba(255,255,255,0.94))]">
    <CardHeader className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>Start here</Badge>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
          New workspace
        </span>
      </div>
      <div className="space-y-2">
        <CardTitle className="headline text-3xl md:text-4xl">Try DevAgentsHub in 3 steps</CardTitle>
        <CardDescription className="max-w-3xl text-base leading-7">
          Your workspace is empty. Run one tool first, then use the saved result to understand how runs,
          templates, bookmarks, and guides connect.
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="grid gap-3 md:grid-cols-3">
      {onboardingSteps.map((step) => (
        <Link
          className="group rounded-3xl border border-[var(--color-border)] bg-white/75 p-4 transition hover:-translate-y-0.5 hover:bg-white"
          href={step.href}
          key={step.href}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)]" />
            <Badge>{step.eyebrow}</Badge>
          </div>
          <p className="mt-4 font-semibold text-[var(--color-ink)]">{step.title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-subtle)]">{step.description}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]">
            {step.actionLabel}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </CardContent>
  </Card>
);

const QuickActions = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-3">
        <Compass className="h-5 w-5 text-[var(--color-accent)]" />
        <Badge>Quick actions</Badge>
      </div>
      <CardTitle>Choose the next useful move</CardTitle>
      <CardDescription>
        Keep the dashboard focused on continuing work, not just storing assets.
      </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-3 sm:grid-cols-2">
      {quickActions.map((action) => (
        <Link
          className="group rounded-3xl border border-[var(--color-border)] bg-white/70 p-4 transition hover:-translate-y-0.5 hover:bg-[var(--color-muted)]"
          href={action.href}
          key={action.href}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {action.icon}
                <p className="font-semibold text-[var(--color-ink)]">{action.title}</p>
              </div>
              <p className="text-sm leading-6 text-[var(--color-subtle)]">{action.description}</p>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 text-[var(--color-accent)] transition group-hover:translate-x-0.5" />
          </div>
          <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
            {action.label}
          </span>
        </Link>
      ))}
    </CardContent>
  </Card>
);

const RecentActivityGroup = ({
  actionHref,
  actionLabel,
  emptyActionHref,
  emptyActionLabel,
  emptyDescription,
  emptyTitle,
  error,
  icon,
  isError,
  isLoading,
  items,
  title,
}: RecentActivityGroupProps) => (
  <Card>
    <CardHeader>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      {isLoading ? (
        <div className="rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-subtle)]">
          Loading recent activity...
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
          {getApiClientErrorMessage(error, `${title} could not be loaded.`)}
        </div>
      ) : items.length ? (
        items.map((item) => (
          <div
            className="rounded-2xl border border-[var(--color-border)] bg-white/70 p-4"
            key={item.id}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{item.eyebrow}</Badge>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                {item.meta}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              <p className="font-semibold text-[var(--color-ink)]">{item.title}</p>
              <p className="line-clamp-2 text-sm leading-6 text-[var(--color-subtle)]">{item.description}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href={item.href}>
                  {item.actionLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {item.secondaryHref && item.secondaryLabel ? (
                <Button asChild size="sm" variant="secondary">
                  <Link href={item.secondaryHref}>{item.secondaryLabel}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/70 p-4">
          <p className="font-semibold text-[var(--color-ink)]">{emptyTitle}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-subtle)]">{emptyDescription}</p>
          <Button asChild className="mt-4" size="sm" variant="secondary">
            <Link href={emptyActionHref}>
              {emptyActionLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

const NextStepGuidance = () => (
  <Card className="bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(255,255,255,0.96))]">
    <CardHeader>
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
        <Badge>Continue your workflow</Badge>
      </div>
      <CardTitle>Turn stored work into the next action</CardTitle>
      <CardDescription>
        The dashboard is most useful when history becomes reusable input and saved content becomes execution context.
      </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl bg-white/70 p-4">
        <p className="font-semibold text-[var(--color-ink)]">After a run</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-subtle)]">
          Reopen the output, copy the useful part, or save the input as a template.
        </p>
      </div>
      <div className="rounded-2xl bg-white/70 p-4">
        <p className="font-semibold text-[var(--color-ink)]">After a template</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-subtle)]">
          Edit the stored fields, duplicate it for a variation, then run the matching tool.
        </p>
      </div>
      <div className="rounded-2xl bg-white/70 p-4">
        <p className="font-semibold text-[var(--color-ink)]">After a bookmark</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-subtle)]">
          Revisit the guide or course, then apply it with tools or bring the question to community.
        </p>
      </div>
    </CardContent>
  </Card>
);

export const DashboardOverview = () => {
  const userQuery = useCurrentUser();
  const userId = userQuery.data?.id ?? 'anonymous';

  const runsQuery = useQuery({
    queryKey: queryKeys.savedRuns(userId),
    queryFn: () => apiFetch<SavedToolRunSummary[]>('/api/me/tool-runs'),
    enabled: Boolean(userQuery.data),
  });

  const templatesQuery = useQuery({
    queryKey: queryKeys.templates(userId),
    queryFn: listTemplates,
    enabled: Boolean(userQuery.data),
  });

  const bookmarksQuery = useQuery({
    queryKey: queryKeys.bookmarks(userId),
    queryFn: listBookmarks,
    enabled: Boolean(userQuery.data),
  });

  if (userQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Checking your authenticated session." title="Loading dashboard" tone="loading" />
      </Section>
    );
  }

  if (userQuery.isError) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(userQuery.error, 'The dashboard could not be loaded.')}
          title="Dashboard unavailable"
          tone="error"
        />
      </Section>
    );
  }

  if (!userQuery.data) {
    return (
      <Section>
        <DashboardAuthRequired description="Login to access your dashboard, review saved runs, manage reusable templates, and jump back into the tools quickly." />
      </Section>
    );
  }

  const displayName = userQuery.data.profile?.displayName ?? userQuery.data.email;
  const runs = runsQuery.data ?? [];
  const templates = templatesQuery.data ?? [];
  const bookmarks = bookmarksQuery.data ?? [];
  const workspaceStateReady =
    !runsQuery.isLoading &&
    !runsQuery.isError &&
    !templatesQuery.isLoading &&
    !templatesQuery.isError &&
    !bookmarksQuery.isLoading &&
    !bookmarksQuery.isError;
  const isNewWorkspace =
    workspaceStateReady && runs.length === 0 && templates.length === 0 && bookmarks.length === 0;

  return (
    <Section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div className="space-y-3">
          <Badge>Dashboard</Badge>
          <h1 className="headline text-5xl font-bold">Welcome back, {displayName}</h1>
          <p className="max-w-3xl text-lg leading-8 text-[var(--color-subtle)]">
            Pick up recent tool work, reuse what already worked, and keep saved guides or courses close to your next
            execution step.
          </p>
        </div>
        <Card className="bg-[var(--color-surface)]/80 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5 text-[var(--color-accent)]" />
              <Badge>Workspace summary</Badge>
            </div>
            <CardDescription>
              A compact view of your personal assets. Counts update from your saved workspace endpoints.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {isNewWorkspace ? <GettingStartedBlock /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          description="Tool executions you can reopen, copy, or convert into reusable inputs."
          href="/dashboard/saved-runs"
          icon={<History className="h-5 w-5 text-[var(--color-accent)]" />}
          label="Runs"
          value={formatMetricValue(runsQuery.data?.length, runsQuery.isLoading, runsQuery.isError)}
        />
        <MetricCard
          description="Reusable tool inputs ready for repeatable work and quick relaunches."
          href="/dashboard/templates"
          icon={<Layers3 className="h-5 w-5 text-[var(--color-accent)]" />}
          label="Templates"
          value={formatMetricValue(templatesQuery.data?.length, templatesQuery.isLoading, templatesQuery.isError)}
        />
        <MetricCard
          description="Guides and courses you intentionally saved for later decisions."
          href="/dashboard/bookmarks"
          icon={<Bookmark className="h-5 w-5 text-[var(--color-accent)]" />}
          label="Bookmarks"
          value={formatMetricValue(bookmarksQuery.data?.length, bookmarksQuery.isLoading, bookmarksQuery.isError)}
        />
      </div>

      <QuickActions />

      <div className="space-y-4">
        <div className="space-y-2">
          <Badge>Continue working</Badge>
          <h2 className="headline text-3xl font-bold text-[var(--color-ink)]">Recent workspace activity</h2>
          <p className="max-w-3xl text-base leading-7 text-[var(--color-subtle)]">
            The latest runs, templates, and bookmarks are kept short here so the next action stays obvious.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <RecentActivityGroup
            actionHref="/dashboard/saved-runs"
            actionLabel="All runs"
            emptyActionHref="/tools"
            emptyActionLabel="Run a tool"
            emptyDescription="Run a prompt, structure, or debug helper while logged in and the result will appear here."
            emptyTitle="No recent runs"
            error={runsQuery.error}
            icon={<History className="h-5 w-5 text-[var(--color-accent)]" />}
            isError={runsQuery.isError}
            isLoading={runsQuery.isLoading}
            items={buildRunItems(runs)}
            title="Recent runs"
          />

          <RecentActivityGroup
            actionHref="/dashboard/templates"
            actionLabel="All templates"
            emptyActionHref="/dashboard/saved-runs"
            emptyActionLabel="Use a saved run"
            emptyDescription="Save a useful run as a template when you know the input will be useful again."
            emptyTitle="No templates yet"
            error={templatesQuery.error}
            icon={<Layers3 className="h-5 w-5 text-[var(--color-accent)]" />}
            isError={templatesQuery.isError}
            isLoading={templatesQuery.isLoading}
            items={buildTemplateItems(templates)}
            title="Recent templates"
          />

          <RecentActivityGroup
            actionHref="/dashboard/bookmarks"
            actionLabel="All bookmarks"
            emptyActionHref="/guides"
            emptyActionLabel="Browse guides"
            emptyDescription="Bookmark guides or courses when you want one place to revisit useful content."
            emptyTitle="No bookmarks yet"
            error={bookmarksQuery.error}
            icon={<Bookmark className="h-5 w-5 text-[var(--color-accent)]" />}
            isError={bookmarksQuery.isError}
            isLoading={bookmarksQuery.isLoading}
            items={buildBookmarkItems(bookmarks)}
            title="Recent bookmarks"
          />
        </div>
      </div>

      <NextStepGuidance />

      <ContextualLinkCards
        description="Use the dashboard as a launchpad: revisit saved work, then move back into reading, execution, learning, or discussion."
        eyebrow="Connected workspace"
        links={dashboardContextualLinks}
        title="Pick the next product loop"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <MessagesSquare className="h-5 w-5 text-[var(--color-accent)]" />
            <Badge>Need feedback?</Badge>
          </div>
          <CardTitle>Bring a saved workflow question to the community</CardTitle>
          <CardDescription>
            When a run or template needs pressure-testing, open the community board and explain the tradeoff with the
            saved context in hand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary">
            <Link href="/community">
              Open community
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </Section>
  );
};

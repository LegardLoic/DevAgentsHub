'use client';

import Link from 'next/link';
import { ArrowRight, Bookmark, History, Layers3, LayoutDashboard, MessagesSquare, Sparkles } from 'lucide-react';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Section } from '@devagentshub/ui';

import { useCurrentUser } from '../../../hooks/use-auth';
import { dashboardContextualLinks } from '../../../lib/contextual-links';
import { DashboardAuthRequired } from './dashboard-auth-required';
import { ContextualLinkCards } from '../../layout/contextual-link-cards';
import { StatusPanel } from '../../layout/status-panel';
import { getApiClientErrorMessage } from '../../../lib/api';

export const DashboardOverview = () => {
  const userQuery = useCurrentUser();

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

  return (
    <Section className="space-y-8">
      <div className="space-y-3">
        <Badge>Dashboard</Badge>
        <h1 className="headline text-5xl font-bold">Welcome back, {displayName}</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          This dashboard stays intentionally lightweight: review saved tool runs, reuse templates, revisit bookmarks,
          and keep your next action close.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6">
          <Card className="bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(255,255,255,0.96))]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-[var(--color-accent)]" />
                <Badge>Saved runs</Badge>
              </div>
              <CardTitle>Review your tool history</CardTitle>
              <CardDescription>
                Every authenticated tool execution is persisted. Reopen a result, copy it, or relaunch the tool with the
                same input.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/dashboard/saved-runs">
                  Open saved runs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/tools">Run a new tool</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Layers3 className="h-5 w-5 text-[var(--color-accent)]" />
                <Badge>Templates</Badge>
              </div>
              <CardTitle>Keep reusable inputs ready</CardTitle>
              <CardDescription>
                Save your best runs as reusable templates and relaunch the matching tool with one click.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/dashboard/templates">
                  Open templates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/dashboard/saved-runs">Use saved runs as source</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bookmark className="h-5 w-5 text-[var(--color-accent)]" />
                <Badge>Bookmarks</Badge>
              </div>
              <CardTitle>Keep useful content close</CardTitle>
              <CardDescription>
                Save guides and courses intentionally, then revisit them from one dashboard page.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/dashboard/bookmarks">
                  Open bookmarks
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/guides">Browse guides</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5 text-[var(--color-accent)]" />
                <Badge>Next move</Badge>
              </div>
              <CardTitle>Go back into execution</CardTitle>
              <CardDescription>
                Open the tools directory to generate a new prompt, structure, or debug plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link className="text-sm font-semibold text-[var(--color-accent)]" href="/tools">
                Browse tools
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
                <Badge>Keep momentum</Badge>
              </div>
              <CardTitle>Connect work with learning and discussion</CardTitle>
              <CardDescription>
                Reinforce the same practices in the learning path or pressure-test them in the community board.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild size="sm" variant="secondary">
                <Link href="/formations">Open formations</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/community">
                  Open community
                  <MessagesSquare className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ContextualLinkCards
        description="Use the dashboard as a launchpad: revisit saved work, then move back into reading, execution, or learning."
        eyebrow="Connected workspace"
        links={dashboardContextualLinks}
        title="Pick the next product loop"
      />
    </Section>
  );
};

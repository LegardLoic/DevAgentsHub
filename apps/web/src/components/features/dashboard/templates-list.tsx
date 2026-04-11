'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Layers3, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { toolCatalog } from '@devagentshub/config';
import type { ToolSlug } from '@devagentshub/types';
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

import { ApiClientError, getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { listTemplates } from '../../../lib/templates';
import { getToolPath } from '../../../lib/tool-runs';
import { useCurrentUser } from '../../../hooks/use-auth';
import { StatusPanel } from '../../layout/status-panel';
import { DashboardAuthRequired } from './dashboard-auth-required';

export const TemplatesList = () => {
  const userQuery = useCurrentUser();
  const [toolFilter, setToolFilter] = useState<'all' | ToolSlug>('all');

  const templatesQuery = useQuery({
    queryKey: queryKeys.templates(userQuery.data?.id ?? 'anonymous'),
    queryFn: listTemplates,
    enabled: Boolean(userQuery.data),
  });

  if (userQuery.isLoading) {
    return (
      <Section>
        <StatusPanel
          description="Checking your authenticated session."
          title="Loading templates"
          tone="loading"
        />
      </Section>
    );
  }

  if (userQuery.isError) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(
            userQuery.error,
            'The templates area could not be loaded.',
          )}
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
          href="/dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <DashboardAuthRequired
          description="Login to keep reusable templates for your favorite tool inputs."
          nextPath="/dashboard/templates"
        />
      </Section>
    );
  }

  if (templatesQuery.isLoading) {
    return (
      <Section>
        <StatusPanel
          description="Fetching your saved templates."
          title="Loading templates"
          tone="loading"
        />
      </Section>
    );
  }

  if (templatesQuery.isError) {
    const isUnauthorized =
      templatesQuery.error instanceof ApiClientError && templatesQuery.error.statusCode === 401;

    return (
      <Section>
        {isUnauthorized ? (
          <DashboardAuthRequired
            description="Your session expired. Login again to access your saved templates."
            nextPath="/dashboard/templates"
          />
        ) : (
          <StatusPanel
            description={getApiClientErrorMessage(
              templatesQuery.error,
              'Your saved templates could not be loaded.',
            )}
            title="Templates unavailable"
            tone="error"
          />
        )}
      </Section>
    );
  }

  const templates = templatesQuery.data ?? [];
  const filteredTemplates =
    toolFilter === 'all'
      ? templates
      : templates.filter((template) => template.toolSlug === toolFilter);

  if (!templates.length) {
    return (
      <Section className="space-y-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
          href="/dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <EmptyState
          description="Save one of your authenticated tool runs as a template and it will appear here."
          icon={<Layers3 className="h-6 w-6 text-[var(--color-accent)]" />}
          title="No templates yet"
        />
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/saved-runs">Review saved runs</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/tools">Open tools</Link>
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section className="space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
        href="/dashboard"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="space-y-3">
        <Badge>Templates</Badge>
        <h1 className="headline text-5xl font-bold">Your reusable tool templates</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
          Keep the tool inputs you want to reuse intentionally, without digging through your full
          run history.
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
            Narrow the list if you only want to revisit one kind of reusable input.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={() => setToolFilter('all')}
            size="sm"
            variant={toolFilter === 'all' ? 'default' : 'secondary'}
          >
            All templates
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

      {filteredTemplates.length ? (
        <div className="grid gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>{template.tool.category}</Badge>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    Updated {formatDate(template.updatedAt)}
                  </span>
                </div>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.preview}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-[var(--color-subtle)]">{template.tool.name}</div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={getToolPath(template.toolSlug)}>Blank tool</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/templates/${template.id}`}>
                      Edit / run template
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
          description="No templates match the current filter. Switch back to all templates or choose another tool."
          title="Nothing in this filter"
        />
      )}
    </Section>
  );
};

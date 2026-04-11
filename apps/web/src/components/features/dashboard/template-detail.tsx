'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Layers3, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  Label,
  Section,
} from '@devagentshub/ui';
import { templateNameSchema } from '@devagentshub/validation';
import { formatDate } from '@devagentshub/utils';

import { ApiClientError, getApiClientErrorMessage } from '../../../lib/api';
import { getToolContextualLinks } from '../../../lib/contextual-links';
import { queryKeys } from '../../../lib/query-keys';
import { getTemplate, getTemplatePrimaryCopyText, getTemplateReuseHref, updateTemplate } from '../../../lib/templates';
import { getToolPath } from '../../../lib/tool-runs';
import { useCurrentUser } from '../../../hooks/use-auth';
import { ContextualLinkCards } from '../../layout/contextual-link-cards';
import { StatusPanel } from '../../layout/status-panel';
import { CopyActionButton } from './copy-action-button';
import { DashboardAuthRequired } from './dashboard-auth-required';
import { JsonBlock, ToolInputSummary } from './tool-input-summary';

const renameTemplateSchema = z.object({
  name: templateNameSchema,
});

type RenameTemplateValues = z.infer<typeof renameTemplateSchema>;

export const TemplateDetail = ({ id }: { id: string }) => {
  const userQuery = useCurrentUser();
  const queryClient = useQueryClient();
  const form = useForm<RenameTemplateValues>({
    resolver: zodResolver(renameTemplateSchema),
    defaultValues: {
      name: '',
    },
  });

  const templateQuery = useQuery({
    queryKey: queryKeys.template(userQuery.data?.id ?? 'anonymous', id),
    queryFn: () => getTemplate(id),
    enabled: Boolean(userQuery.data),
  });

  useEffect(() => {
    if (templateQuery.data) {
      form.reset({
        name: templateQuery.data.name,
      });
    }
  }, [form, templateQuery.data]);

  const renameMutation = useMutation({
    mutationFn: (values: RenameTemplateValues) => updateTemplate(id, { name: values.name }),
    onSuccess: async (template) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.templates(userQuery.data?.id ?? 'anonymous') }),
        queryClient.invalidateQueries({ queryKey: queryKeys.template(userQuery.data?.id ?? 'anonymous', id) }),
      ]);
      form.reset({
        name: template.name,
      });
    },
  });

  if (userQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Checking your authenticated session." title="Loading template" tone="loading" />
      </Section>
    );
  }

  if (userQuery.isError) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(userQuery.error, 'The template could not be loaded.')}
          title="Dashboard unavailable"
          tone="error"
        />
      </Section>
    );
  }

  if (!userQuery.data) {
    return (
      <Section className="space-y-6">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/dashboard/templates">
          <ArrowLeft className="h-4 w-4" />
          Back to templates
        </Link>
        <DashboardAuthRequired
          description="Login to inspect and reuse your saved templates."
          nextPath={`/dashboard/templates/${id}`}
        />
      </Section>
    );
  }

  if (templateQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching the template from the API." title="Loading template" tone="loading" />
      </Section>
    );
  }

  if (templateQuery.isError || !templateQuery.data) {
    const isMissingTemplate = templateQuery.error instanceof ApiClientError && templateQuery.error.statusCode === 404;
    const isUnauthorized = templateQuery.error instanceof ApiClientError && templateQuery.error.statusCode === 401;

    return (
      <Section className="space-y-6">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/dashboard/templates">
          <ArrowLeft className="h-4 w-4" />
          Back to templates
        </Link>
        {isUnauthorized ? (
          <DashboardAuthRequired
            description="Your session expired. Login again to access this template."
            nextPath={`/dashboard/templates/${id}`}
          />
        ) : isMissingTemplate ? (
          <EmptyState
            description="The template does not exist or does not belong to your account."
            icon={<Layers3 className="h-6 w-6 text-[var(--color-accent)]" />}
            title="Template not found"
          />
        ) : (
          <StatusPanel
            description={getApiClientErrorMessage(templateQuery.error, 'The template could not be loaded.')}
            title="Template unavailable"
            tone="error"
          />
        )}
      </Section>
    );
  }

  const template = templateQuery.data;
  const reuseHref = getTemplateReuseHref(template);

  return (
    <Section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/dashboard/templates">
        <ArrowLeft className="h-4 w-4" />
        Back to templates
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-6">
          <Card>
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reusable input</CardTitle>
              <CardDescription>These are the values that will prefill the matching tool when you reuse this template.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToolInputSummary source={template} />
              <JsonBlock value={template.input} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <Badge>Actions</Badge>
              <CardTitle>Reuse or copy this template</CardTitle>
              <CardDescription>Open the tool with this input prefilled or copy the stored payload directly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href={reuseHref}>
                  Reuse template
                  <RefreshCw className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="w-full" variant="secondary">
                <Link href={getToolPath(template.toolSlug)}>
                  Open original tool
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <CopyActionButton content={getTemplatePrimaryCopyText(template)} defaultLabel="Copy input JSON" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge>Edit</Badge>
              <CardTitle>Rename this template</CardTitle>
              <CardDescription>Keep the stored input intact, but make the label easier to find later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-4" onSubmit={form.handleSubmit((values) => renameMutation.mutate(values))}>
                <div className="space-y-2">
                  <Label htmlFor="rename-template">Template name</Label>
                  <Input id="rename-template" {...form.register('name')} />
                  {form.formState.errors.name ? (
                    <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.name.message}</p>
                  ) : null}
                </div>
                {renameMutation.error instanceof ApiClientError ? (
                  <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
                    {renameMutation.error.message}
                  </p>
                ) : null}
                {renameMutation.isSuccess ? (
                  <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
                    Template updated successfully.
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button disabled={renameMutation.isPending} type="submit">
                    {renameMutation.isPending ? 'Saving...' : 'Save name'}
                  </Button>
                  <Button onClick={() => form.reset({ name: template.name })} type="button" variant="secondary">
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <ContextualLinkCards
            description="Templates are reusable inputs. These links connect the saved setup to the guide, course, or discussion that makes it stronger."
            eyebrow="Related next moves"
            layout="stack"
            links={getToolContextualLinks(template.toolSlug)}
            title="Use this template in context"
          />

          <Card>
            <CardHeader>
              <Badge>Tool reference</Badge>
              <CardTitle>{template.tool.slug}</CardTitle>
              <CardDescription>{template.tool.description}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </Section>
  );
};

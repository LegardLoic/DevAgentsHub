'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { ToolRunInputMap, ToolSlug } from '@devagentshub/types';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@devagentshub/ui';
import { templateNameSchema } from '@devagentshub/validation';

import { ApiClientError } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { buildCreateTemplatePayload, createTemplate } from '../../../lib/templates';

const saveTemplateSchema = z.object({
  name: templateNameSchema,
});

type SaveTemplateValues = z.infer<typeof saveTemplateSchema>;

interface SaveTemplateCardProps<TSlug extends ToolSlug> {
  userId: string;
  suggestedName: string;
  toolSlug: TSlug;
  input: ToolRunInputMap[TSlug];
}

export const SaveTemplateCard = <TSlug extends ToolSlug>({
  userId,
  suggestedName,
  toolSlug,
  input,
}: SaveTemplateCardProps<TSlug>) => {
  const queryClient = useQueryClient();
  const form = useForm<SaveTemplateValues>({
    resolver: zodResolver(saveTemplateSchema),
    defaultValues: {
      name: suggestedName,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: SaveTemplateValues) =>
      createTemplate(buildCreateTemplatePayload(values.name, toolSlug, input)),
    onSuccess: async (template) => {
      form.reset({ name: template.name });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.templates(userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.template(userId, template.id) }),
      ]);
    },
  });

  return (
    <Card>
      <CardHeader>
        <Badge>Template</Badge>
        <CardTitle>Save this input as a reusable template</CardTitle>
        <CardDescription>
          Keep the input separately from run history so you can reopen it intentionally later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="space-y-2">
            <Label htmlFor="template-name">Template name</Label>
            <Input id="template-name" {...form.register('name')} />
            {form.formState.errors.name ? (
              <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.name.message}</p>
            ) : (
              <p className="text-xs text-[var(--color-subtle)]">
                Suggested from the current run. You can rename it before saving.
              </p>
            )}
          </div>
          {mutation.error instanceof ApiClientError ? (
            <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
              {mutation.error.message}
            </p>
          ) : null}
          {mutation.isSuccess ? (
            <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
              Template saved.{' '}
              <Link className="font-semibold underline underline-offset-4" href={`/dashboard/templates/${mutation.data.id}`}>
                Open template
              </Link>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? 'Saving...' : 'Save as template'}
            </Button>
            <Button
              onClick={() => form.reset({ name: suggestedName })}
              type="button"
              variant="secondary"
            >
              Reset name
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

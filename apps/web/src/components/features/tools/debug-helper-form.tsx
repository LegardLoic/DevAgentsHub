'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { DebugHelperOutput, ToolRunResult } from '@devagentshub/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
} from '@devagentshub/ui';
import { debugHelperSchema, type DebugHelperInput } from '@devagentshub/validation';

import { ApiClientError, postJson } from '../../../lib/api';
import { debugHelperDefaultValues, getDebugHelperInitialValues } from '../../../lib/tool-runs';
import { StatusPanel } from '../../layout/status-panel';

const DebugList = ({ items, title }: { items: string[]; title: string }) => (
  <div className="rounded-3xl bg-[var(--color-surface)] p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
      {title}
    </p>
    <ul className="mt-3 space-y-3 text-sm leading-7 text-[var(--color-ink)]">
      {items.map((item) => (
        <li key={item}>- {item}</li>
      ))}
    </ul>
  </div>
);

export const DebugHelperForm = () => {
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const form = useForm<DebugHelperInput>({
    resolver: zodResolver(debugHelperSchema),
    defaultValues: debugHelperDefaultValues,
  });

  useEffect(() => {
    form.reset(getDebugHelperInitialValues(new URLSearchParams(searchParamsKey)));
  }, [form, searchParamsKey]);

  const mutation = useMutation({
    mutationFn: (values: DebugHelperInput) =>
      postJson<ToolRunResult<DebugHelperOutput>, DebugHelperInput>(
        '/api/tools/debug-helper/run',
        values,
      ),
  });

  const result = mutation.data;
  const output = mutation.data?.output;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Paste the issue</CardTitle>
          <CardDescription>
            Describe the failure and get a structured debugging response with causes and next steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="space-y-2">
              <Label htmlFor="errorMessage">Error message</Label>
              <Textarea id="errorMessage" {...form.register('errorMessage')} />
              {form.formState.errors.errorMessage ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.errorMessage.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeSnippet">Code snippet</Label>
              <Textarea id="codeSnippet" {...form.register('codeSnippet')} />
              {form.formState.errors.codeSnippet ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.codeSnippet.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="technicalContext">Technical context</Label>
              <Textarea id="technicalContext" {...form.register('technicalContext')} />
              {form.formState.errors.technicalContext ? (
                <p className="text-sm text-[var(--color-warm)]">
                  {form.formState.errors.technicalContext.message}
                </p>
              ) : null}
            </div>
            {mutation.error instanceof ApiClientError ? (
              <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
                {mutation.error.message}
              </p>
            ) : null}
            <Button className="w-full" disabled={mutation.isPending} type="submit">
              {mutation.isPending ? 'Analyzing...' : 'Generate debug plan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {output && result ? (
        <Card>
          <CardHeader>
            <Badge>{result.tool.name}</Badge>
            <CardTitle>Structured debug response</CardTitle>
            <CardDescription>{output.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
              Debug plan generated successfully.
            </p>
            <DebugList items={output.possibleCauses} title="Possible causes" />
            <DebugList items={output.resolutionSteps} title="Resolution steps" />
            <DebugList items={output.debugChecklist} title="Debug checklist" />
          </CardContent>
        </Card>
      ) : (
        <StatusPanel
          description="Run the tool to get a checklist-driven debugging response."
          title="Your debug plan will appear here"
        />
      )}
    </div>
  );
};

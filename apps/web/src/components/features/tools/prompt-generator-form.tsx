'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { PromptGeneratorOutput, ToolRunResult } from '@devagentshub/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@devagentshub/ui';
import { promptGeneratorSchema, type PromptGeneratorInput } from '@devagentshub/validation';

import { ApiClientError, postJson } from '../../../lib/api';
import {
  getPromptGeneratorInitialValues,
  promptGeneratorDefaultValues,
} from '../../../lib/tool-runs';
import { StatusPanel } from '../../layout/status-panel';

export const PromptGeneratorForm = () => {
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const form = useForm<PromptGeneratorInput>({
    resolver: zodResolver(promptGeneratorSchema),
    defaultValues: promptGeneratorDefaultValues,
  });

  useEffect(() => {
    form.reset(getPromptGeneratorInitialValues(new URLSearchParams(searchParamsKey)));
  }, [form, searchParamsKey]);

  const mutation = useMutation({
    mutationFn: (values: PromptGeneratorInput) =>
      postJson<ToolRunResult<PromptGeneratorOutput>, PromptGeneratorInput>(
        '/api/tools/prompt-generator/run',
        values,
      ),
  });

  const result = mutation.data;
  const output = mutation.data?.output;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>Build your prompt brief</CardTitle>
          <CardDescription>
            Generate a structured prompt that captures project scope, architecture, and delivery bar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="space-y-2">
              <Label htmlFor="projectType">Project type</Label>
              <Input id="projectType" {...form.register('projectType')} />
              {form.formState.errors.projectType ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.projectType.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stack">Stack</Label>
              <Input id="stack" {...form.register('stack')} />
              {form.formState.errors.stack ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.stack.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Textarea id="goal" {...form.register('goal')} />
              {form.formState.errors.goal ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.goal.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="constraints">Constraints</Label>
              <Textarea id="constraints" {...form.register('constraints')} />
              {form.formState.errors.constraints ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.constraints.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="detailLevel">Detail level</Label>
              <select
                className="flex h-11 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-sm outline-none focus-visible:border-[var(--color-accent)]"
                id="detailLevel"
                {...form.register('detailLevel')}
              >
                <option value="concise">Concise</option>
                <option value="balanced">Balanced</option>
                <option value="detailed">Detailed</option>
              </select>
              {form.formState.errors.detailLevel ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.detailLevel.message}</p>
              ) : null}
            </div>
            {mutation.error instanceof ApiClientError ? (
              <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
                {mutation.error.message}
              </p>
            ) : null}
            <Button className="w-full" disabled={mutation.isPending} type="submit">
              {mutation.isPending ? 'Generating...' : 'Generate prompt'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {output && result ? (
        <Card>
          <CardHeader>
            <Badge>{result.tool.name}</Badge>
            <CardTitle>{output.title}</CardTitle>
            <CardDescription>{output.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
              Prompt generated successfully.
            </p>
            <div className="space-y-3">
              {output.sections.map((section) => (
                <div key={section.label} className="rounded-2xl bg-[var(--color-surface)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    {section.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{section.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl bg-[#10253f] p-5 text-sm leading-7 text-white">
              <pre className="whitespace-pre-wrap font-sans">{output.prompt}</pre>
            </div>
          </CardContent>
        </Card>
      ) : (
        <StatusPanel
          description="Run the tool to get a structured prompt you can paste into Codex or another coding agent."
          title="Your generated prompt will appear here"
        />
      )}
    </div>
  );
};

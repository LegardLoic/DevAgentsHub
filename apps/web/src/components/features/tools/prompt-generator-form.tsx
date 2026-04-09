'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
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

import { postJson } from '../../../lib/api';
import { StatusPanel } from '../../layout/status-panel';

export const PromptGeneratorForm = () => {
  const form = useForm<PromptGeneratorInput>({
    resolver: zodResolver(promptGeneratorSchema),
    defaultValues: {
      projectType: 'Production-ready fullstack platform',
      stack: 'Next.js, Express, Prisma, PostgreSQL',
      goal: 'Scaffold a maintainable MVP with tools, guides, learning, and community features.',
      constraints: 'Use strict typing, layered backend architecture, and local Docker-based PostgreSQL.',
      detailLevel: 'detailed',
    },
  });

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
            </div>
            <div className="space-y-2">
              <Label htmlFor="stack">Stack</Label>
              <Input id="stack" {...form.register('stack')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Textarea id="goal" {...form.register('goal')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="constraints">Constraints</Label>
              <Textarea id="constraints" {...form.register('constraints')} />
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
            </div>
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

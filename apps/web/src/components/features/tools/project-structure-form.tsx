'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import type { ProjectStructureOutput, ToolRunResult } from '@devagentshub/types';
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
} from '@devagentshub/ui';
import { projectStructureSchema, type ProjectStructureInput } from '@devagentshub/validation';

import { ApiClientError, postJson } from '../../../lib/api';
import { StatusPanel } from '../../layout/status-panel';
import { ProjectTreePreview } from './project-tree-preview';

export const ProjectStructureForm = () => {
  const form = useForm<ProjectStructureInput>({
    resolver: zodResolver(projectStructureSchema),
    defaultValues: {
      projectName: 'DevAgentsHub',
      template: 'fullstack-monorepo',
      includeTesting: true,
      includeDocker: true,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ProjectStructureInput) =>
      postJson<ToolRunResult<ProjectStructureOutput>, ProjectStructureInput>(
        '/api/tools/project-structure-generator/run',
        values,
      ),
  });

  const output = mutation.data?.output;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Choose your scaffold</CardTitle>
          <CardDescription>
            Generate a project tree with testing and Docker options baked into the structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="space-y-2">
              <Label htmlFor="projectName">Project name</Label>
              <Input id="projectName" {...form.register('projectName')} />
              {form.formState.errors.projectName ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.projectName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <select
                className="flex h-11 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-sm outline-none focus-visible:border-[var(--color-accent)]"
                id="template"
                {...form.register('template')}
              >
                <option value="react-next">React / Next.js</option>
                <option value="node-express">Node / Express</option>
                <option value="fullstack-monorepo">Fullstack monorepo</option>
                <option value="game-dev-docs">Game dev docs</option>
              </select>
              {form.formState.errors.template ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.template.message}</p>
              ) : null}
            </div>
            <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3">
              <span className="text-sm font-medium text-[var(--color-ink)]">Include testing</span>
              <input type="checkbox" {...form.register('includeTesting')} />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3">
              <span className="text-sm font-medium text-[var(--color-ink)]">Include Docker</span>
              <input type="checkbox" {...form.register('includeDocker')} />
            </label>
            {mutation.error instanceof ApiClientError ? (
              <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
                {mutation.error.message}
              </p>
            ) : null}
            <Button className="w-full" disabled={mutation.isPending} type="submit">
              {mutation.isPending ? 'Generating...' : 'Generate structure'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {output ? (
        <Card>
          <CardHeader>
            <Badge>{output.template}</Badge>
            <CardTitle>{output.projectName}</CardTitle>
            <CardDescription>{output.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
              Structure generated successfully.
            </p>
            <ProjectTreePreview tree={output.tree} />
            <div className="rounded-3xl bg-[var(--color-surface)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                Notes
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--color-subtle)]">
                {output.notes.map((note) => (
                  <li key={note}>- {note}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <StatusPanel
          description="Run the generator to inspect the project tree and implementation notes."
          title="Your project structure will appear here"
        />
      )}
    </div>
  );
};

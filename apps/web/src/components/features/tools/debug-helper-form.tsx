'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
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

import { postJson } from '../../../lib/api';
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
  const form = useForm<DebugHelperInput>({
    resolver: zodResolver(debugHelperSchema),
    defaultValues: {
      errorMessage: 'TypeError: Cannot read properties of undefined (reading "profile")',
      codeSnippet:
        "const displayName = data.user.profile.displayName;\nreturn <span>{displayName}</span>;",
      technicalContext:
        'Next.js frontend calling an authenticated API endpoint where the user can exist without a profile.',
    },
  });

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
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeSnippet">Code snippet</Label>
              <Textarea id="codeSnippet" {...form.register('codeSnippet')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technicalContext">Technical context</Label>
              <Textarea id="technicalContext" {...form.register('technicalContext')} />
            </div>
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

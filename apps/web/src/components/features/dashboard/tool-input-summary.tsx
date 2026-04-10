'use client';

import type { SavedTemplateDetail, SavedToolRunDetail } from '@devagentshub/types';

type ToolInputSource = SavedToolRunDetail | SavedTemplateDetail;

export const JsonBlock = ({ value }: { value: unknown }) => (
  <div className="rounded-3xl bg-[#10253f] p-5 text-sm leading-7 text-white">
    <pre className="whitespace-pre-wrap break-words font-mono text-xs">{JSON.stringify(value, null, 2)}</pre>
  </div>
);

export const ToolInputSummary = ({ source }: { source: ToolInputSource }) => {
  switch (source.toolSlug) {
    case 'prompt-generator':
      return (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">Project type</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{source.input.projectType}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">Stack</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{source.input.stack}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">Goal</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{source.input.goal}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">Constraints</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">
              {source.input.constraints || 'No extra constraints'}
            </p>
          </div>
        </div>
      );

    case 'project-structure-generator':
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">Project name</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{source.input.projectName}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">Template</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{source.input.template}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">Include testing</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{source.input.includeTesting ? 'Yes' : 'No'}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">Include Docker</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{source.input.includeDocker ? 'Yes' : 'No'}</p>
          </div>
        </div>
      );

    case 'debug-helper':
      return (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">Error message</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{source.input.errorMessage}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">Technical context</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{source.input.technicalContext}</p>
          </div>
          <div className="rounded-2xl bg-[#10253f] p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Code snippet</p>
            <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-6">{source.input.codeSnippet}</pre>
          </div>
        </div>
      );
  }
};

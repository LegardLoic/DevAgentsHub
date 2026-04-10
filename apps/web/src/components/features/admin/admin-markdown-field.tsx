'use client';

import { useState } from 'react';

import type { TextareaProps } from '@devagentshub/ui';
import { Button, Label, Textarea } from '@devagentshub/ui';

import { MarkdownView } from '../../layout/markdown-view';

interface AdminMarkdownFieldProps {
  description?: string;
  error?: string;
  id: string;
  label: string;
  minHeightClassName?: string;
  textareaProps: TextareaProps;
  value: string;
}

export const AdminMarkdownField = ({
  description,
  error,
  id,
  label,
  minHeightClassName = 'min-h-[320px]',
  textareaProps,
  value,
}: AdminMarkdownFieldProps) => {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const hasContent = value.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Label htmlFor={id}>{label}</Label>
          {description ? (
            <p className="text-sm leading-6 text-[var(--color-subtle)]">{description}</p>
          ) : null}
        </div>
        <div className="flex rounded-full border border-[var(--color-border)] bg-white p-1">
          <Button
            onClick={() => setMode('write')}
            size="sm"
            type="button"
            variant={mode === 'write' ? 'default' : 'ghost'}
          >
            Write
          </Button>
          <Button
            onClick={() => setMode('preview')}
            size="sm"
            type="button"
            variant={mode === 'preview' ? 'default' : 'ghost'}
          >
            Preview
          </Button>
        </div>
      </div>

      {mode === 'write' ? (
        <Textarea className={minHeightClassName} id={id} {...textareaProps} />
      ) : (
        <div className="min-h-[220px] rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          {hasContent ? (
            <MarkdownView content={value} />
          ) : (
            <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-[var(--color-surface)] px-4 text-center text-sm text-[var(--color-subtle)]">
              Write markdown content to preview the rendered result here.
            </div>
          )}
        </div>
      )}

      {error ? <p className="text-sm text-[var(--color-warm)]">{error}</p> : null}
    </div>
  );
};

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type {
  DebugHelperInput,
  PromptGeneratorInput,
  ProjectStructureInput,
  SavedTemplateDetail,
} from '@devagentshub/types';
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
import {
  debugHelperSchema,
  projectStructureSchema,
  promptGeneratorSchema,
} from '@devagentshub/validation';

type TemplateInputEditorProps = {
  errorMessage?: string | null;
  isSaving: boolean;
  onSave: (input: SavedTemplateDetail['input']) => void;
  successMessage?: string | null;
  template: SavedTemplateDetail;
};

type ToolSpecificEditorProps<TInput> = {
  input: TInput;
  isSaving: boolean;
  onSave: (input: TInput) => void;
};

const selectClassName =
  'flex h-11 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-sm outline-none focus-visible:border-[var(--color-accent)]';

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-sm text-[var(--color-warm)]">{message}</p> : null;

const SaveFeedback = ({
  errorMessage,
  successMessage,
}: {
  errorMessage?: string | null;
  successMessage?: string | null;
}) => (
  <>
    {errorMessage ? (
      <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
        {errorMessage}
      </p>
    ) : null}
    {successMessage ? (
      <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
        {successMessage}
      </p>
    ) : null}
  </>
);

const PromptTemplateInputForm = ({
  input,
  isSaving,
  onSave,
}: ToolSpecificEditorProps<PromptGeneratorInput>) => {
  const form = useForm<PromptGeneratorInput>({
    resolver: zodResolver(promptGeneratorSchema),
    defaultValues: input,
  });

  useEffect(() => {
    form.reset(input);
  }, [form, input]);

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSave(values))}>
      <div className="space-y-2">
        <Label htmlFor="template-projectType">Project type</Label>
        <Input id="template-projectType" {...form.register('projectType')} />
        <FieldError message={form.formState.errors.projectType?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="template-stack">Stack</Label>
        <Input id="template-stack" {...form.register('stack')} />
        <FieldError message={form.formState.errors.stack?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="template-goal">Goal</Label>
        <Textarea id="template-goal" {...form.register('goal')} />
        <FieldError message={form.formState.errors.goal?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="template-constraints">Constraints</Label>
        <Textarea id="template-constraints" {...form.register('constraints')} />
        <FieldError message={form.formState.errors.constraints?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="template-detailLevel">Detail level</Label>
        <select
          className={selectClassName}
          id="template-detailLevel"
          {...form.register('detailLevel')}
        >
          <option value="concise">Concise</option>
          <option value="balanced">Balanced</option>
          <option value="detailed">Detailed</option>
        </select>
        <FieldError message={form.formState.errors.detailLevel?.message} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button disabled={isSaving} type="submit">
          {isSaving ? 'Saving input...' : 'Save stored input'}
        </Button>
        <Button onClick={() => form.reset(input)} type="button" variant="secondary">
          Reset fields
        </Button>
      </div>
    </form>
  );
};

const ProjectTemplateInputForm = ({
  input,
  isSaving,
  onSave,
}: ToolSpecificEditorProps<ProjectStructureInput>) => {
  const form = useForm<ProjectStructureInput>({
    resolver: zodResolver(projectStructureSchema),
    defaultValues: input,
  });

  useEffect(() => {
    form.reset(input);
  }, [form, input]);

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSave(values))}>
      <div className="space-y-2">
        <Label htmlFor="template-projectName">Project name</Label>
        <Input id="template-projectName" {...form.register('projectName')} />
        <FieldError message={form.formState.errors.projectName?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="template-projectTemplate">Template</Label>
        <select
          className={selectClassName}
          id="template-projectTemplate"
          {...form.register('template')}
        >
          <option value="react-next">React / Next.js</option>
          <option value="node-express">Node / Express</option>
          <option value="fullstack-monorepo">Fullstack monorepo</option>
          <option value="game-dev-docs">Game dev docs</option>
        </select>
        <FieldError message={form.formState.errors.template?.message} />
      </div>
      <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3">
        <span className="text-sm font-medium text-[var(--color-ink)]">Include testing</span>
        <input type="checkbox" {...form.register('includeTesting')} />
      </label>
      <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3">
        <span className="text-sm font-medium text-[var(--color-ink)]">Include Docker</span>
        <input type="checkbox" {...form.register('includeDocker')} />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button disabled={isSaving} type="submit">
          {isSaving ? 'Saving input...' : 'Save stored input'}
        </Button>
        <Button onClick={() => form.reset(input)} type="button" variant="secondary">
          Reset fields
        </Button>
      </div>
    </form>
  );
};

const DebugTemplateInputForm = ({
  input,
  isSaving,
  onSave,
}: ToolSpecificEditorProps<DebugHelperInput>) => {
  const form = useForm<DebugHelperInput>({
    resolver: zodResolver(debugHelperSchema),
    defaultValues: input,
  });

  useEffect(() => {
    form.reset(input);
  }, [form, input]);

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSave(values))}>
      <div className="space-y-2">
        <Label htmlFor="template-errorMessage">Error message</Label>
        <Textarea id="template-errorMessage" {...form.register('errorMessage')} />
        <FieldError message={form.formState.errors.errorMessage?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="template-codeSnippet">Code snippet</Label>
        <Textarea id="template-codeSnippet" {...form.register('codeSnippet')} />
        <FieldError message={form.formState.errors.codeSnippet?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="template-technicalContext">Technical context</Label>
        <Textarea id="template-technicalContext" {...form.register('technicalContext')} />
        <FieldError message={form.formState.errors.technicalContext?.message} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button disabled={isSaving} type="submit">
          {isSaving ? 'Saving input...' : 'Save stored input'}
        </Button>
        <Button onClick={() => form.reset(input)} type="button" variant="secondary">
          Reset fields
        </Button>
      </div>
    </form>
  );
};

export const TemplateInputEditor = ({
  errorMessage,
  isSaving,
  onSave,
  successMessage,
  template,
}: TemplateInputEditorProps) => {
  const editor = (() => {
    switch (template.toolSlug) {
      case 'prompt-generator':
        return (
          <PromptTemplateInputForm input={template.input} isSaving={isSaving} onSave={onSave} />
        );

      case 'project-structure-generator':
        return (
          <ProjectTemplateInputForm input={template.input} isSaving={isSaving} onSave={onSave} />
        );

      case 'debug-helper':
        return (
          <DebugTemplateInputForm input={template.input} isSaving={isSaving} onSave={onSave} />
        );
    }
  })();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Edit input</Badge>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
            {template.tool.name}
          </span>
        </div>
        <CardTitle>Stored tool input</CardTitle>
        <CardDescription>
          Update the reusable fields saved in this template. Reuse and run actions will use the
          latest values.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {editor}
        <SaveFeedback errorMessage={errorMessage} successMessage={successMessage} />
      </CardContent>
    </Card>
  );
};

import type { ReactNode } from 'react';
import Link from 'next/link';

import type { AuthUser, LessonDetail } from '@devagentshub/types';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { MarkdownView } from '../../layout/markdown-view';

interface LessonDetailCardProps {
  lesson: LessonDetail;
  user: AuthUser | null | undefined;
  isSaving: boolean;
  onToggleProgress: () => void;
  errorMessage?: string | null;
  successMessage?: string | null;
  secondaryAction?: ReactNode;
}

export const LessonDetailCard = ({
  lesson,
  user,
  isSaving,
  onToggleProgress,
  errorMessage,
  successMessage,
  secondaryAction,
}: LessonDetailCardProps) => (
  <Card>
    <CardHeader>
      <div className="flex flex-wrap items-center gap-3">
        <Badge>{lesson.course.title}</Badge>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
          Lesson {lesson.order}
        </span>
      </div>
      <CardTitle>{lesson.title}</CardTitle>
      <CardDescription>
        {user
          ? lesson.progress?.completed
            ? lesson.progress.completedAt
              ? `Completed on ${formatDate(lesson.progress.completedAt)}`
              : 'Completed lesson'
            : 'Mark this lesson complete when you finish reading.'
          : 'Login to track your lesson progress.'}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <MarkdownView content={lesson.content} />
      {successMessage ? (
        <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
          {errorMessage}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {user ? (
          <Button disabled={isSaving} onClick={onToggleProgress}>
            {lesson.progress?.completed ? 'Mark as incomplete' : 'Mark as complete'}
          </Button>
        ) : (
          <Button asChild variant="secondary">
            <Link href="/login">Login to save progress</Link>
          </Button>
        )}
        {secondaryAction}
      </div>
    </CardContent>
  </Card>
);

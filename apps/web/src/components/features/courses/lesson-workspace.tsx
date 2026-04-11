'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import type { LessonDetail, LessonProgressResponse } from '@devagentshub/types';
import { Button, Section } from '@devagentshub/ui';

import { ApiClientError, apiFetch, getApiClientErrorMessage, postJson } from '../../../lib/api';
import { getLessonContextualLinks } from '../../../lib/contextual-links';
import { queryKeys } from '../../../lib/query-keys';
import { useCurrentUser } from '../../../hooks/use-auth';
import { ContextualLinkCards } from '../../layout/contextual-link-cards';
import { StatusPanel } from '../../layout/status-panel';
import { LessonDetailCard } from './lesson-detail-card';

export const LessonWorkspace = ({ slug }: { slug: string }) => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const lessonQuery = useQuery({
    queryKey: queryKeys.lesson(slug),
    queryFn: () => apiFetch<LessonDetail>(`/api/courses/lessons/${slug}`),
  });

  const progressMutation = useMutation({
    mutationFn: (payload: { lessonId: string; completed: boolean; courseSlug: string }) =>
      postJson<LessonProgressResponse, { completed: boolean }>(
        `/api/courses/lessons/${payload.lessonId}/progress`,
        { completed: payload.completed },
      ),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.lesson(slug) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.course(variables.courseSlug) }),
      ]);
    },
  });

  if (lessonQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching lesson content." title="Loading lesson" tone="loading" />
      </Section>
    );
  }

  if (lessonQuery.isError || !lessonQuery.data) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(lessonQuery.error, 'The lesson could not be loaded.')}
          title="Lesson unavailable"
          tone="error"
        />
      </Section>
    );
  }

  const lesson = lessonQuery.data;

  return (
    <Section className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="ghost">
          <Link href={`/formations/${lesson.course.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to course
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/formations">Back to formations</Link>
        </Button>
      </div>

      <LessonDetailCard
        errorMessage={progressMutation.error instanceof ApiClientError ? progressMutation.error.message : null}
        isSaving={progressMutation.isPending}
        lesson={lesson}
        onToggleProgress={() =>
          progressMutation.mutate({
            lessonId: lesson.id,
            completed: !lesson.progress?.completed,
            courseSlug: lesson.course.slug,
          })
        }
        successMessage={
          progressMutation.status === 'success'
            ? progressMutation.data.completed
              ? 'Lesson progress saved as completed.'
              : 'Lesson progress reset to incomplete.'
            : null
        }
        user={user}
      />

      <ContextualLinkCards
        description="Use the lesson as the focused reading surface, then jump into the matching guide, tool, or discussion path."
        eyebrow="Lesson context"
        links={getLessonContextualLinks(lesson.course.slug)}
        title="Keep learning connected to execution"
      />
    </Section>
  );
};

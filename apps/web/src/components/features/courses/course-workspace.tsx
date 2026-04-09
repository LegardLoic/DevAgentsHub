'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import type { CourseDetail, LessonDetail, LessonProgressResponse } from '@devagentshub/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Section,
} from '@devagentshub/ui';

import { ApiClientError, apiFetch, getApiClientErrorMessage, postJson } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { useCurrentUser } from '../../../hooks/use-auth';
import { StatusPanel } from '../../layout/status-panel';
import { LessonDetailCard } from './lesson-detail-card';

export const CourseWorkspace = ({ slug }: { slug: string }) => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [selectedLessonSlug, setSelectedLessonSlug] = useState<string>('');

  const courseQuery = useQuery({
    queryKey: queryKeys.course(slug),
    queryFn: () => apiFetch<CourseDetail>(`/api/courses/${slug}`),
  });

  useEffect(() => {
    const firstLesson = courseQuery.data?.lessons[0];

    if (!selectedLessonSlug && firstLesson) {
      setSelectedLessonSlug(firstLesson.slug);
    }
  }, [courseQuery.data, selectedLessonSlug]);

  const lessonQuery = useQuery({
    queryKey: queryKeys.lesson(selectedLessonSlug),
    queryFn: () => apiFetch<LessonDetail>(`/api/courses/lessons/${selectedLessonSlug}`),
    enabled: Boolean(selectedLessonSlug),
  });

  const progressMutation = useMutation({
    mutationFn: (payload: { lessonId: string; completed: boolean }) =>
      postJson<LessonProgressResponse, { completed: boolean }>(
        `/api/courses/lessons/${payload.lessonId}/progress`,
        { completed: payload.completed },
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.course(slug) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.lesson(selectedLessonSlug) }),
      ]);
    },
  });

  if (courseQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching the course structure." title="Loading course" tone="loading" />
      </Section>
    );
  }

  if (courseQuery.isError || !courseQuery.data) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(courseQuery.error, 'The course could not be loaded.')}
          title="Course unavailable"
          tone="error"
        />
      </Section>
    );
  }

  if (!courseQuery.data.lessons.length) {
    return (
      <Section className="space-y-6">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/formations">
          <ArrowLeft className="h-4 w-4" />
          Back to formations
        </Link>
        <EmptyState
          description="This course does not have any published lessons yet."
          title="No lessons available"
        />
      </Section>
    );
  }

  return (
    <Section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/formations">
        <ArrowLeft className="h-4 w-4" />
        Back to formations
      </Link>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Badge>{courseQuery.data.lessonsCount} lessons</Badge>
              <CardTitle>{courseQuery.data.title}</CardTitle>
              <CardDescription>{courseQuery.data.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseQuery.data.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`rounded-3xl border px-4 py-4 transition ${
                    selectedLessonSlug === lesson.slug
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                      : 'border-[var(--color-border)] bg-white'
                  }`}
                >
                  <button
                    className="w-full text-left"
                    onClick={() => setSelectedLessonSlug(lesson.slug)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                          Lesson {lesson.order}
                        </p>
                        <p className="mt-1 text-base font-semibold text-[var(--color-ink)]">{lesson.title}</p>
                      </div>
                      {lesson.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--color-accent)]" />
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-subtle)]">{lesson.excerpt}</p>
                  </button>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                      {lesson.completed ? 'Saved as completed' : 'Not completed yet'}
                    </span>
                    <Link
                      className="text-sm font-semibold text-[var(--color-accent)]"
                      href={`/formations/lessons/${lesson.slug}`}
                    >
                      Open lesson page
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {!user ? (
            <StatusPanel
              description="Login to persist lesson completion and keep your progress aligned between the course workspace and dedicated lesson pages."
              title="Progress tracking is available after login"
            />
          ) : null}
        </div>

        {lessonQuery.isLoading ? (
          <StatusPanel description="Fetching lesson content." title="Loading lesson" tone="loading" />
        ) : lessonQuery.isError || !lessonQuery.data ? (
          <StatusPanel
            description={getApiClientErrorMessage(lessonQuery.error, 'The selected lesson could not be loaded.')}
            title="Lesson unavailable"
            tone="error"
          />
        ) : (
          <LessonDetailCard
            errorMessage={progressMutation.error instanceof ApiClientError ? progressMutation.error.message : null}
            isSaving={progressMutation.isPending}
            lesson={lessonQuery.data}
            onToggleProgress={() =>
              progressMutation.mutate({
                lessonId: lessonQuery.data.id,
                completed: !lessonQuery.data.progress?.completed,
              })
            }
            successMessage={
              progressMutation.status === 'success' &&
              progressMutation.variables?.lessonId === lessonQuery.data.id
                ? progressMutation.data.completed
                  ? 'Lesson marked as completed. Course progress has been refreshed.'
                  : 'Lesson marked as incomplete. Course progress has been refreshed.'
                : null
            }
            secondaryAction={
              <Button asChild variant="secondary">
                <Link href={`/formations/lessons/${lessonQuery.data.slug}`}>Open lesson page</Link>
              </Button>
            }
            user={user}
          />
        )}
      </div>
    </Section>
  );
};

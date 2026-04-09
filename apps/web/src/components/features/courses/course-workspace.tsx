'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import type { CourseDetail, LessonDetail, LessonProgressResponse } from '@devagentshub/types';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Section } from '@devagentshub/ui';

import { apiFetch, postJson } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { useCurrentUser } from '../../../hooks/use-auth';
import { MarkdownView } from '../../layout/markdown-view';
import { StatusPanel } from '../../layout/status-panel';

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
        <StatusPanel description="The course could not be loaded." title="Course unavailable" tone="error" />
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
        <Card>
          <CardHeader>
            <Badge>{courseQuery.data.lessonsCount} lessons</Badge>
            <CardTitle>{courseQuery.data.title}</CardTitle>
            <CardDescription>{courseQuery.data.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {courseQuery.data.lessons.map((lesson) => (
              <button
                key={lesson.id}
                className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                  selectedLessonSlug === lesson.slug
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                    : 'border-[var(--color-border)] bg-white'
                }`}
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
            ))}
          </CardContent>
        </Card>

        {lessonQuery.isLoading ? (
          <StatusPanel description="Fetching lesson content." title="Loading lesson" tone="loading" />
        ) : lessonQuery.isError || !lessonQuery.data ? (
          <StatusPanel description="The selected lesson could not be loaded." title="Lesson unavailable" tone="error" />
        ) : (
          <Card>
            <CardHeader>
              <Badge>{lessonQuery.data.course.title}</Badge>
              <CardTitle>{lessonQuery.data.title}</CardTitle>
              <CardDescription>
                {user
                  ? lessonQuery.data.progress?.completed
                    ? 'Completed lesson'
                    : 'Mark this lesson complete when you finish reading.'
                  : 'Login to track your lesson progress.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <MarkdownView content={lessonQuery.data.content} />
              {user ? (
                <Button
                  disabled={progressMutation.isPending}
                  onClick={() =>
                    progressMutation.mutate({
                      lessonId: lessonQuery.data.id,
                      completed: !lessonQuery.data.progress?.completed,
                    })
                  }
                >
                  {lessonQuery.data.progress?.completed ? 'Mark as incomplete' : 'Mark as complete'}
                </Button>
              ) : (
                <Button asChild variant="secondary">
                  <Link href="/login">Login to save progress</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Section>
  );
};

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ExternalLink, PlusCircle } from 'lucide-react';

import type { AdminCoursePayload, AdminLessonDetail, AdminLessonPayload } from '@devagentshub/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Label,
  Section,
  Textarea,
} from '@devagentshub/ui';
import { formatDate, slugify } from '@devagentshub/utils';
import { adminCourseSchema, adminLessonSchema } from '@devagentshub/validation';

import {
  createAdminCourse,
  createAdminLesson,
  fetchAdminCourse,
  updateAdminCourse,
  updateAdminLesson,
} from '../../../lib/admin-content';
import { ApiClientError, getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { StatusPanel } from '../../layout/status-panel';
import { AdminAccessDenied } from './admin-access-denied';
import { AdminAuthRequired } from './admin-auth-required';
import { AdminGate } from './admin-gate';

const defaultCourseValues: AdminCoursePayload = {
  title: '',
  slug: '',
  description: '',
  isPublished: false,
};

const defaultLessonValues: AdminLessonPayload = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  order: 1,
};

interface AdminCourseEditorProps {
  courseId?: string;
}

export const AdminCourseEditor = ({ courseId }: AdminCourseEditorProps) => (
  <AdminGate nextPath={courseId ? `/admin/courses/${courseId}` : '/admin/courses/new'}>
    {() => <AdminCourseEditorContent courseId={courseId} />}
  </AdminGate>
);

const AdminCourseEditorContent = ({ courseId }: AdminCourseEditorProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(courseId));
  const courseForm = useForm<AdminCoursePayload>({
    resolver: zodResolver(adminCourseSchema),
    defaultValues: defaultCourseValues,
  });
  const courseTitle = courseForm.watch('title');

  const courseQuery = useQuery({
    queryKey: queryKeys.adminCourse(courseId ?? 'new'),
    queryFn: () => fetchAdminCourse(courseId as string),
    enabled: Boolean(courseId),
  });

  useEffect(() => {
    if (!courseId || !courseQuery.data) {
      return;
    }

    courseForm.reset({
      title: courseQuery.data.title,
      slug: courseQuery.data.slug,
      description: courseQuery.data.description,
      isPublished: courseQuery.data.isPublished,
    });
    setSlugManuallyEdited(true);
  }, [courseForm, courseId, courseQuery.data]);

  useEffect(() => {
    if (slugManuallyEdited) {
      return;
    }

    courseForm.setValue('slug', slugify(courseTitle), {
      shouldDirty: Boolean(courseTitle),
      shouldValidate: false,
    });
  }, [courseForm, courseTitle, slugManuallyEdited]);

  const saveCourseMutation = useMutation({
    mutationFn: (values: AdminCoursePayload) =>
      courseId ? updateAdminCourse(courseId, values) : createAdminCourse(values),
    onSuccess: async (course) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.adminCourses }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminCourse(course.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.courses }),
        queryClient.invalidateQueries({ queryKey: queryKeys.course(course.slug) }),
      ]);

      courseForm.reset({
        title: course.title,
        slug: course.slug,
        description: course.description,
        isPublished: course.isPublished,
      });
      setSlugManuallyEdited(true);

      if (!courseId) {
        router.push(`/admin/courses/${course.id}`);
        router.refresh();
      }
    },
  });

  if (courseId && courseQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching course details for editing." title="Loading course" tone="loading" />
      </Section>
    );
  }

  if (courseId && courseQuery.isError) {
    if (courseQuery.error instanceof ApiClientError && courseQuery.error.statusCode === 401) {
      return (
        <Section>
          <AdminAuthRequired nextPath={`/admin/courses/${courseId}`} />
        </Section>
      );
    }

    if (courseQuery.error instanceof ApiClientError && courseQuery.error.statusCode === 403) {
      return (
        <Section>
          <AdminAccessDenied />
        </Section>
      );
    }

    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(courseQuery.error, 'The course could not be loaded for editing.')}
          title="Course unavailable"
          tone="error"
        />
      </Section>
    );
  }

  const course = courseQuery.data;

  return (
    <Section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/admin/courses">
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Badge>{courseId ? 'Edit course' : 'New course'}</Badge>
          <h1 className="headline text-5xl font-bold">
            {courseId ? 'Update learning content' : 'Create a new course'}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
            Keep the learning slice publishable, explicit, and easy to iterate on.
          </p>
        </div>
        {course?.isPublished ? (
          <Button asChild variant="secondary">
            <Link href={`/formations/${course.slug}`}>
              Open public course
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{courseId ? 'Course settings' : 'Course draft'}</CardTitle>
          <CardDescription>Title, slug, description, and publication status are managed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={courseForm.handleSubmit((values) => saveCourseMutation.mutate(values))}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...courseForm.register('title')} />
              {courseForm.formState.errors.title ? (
                <p className="text-sm text-[var(--color-warm)]">{courseForm.formState.errors.title.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="slug">Slug</Label>
                <button
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]"
                  onClick={() => {
                    courseForm.setValue('slug', slugify(courseForm.getValues('title')), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setSlugManuallyEdited(false);
                  }}
                  type="button"
                >
                  Auto-fill from title
                </button>
              </div>
              <Input
                id="slug"
                {...courseForm.register('slug')}
                onChange={(event) => {
                  setSlugManuallyEdited(true);
                  courseForm.register('slug').onChange(event);
                }}
              />
              {courseForm.formState.errors.slug ? (
                <p className="text-sm text-[var(--color-warm)]">{courseForm.formState.errors.slug.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...courseForm.register('description')} />
              {courseForm.formState.errors.description ? (
                <p className="text-sm text-[var(--color-warm)]">{courseForm.formState.errors.description.message}</p>
              ) : null}
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3">
              <span className="text-sm font-medium text-[var(--color-ink)]">Published</span>
              <input type="checkbox" {...courseForm.register('isPublished')} />
            </label>

            {saveCourseMutation.error instanceof ApiClientError ? (
              <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
                {saveCourseMutation.error.message}
              </p>
            ) : null}

            {saveCourseMutation.isSuccess && courseId ? (
              <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
                Course saved successfully.
              </p>
            ) : null}

            <Button className="w-full" disabled={saveCourseMutation.isPending} type="submit">
              {saveCourseMutation.isPending ? 'Saving...' : courseId ? 'Save course' : 'Create course'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {courseId && course ? (
        <LessonsManager courseId={courseId} lessons={course.lessons} publishedCourseSlug={course.isPublished ? course.slug : null} />
      ) : (
        <StatusPanel
          description="Save the course first. Lesson management becomes available on the course edit page once the course exists."
          title="Lesson management unlocks after course creation"
        />
      )}
    </Section>
  );
};

const LessonsManager = ({
  courseId,
  lessons,
  publishedCourseSlug,
}: {
  courseId: string;
  lessons: AdminLessonDetail[];
  publishedCourseSlug: string | null;
}) => {
  const queryClient = useQueryClient();
  const [createSlugManuallyEdited, setCreateSlugManuallyEdited] = useState(false);
  const createLessonForm = useForm<AdminLessonPayload>({
    resolver: zodResolver(adminLessonSchema),
    defaultValues: {
      ...defaultLessonValues,
      order: (lessons[lessons.length - 1]?.order ?? 0) + 1,
    },
  });
  const createLessonTitle = createLessonForm.watch('title');

  useEffect(() => {
    if (createSlugManuallyEdited) {
      return;
    }

    createLessonForm.setValue('slug', slugify(createLessonTitle), {
      shouldDirty: Boolean(createLessonTitle),
      shouldValidate: false,
    });
  }, [createLessonForm, createLessonTitle, createSlugManuallyEdited]);

  const createLessonMutation = useMutation({
    mutationFn: (values: AdminLessonPayload) => createAdminLesson(courseId, values),
    onSuccess: async (createdLesson) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.adminCourse(courseId) }),
        publishedCourseSlug
          ? queryClient.invalidateQueries({ queryKey: queryKeys.course(publishedCourseSlug) })
          : Promise.resolve(),
      ]);
      createLessonForm.reset({
        ...defaultLessonValues,
        order: createdLesson.order + 1,
      });
      setCreateSlugManuallyEdited(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge>Lessons</Badge>
        <h2 className="headline text-3xl font-bold">Manage lesson ordering and content</h2>
        <p className="max-w-2xl text-base leading-7 text-[var(--color-subtle)]">
          Lessons stay inside the course workflow to keep ordering explicit and predictable.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a lesson</CardTitle>
          <CardDescription>
            Add a new lesson with an explicit numeric order. Reorder conflicts are rejected cleanly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={createLessonForm.handleSubmit((values) => createLessonMutation.mutate(values))}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Title</Label>
                <Input id="lesson-title" {...createLessonForm.register('title')} />
                {createLessonForm.formState.errors.title ? (
                  <p className="text-sm text-[var(--color-warm)]">{createLessonForm.formState.errors.title.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="lesson-slug">Slug</Label>
                  <button
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]"
                    onClick={() => {
                      createLessonForm.setValue('slug', slugify(createLessonForm.getValues('title')), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setCreateSlugManuallyEdited(false);
                    }}
                    type="button"
                  >
                    Auto-fill from title
                  </button>
                </div>
                <Input
                  id="lesson-slug"
                  {...createLessonForm.register('slug')}
                  onChange={(event) => {
                    setCreateSlugManuallyEdited(true);
                    createLessonForm.register('slug').onChange(event);
                  }}
                />
                {createLessonForm.formState.errors.slug ? (
                  <p className="text-sm text-[var(--color-warm)]">{createLessonForm.formState.errors.slug.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_140px]">
              <div className="space-y-2">
                <Label htmlFor="lesson-excerpt">Excerpt</Label>
                <Textarea id="lesson-excerpt" {...createLessonForm.register('excerpt')} />
                {createLessonForm.formState.errors.excerpt ? (
                  <p className="text-sm text-[var(--color-warm)]">{createLessonForm.formState.errors.excerpt.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-order">Order</Label>
                <Input
                  id="lesson-order"
                  type="number"
                  {...createLessonForm.register('order', { valueAsNumber: true })}
                />
                {createLessonForm.formState.errors.order ? (
                  <p className="text-sm text-[var(--color-warm)]">{createLessonForm.formState.errors.order.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-content">Content</Label>
              <Textarea className="min-h-[220px]" id="lesson-content" {...createLessonForm.register('content')} />
              {createLessonForm.formState.errors.content ? (
                <p className="text-sm text-[var(--color-warm)]">{createLessonForm.formState.errors.content.message}</p>
              ) : null}
            </div>

            {createLessonMutation.error instanceof ApiClientError ? (
              <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
                {createLessonMutation.error.message}
              </p>
            ) : null}

            {createLessonMutation.isSuccess ? (
              <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
                Lesson created successfully.
              </p>
            ) : null}

            <Button disabled={createLessonMutation.isPending} type="submit">
              <PlusCircle className="mr-2 h-4 w-4" />
              {createLessonMutation.isPending ? 'Saving lesson...' : 'Create lesson'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {lessons.length ? (
        <div className="grid gap-6">
          {lessons.map((lesson) => (
            <LessonEditorCard
              key={lesson.id}
              courseId={courseId}
              lesson={lesson}
              publishedCourseSlug={publishedCourseSlug}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          description="Create the first lesson to make this course useful in the learning slice."
          title="No lessons yet"
        />
      )}
    </div>
  );
};

const LessonEditorCard = ({
  courseId,
  lesson,
  publishedCourseSlug,
}: {
  courseId: string;
  lesson: AdminLessonDetail;
  publishedCourseSlug: string | null;
}) => {
  const queryClient = useQueryClient();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true);
  const form = useForm<AdminLessonPayload>({
    resolver: zodResolver(adminLessonSchema),
    defaultValues: {
      title: lesson.title,
      slug: lesson.slug,
      excerpt: lesson.excerpt,
      content: lesson.content,
      order: lesson.order,
    },
  });
  const titleValue = form.watch('title');

  useEffect(() => {
    form.reset({
      title: lesson.title,
      slug: lesson.slug,
      excerpt: lesson.excerpt,
      content: lesson.content,
      order: lesson.order,
    });
    setSlugManuallyEdited(true);
  }, [form, lesson]);

  useEffect(() => {
    if (slugManuallyEdited) {
      return;
    }

    form.setValue('slug', slugify(titleValue), {
      shouldDirty: Boolean(titleValue),
      shouldValidate: false,
    });
  }, [form, slugManuallyEdited, titleValue]);

  const mutation = useMutation({
    mutationFn: (values: AdminLessonPayload) => updateAdminLesson(lesson.id, values),
    onSuccess: async (updatedLesson) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.adminCourse(courseId) }),
        publishedCourseSlug
          ? queryClient.invalidateQueries({ queryKey: queryKeys.course(publishedCourseSlug) })
          : Promise.resolve(),
        publishedCourseSlug
          ? queryClient.invalidateQueries({ queryKey: queryKeys.lesson(updatedLesson.slug) })
          : Promise.resolve(),
      ]);
      form.reset({
        title: updatedLesson.title,
        slug: updatedLesson.slug,
        excerpt: updatedLesson.excerpt,
        content: updatedLesson.content,
        order: updatedLesson.order,
      });
      setSlugManuallyEdited(true);
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Badge>Lesson {lesson.order}</Badge>
            <CardTitle>{lesson.title}</CardTitle>
            <CardDescription>Updated {formatDate(lesson.updatedAt)}</CardDescription>
          </div>
          {publishedCourseSlug ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={`/formations/lessons/${lesson.slug}`}>
                Open public lesson
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`lesson-title-${lesson.id}`}>Title</Label>
              <Input id={`lesson-title-${lesson.id}`} {...form.register('title')} />
              {form.formState.errors.title ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.title.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={`lesson-slug-${lesson.id}`}>Slug</Label>
                <button
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]"
                  onClick={() => {
                    form.setValue('slug', slugify(form.getValues('title')), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setSlugManuallyEdited(false);
                  }}
                  type="button"
                >
                  Auto-fill from title
                </button>
              </div>
              <Input
                id={`lesson-slug-${lesson.id}`}
                {...form.register('slug')}
                onChange={(event) => {
                  setSlugManuallyEdited(true);
                  form.register('slug').onChange(event);
                }}
              />
              {form.formState.errors.slug ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.slug.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[1fr_140px]">
            <div className="space-y-2">
              <Label htmlFor={`lesson-excerpt-${lesson.id}`}>Excerpt</Label>
              <Textarea id={`lesson-excerpt-${lesson.id}`} {...form.register('excerpt')} />
              {form.formState.errors.excerpt ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.excerpt.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`lesson-order-${lesson.id}`}>Order</Label>
              <Input
                id={`lesson-order-${lesson.id}`}
                type="number"
                {...form.register('order', { valueAsNumber: true })}
              />
              {form.formState.errors.order ? (
                <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.order.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`lesson-content-${lesson.id}`}>Content</Label>
            <Textarea className="min-h-[220px]" id={`lesson-content-${lesson.id}`} {...form.register('content')} />
            {form.formState.errors.content ? (
              <p className="text-sm text-[var(--color-warm)]">{form.formState.errors.content.message}</p>
            ) : null}
          </div>

          {mutation.error instanceof ApiClientError ? (
            <p className="rounded-2xl bg-[rgba(234,88,12,0.1)] px-4 py-3 text-sm text-[var(--color-warm)]">
              {mutation.error.message}
            </p>
          ) : null}

          {mutation.isSuccess ? (
            <p className="rounded-2xl bg-[rgba(15,118,110,0.08)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
              Lesson saved successfully.
            </p>
          ) : null}

          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Saving lesson...' : 'Save lesson'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

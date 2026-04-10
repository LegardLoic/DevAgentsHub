'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, GraduationCap, PlusCircle } from 'lucide-react';

import type { AdminCourseSummary } from '@devagentshub/types';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Section } from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { fetchAdminCourses } from '../../../lib/admin-content';
import { ApiClientError, getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { StatusPanel } from '../../layout/status-panel';
import { AdminAccessDenied } from './admin-access-denied';
import { AdminAuthRequired } from './admin-auth-required';
import { AdminGate } from './admin-gate';

export const AdminCoursesList = () => (
  <AdminGate nextPath="/admin/courses">
    {() => <AdminCoursesListContent />}
  </AdminGate>
);

const CoursesGrid = ({ courses }: { courses: AdminCourseSummary[] }) => (
  <div className="grid gap-6">
    {courses.map((course) => (
      <Card key={course.id}>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{course.isPublished ? 'Published' : 'Draft'}</Badge>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-subtle)]">
              Updated {formatDate(course.updatedAt)}
            </span>
          </div>
          <CardTitle>{course.title}</CardTitle>
          <CardDescription>{course.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--color-subtle)]">
            {course.lessonsCount} lesson{course.lessonsCount === 1 ? '' : 's'} • {course.slug}
          </div>
          <div className="flex flex-wrap gap-3">
            {course.isPublished ? (
              <Button asChild size="sm" variant="secondary">
                <Link href={`/formations/${course.slug}`}>Open public course</Link>
              </Button>
            ) : null}
            <Button asChild size="sm">
              <Link href={`/admin/courses/${course.id}`}>
                Edit course
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const AdminCoursesListContent = () => {
  const coursesQuery = useQuery({
    queryKey: queryKeys.adminCourses,
    queryFn: fetchAdminCourses,
  });

  if (coursesQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Fetching admin course inventory." title="Loading courses" tone="loading" />
      </Section>
    );
  }

  if (coursesQuery.isError) {
    if (coursesQuery.error instanceof ApiClientError && coursesQuery.error.statusCode === 401) {
      return (
        <Section>
          <AdminAuthRequired nextPath="/admin/courses" />
        </Section>
      );
    }

    if (coursesQuery.error instanceof ApiClientError && coursesQuery.error.statusCode === 403) {
      return (
        <Section>
          <AdminAccessDenied />
        </Section>
      );
    }

    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(coursesQuery.error, 'The admin course list could not be loaded.')}
          title="Courses unavailable"
          tone="error"
        />
      </Section>
    );
  }

  const courses = coursesQuery.data ?? [];

  return (
    <Section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]" href="/admin">
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Badge>Course management</Badge>
          <h1 className="headline text-5xl font-bold">Admin course inventory</h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
            Keep the learning catalog structured, published intentionally, and easy to evolve.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New course
          </Link>
        </Button>
      </div>

      {courses.length ? (
        <CoursesGrid courses={courses} />
      ) : (
        <EmptyState
          description="Create the first admin-managed course to extend the current learning path."
          icon={<GraduationCap className="h-6 w-6 text-[var(--color-accent)]" />}
          title="No admin courses yet"
        />
      )}
    </Section>
  );
};

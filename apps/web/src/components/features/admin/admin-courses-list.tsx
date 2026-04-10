'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, GraduationCap, PlusCircle, Search, SlidersHorizontal } from 'lucide-react';

import type { AdminCourseSummary } from '@devagentshub/types';
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
  Section,
} from '@devagentshub/ui';
import { formatDate } from '@devagentshub/utils';

import { fetchAdminCourses } from '../../../lib/admin-content';
import { ApiClientError, getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { StatusPanel } from '../../layout/status-panel';
import { AdminAccessDenied } from './admin-access-denied';
import { AdminAuthRequired } from './admin-auth-required';
import { PublicationBadge } from './admin-content-status';
import { AdminGate } from './admin-gate';

type PublicationFilter = 'all' | 'published' | 'draft';

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
            <PublicationBadge isPublished={course.isPublished} />
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
            ) : (
              <span className="rounded-full bg-[rgba(234,88,12,0.08)] px-3 py-2 text-xs font-semibold text-[var(--color-warm)]">
                Public course hidden while draft
              </span>
            )}
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
  const [searchTerm, setSearchTerm] = useState('');
  const [publicationFilter, setPublicationFilter] = useState<PublicationFilter>('all');

  const coursesQuery = useQuery({
    queryKey: queryKeys.adminCourses,
    queryFn: fetchAdminCourses,
  });

  const courses = coursesQuery.data ?? [];
  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        course.title.toLowerCase().includes(normalizedSearch) ||
        course.slug.toLowerCase().includes(normalizedSearch);
      const matchesPublication =
        publicationFilter === 'all' ||
        (publicationFilter === 'published' && course.isPublished) ||
        (publicationFilter === 'draft' && !course.isPublished);

      return matchesSearch && matchesPublication;
    });
  }, [courses, publicationFilter, searchTerm]);

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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-[var(--color-accent)]" />
              <Badge>Filters</Badge>
            </div>
            <CardTitle>Find courses faster</CardTitle>
            <CardDescription>
              Search by title or slug and separate draft courses from published learning paths.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-subtle)]" />
              <Input
                className="pl-11"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search title or slug..."
                value={searchTerm}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setPublicationFilter('all')}
                size="sm"
                variant={publicationFilter === 'all' ? 'default' : 'secondary'}
              >
                All
              </Button>
              <Button
                onClick={() => setPublicationFilter('published')}
                size="sm"
                variant={publicationFilter === 'published' ? 'default' : 'secondary'}
              >
                Published
              </Button>
              <Button
                onClick={() => setPublicationFilter('draft')}
                size="sm"
                variant={publicationFilter === 'draft' ? 'default' : 'secondary'}
              >
                Drafts
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {courses.length ? (
        filteredCourses.length ? (
          <CoursesGrid courses={filteredCourses} />
        ) : (
          <EmptyState
            description="No courses match the current search and publication filters."
            title="No matching courses"
          />
        )
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

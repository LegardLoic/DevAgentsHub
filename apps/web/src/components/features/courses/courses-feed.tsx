'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import type { CourseSummary } from '@devagentshub/types';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState } from '@devagentshub/ui';

import { apiFetch, getApiClientErrorMessage } from '../../../lib/api';
import { queryKeys } from '../../../lib/query-keys';
import { StatusPanel } from '../../layout/status-panel';

export const CoursesFeed = () => {
  const coursesQuery = useQuery({
    queryKey: queryKeys.courses,
    queryFn: () => apiFetch<CourseSummary[]>('/api/courses'),
  });

  if (coursesQuery.isLoading) {
    return <StatusPanel description="Fetching the published course list." title="Loading courses" tone="loading" />;
  }

  if (coursesQuery.isError) {
    return (
      <StatusPanel
        description={getApiClientErrorMessage(coursesQuery.error, 'The courses list could not be loaded from the API.')}
        title="Unable to load courses"
        tone="error"
      />
    );
  }

  if (!coursesQuery.data?.length) {
    return <EmptyState description="No courses are available yet." title="Nothing published" />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {coursesQuery.data.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <Badge>{course.lessonsCount} lessons</Badge>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm font-semibold text-[var(--color-accent)]" href={`/formations/${course.slug}`}>
              Open course
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

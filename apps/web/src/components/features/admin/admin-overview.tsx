'use client';

import Link from 'next/link';
import { ArrowRight, BookOpenText, GraduationCap, ShieldCheck } from 'lucide-react';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Section } from '@devagentshub/ui';

import { AdminGate } from './admin-gate';

export const AdminOverview = () => (
  <AdminGate nextPath="/admin">
    {(user) => {
      const displayName = user.profile?.displayName ?? user.email;

      return (
        <Section className="space-y-8">
          <div className="space-y-3">
            <Badge>Admin</Badge>
            <h1 className="headline text-5xl font-bold">Content operations for {displayName}</h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--color-subtle)]">
              Keep the editorial and learning slices up to date without touching seed files manually. This admin area
              stays intentionally minimal.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpenText className="h-5 w-5 text-[var(--color-accent)]" />
                  <Badge>Articles</Badge>
                </div>
                <CardTitle>Manage guides and editorial content</CardTitle>
                <CardDescription>
                  Create new guides, update seeded content, and publish or unpublish articles cleanly.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-[var(--color-subtle)]">Plain-text markdown editing</span>
                <Button asChild>
                  <Link href="/admin/articles">
                    Open articles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-[var(--color-accent)]" />
                  <Badge>Learning</Badge>
                </div>
                <CardTitle>Manage courses and lesson flow</CardTitle>
                <CardDescription>
                  Update course structure, adjust lesson ordering, and keep the learning catalog publishable.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-[var(--color-subtle)]">Numeric lesson ordering</span>
                <Button asChild>
                  <Link href="/admin/courses">
                    Open courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-dashed bg-[var(--color-surface)]/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[var(--color-accent)]" />
                <Badge>Access control</Badge>
              </div>
              <CardTitle>Admin-only by design</CardTitle>
              <CardDescription>
                This slice only exposes content management to authenticated administrator accounts. Public readers keep
                using the published guides and formations pages.
              </CardDescription>
            </CardHeader>
          </Card>
        </Section>
      );
    }}
  </AdminGate>
);

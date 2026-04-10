import { Suspense } from 'react';

import { Badge, Section } from '@devagentshub/ui';

import { AuthForm } from '@/src/components/features/auth/auth-form';
import { StatusPanel } from '@/src/components/layout/status-panel';

export default function RegisterPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-3 text-center">
        <Badge>Authentication</Badge>
        <h1 className="headline text-5xl font-bold">Create a local account for the full MVP flow</h1>
      </div>
      <Suspense
        fallback={
          <StatusPanel description="Preparing the authentication form." title="Loading registration" tone="loading" />
        }
      >
        <AuthForm mode="register" />
      </Suspense>
    </Section>
  );
}

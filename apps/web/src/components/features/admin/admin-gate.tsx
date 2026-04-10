'use client';

import type { ReactNode } from 'react';

import type { AuthUser } from '@devagentshub/types';
import { Section } from '@devagentshub/ui';

import { useCurrentUser } from '../../../hooks/use-auth';
import { getApiClientErrorMessage } from '../../../lib/api';
import { StatusPanel } from '../../layout/status-panel';
import { AdminAccessDenied } from './admin-access-denied';
import { AdminAuthRequired } from './admin-auth-required';

interface AdminGateProps {
  children: (user: AuthUser) => ReactNode;
  nextPath: string;
}

export const AdminGate = ({ children, nextPath }: AdminGateProps) => {
  const userQuery = useCurrentUser();

  if (userQuery.isLoading) {
    return (
      <Section>
        <StatusPanel description="Checking your authenticated session." title="Loading admin area" tone="loading" />
      </Section>
    );
  }

  if (userQuery.isError) {
    return (
      <Section>
        <StatusPanel
          description={getApiClientErrorMessage(userQuery.error, 'The admin area could not be loaded.')}
          title="Admin unavailable"
          tone="error"
        />
      </Section>
    );
  }

  if (!userQuery.data) {
    return (
      <Section>
        <AdminAuthRequired nextPath={nextPath} />
      </Section>
    );
  }

  if (userQuery.data.role !== 'ADMIN') {
    return (
      <Section>
        <AdminAccessDenied />
      </Section>
    );
  }

  return <>{children(userQuery.data)}</>;
};

'use client';

import { LogOut } from 'lucide-react';

import { Button } from '@devagentshub/ui';

import { useLogout } from '../../../hooks/use-auth';

export const LogoutButton = () => {
  const logoutMutation = useLogout();

  return (
    <Button onClick={() => logoutMutation.mutate()} variant="secondary">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
};


import type { ReactNode } from 'react';

import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  icon?: ReactNode;
}

export const EmptyState = ({ title, description, action, icon }: EmptyStateProps) => (
  <Card className="border-dashed bg-[var(--color-surface)]/70 text-center">
    <CardHeader>
      {icon ? <div className="mx-auto flex h-12 w-12 items-center justify-center">{icon}</div> : null}
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    {action ? (
      <CardContent className="pt-0">
        <Button onClick={action.onClick} variant="secondary">
          {action.label}
        </Button>
      </CardContent>
    ) : null}
  </Card>
);


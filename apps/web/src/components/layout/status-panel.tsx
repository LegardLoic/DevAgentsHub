import { AlertCircle, LoaderCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devagentshub/ui';

interface StatusPanelProps {
  title: string;
  description: string;
  tone?: 'loading' | 'error' | 'default';
}

export const StatusPanel = ({ title, description, tone = 'default' }: StatusPanelProps) => {
  const icon =
    tone === 'loading' ? (
      <LoaderCircle className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
    ) : tone === 'error' ? (
      <AlertCircle className="h-6 w-6 text-[var(--color-warm)]" />
    ) : (
      <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
    );

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="mt-1">{icon}</div>
        <div className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent />
    </Card>
  );
};


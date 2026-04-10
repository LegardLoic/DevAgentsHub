'use client';

import { useState } from 'react';

import { Button } from '@devagentshub/ui';

interface CopyActionButtonProps {
  content: string;
  defaultLabel: string;
}

export const CopyActionButton = ({ content, defaultLabel }: CopyActionButtonProps) => {
  const [label, setLabel] = useState(defaultLabel);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setLabel('Copied');
      window.setTimeout(() => setLabel(defaultLabel), 1800);
    } catch {
      setLabel('Copy failed');
      window.setTimeout(() => setLabel(defaultLabel), 1800);
    }
  };

  return (
    <Button className="w-full" onClick={handleCopy} size="sm" variant="secondary">
      {label}
    </Button>
  );
};

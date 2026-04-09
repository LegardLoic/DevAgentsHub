import React from 'react';
import { FileCode2, FolderTree } from 'lucide-react';

import type { ProjectTreeNode } from '@devagentshub/types';

interface ProjectTreePreviewProps {
  tree: ProjectTreeNode[];
  level?: number;
}

export const ProjectTreePreview = ({ tree, level = 0 }: ProjectTreePreviewProps) => (
  <ul className="space-y-2">
    {tree.map((node) => (
      <li key={`${level}-${node.name}`} style={{ paddingLeft: `${level * 16}px` }}>
        <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-surface)] px-3 py-2 text-sm">
          {node.type === 'directory' ? (
            <FolderTree className="h-4 w-4 text-[var(--color-accent)]" />
          ) : (
            <FileCode2 className="h-4 w-4 text-[var(--color-warm)]" />
          )}
          <span>{node.name}</span>
        </div>
        {node.children?.length ? <ProjectTreePreview level={level + 1} tree={node.children} /> : null}
      </li>
    ))}
  </ul>
);

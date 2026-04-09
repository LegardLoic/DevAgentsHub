import React from 'react';
import { render, screen } from '@testing-library/react';

import type { ProjectTreeNode } from '@devagentshub/types';

import { ProjectTreePreview } from './project-tree-preview';

describe('ProjectTreePreview', () => {
  it('renders nested folders and files', () => {
    const tree: ProjectTreeNode[] = [
      {
        name: 'apps',
        type: 'directory',
        children: [
          {
            name: 'web',
            type: 'directory',
            children: [{ name: 'page.tsx', type: 'file' }],
          },
        ],
      },
    ];

    render(<ProjectTreePreview tree={tree} />);

    expect(screen.getByText('apps')).toBeInTheDocument();
    expect(screen.getByText('web')).toBeInTheDocument();
    expect(screen.getByText('page.tsx')).toBeInTheDocument();
  });
});

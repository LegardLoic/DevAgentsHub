import type {
  DebugHelperInput,
  DebugHelperOutput,
  DetailLevel,
  ProjectStructureInput,
  ProjectStructureOutput,
  ProjectTreeNode,
  PromptGeneratorInput,
  PromptGeneratorOutput,
} from '@devagentshub/types';

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const excerpt = (content: string, maxLength = 160): string => {
  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength - 3).trimEnd()}...`;
};

export const formatDate = (value: Date | string, locale = 'en-US'): string =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

const detailLabels: Record<DetailLevel, string> = {
  concise: 'Keep the answer compact and execution-focused.',
  balanced: 'Provide enough detail to act confidently without unnecessary theory.',
  detailed: 'Explain tradeoffs, architecture, and step-by-step implementation details.',
};

export const generatePrompt = (input: PromptGeneratorInput): PromptGeneratorOutput => {
  const sections = [
    { label: 'Project Type', value: input.projectType },
    { label: 'Stack', value: input.stack },
    { label: 'Primary Goal', value: input.goal },
    {
      label: 'Constraints',
      value: input.constraints?.trim() || 'Respect production quality, strict typing, and clean architecture.',
    },
    { label: 'Response Style', value: detailLabels[input.detailLevel] },
  ];

  const prompt = [
    'You are a senior engineer working on a production-ready project.',
    `Project type: ${input.projectType}.`,
    `Stack: ${input.stack}.`,
    `Goal: ${input.goal}.`,
    `Constraints: ${input.constraints?.trim() || 'Keep the implementation maintainable, typed, and testable.'}.`,
    `Detail level: ${detailLabels[input.detailLevel]}`,
    'Return a structured solution with architecture notes, implementation steps, and verification guidance.',
  ].join('\n');

  return {
    title: `Structured ${input.projectType} prompt`,
    summary: 'A ready-to-use brief tailored for coding agents or senior collaborators.',
    prompt,
    sections,
  };
};

const createNode = (
  name: string,
  type: ProjectTreeNode['type'],
  children?: ProjectTreeNode[],
): ProjectTreeNode => ({
  name,
  type,
  children,
});

const applyOptionalBlocks = (
  tree: ProjectTreeNode[],
  input: Pick<ProjectStructureInput, 'includeDocker' | 'includeTesting'>,
): ProjectTreeNode[] => {
  const blocks = [...tree];

  if (input.includeTesting) {
    blocks.push(
      createNode('tests', 'directory', [
        createNode('README.md', 'file'),
        createNode('integration', 'directory', [createNode('example.test.ts', 'file')]),
      ]),
    );
  }

  if (input.includeDocker) {
    blocks.push(
      createNode('infra', 'directory', [
        createNode('docker', 'directory', [createNode('docker-compose.yml', 'file')]),
      ]),
    );
  }

  return blocks;
};

export const generateProjectStructure = (
  input: ProjectStructureInput,
): ProjectStructureOutput => {
  const templates: Record<ProjectStructureInput['template'], ProjectTreeNode[]> = {
    'react-next': [
      createNode('app', 'directory', [
        createNode('layout.tsx', 'file'),
        createNode('page.tsx', 'file'),
      ]),
      createNode('src', 'directory', [
        createNode('components', 'directory'),
        createNode('hooks', 'directory'),
        createNode('lib', 'directory'),
      ]),
      createNode('public', 'directory'),
    ],
    'node-express': [
      createNode('src', 'directory', [
        createNode('routes', 'directory'),
        createNode('controllers', 'directory'),
        createNode('services', 'directory'),
        createNode('repositories', 'directory'),
        createNode('server.ts', 'file'),
      ]),
      createNode('prisma', 'directory', [createNode('schema.prisma', 'file')]),
    ],
    'fullstack-monorepo': [
      createNode('apps', 'directory', [
        createNode('web', 'directory'),
        createNode('api', 'directory'),
      ]),
      createNode('packages', 'directory', [
        createNode('ui', 'directory'),
        createNode('types', 'directory'),
        createNode('validation', 'directory'),
      ]),
      createNode('docs', 'directory'),
    ],
    'game-dev-docs': [
      createNode('docs', 'directory', [
        createNode('concepts', 'directory'),
        createNode('systems', 'directory'),
        createNode('assets', 'directory'),
      ]),
      createNode('references', 'directory'),
      createNode('playtests', 'directory'),
    ],
  };

  const descriptionMap: Record<ProjectStructureInput['template'], string> = {
    'react-next': 'Opinionated frontend structure for a Next.js application.',
    'node-express': 'Layered backend structure for an Express API with Prisma.',
    'fullstack-monorepo': 'Workspace-first layout for scalable frontend and backend development.',
    'game-dev-docs': 'Documentation-focused layout for browser game planning and content production.',
  };

  return {
    template: input.template,
    projectName: slugify(input.projectName),
    description: descriptionMap[input.template],
    tree: applyOptionalBlocks(templates[input.template], input),
    notes: [
      'Keep feature logic grouped by domain before splitting further by technical layer.',
      input.includeTesting
        ? 'Add both unit and integration coverage early to protect refactors.'
        : 'Testing folders can be added later, but keep service boundaries testable.',
      input.includeDocker
        ? 'Docker support is included for consistent local infrastructure.'
        : 'Docker support can be added later if deployment parity becomes important.',
    ],
  };
};

const inferCauses = (errorMessage: string, codeSnippet: string): string[] => {
  const causes = new Set<string>();
  const loweredError = errorMessage.toLowerCase();
  const loweredCode = codeSnippet.toLowerCase();

  if (loweredError.includes('undefined') || loweredError.includes('null')) {
    causes.add('A value is being accessed before it is initialized or after it becomes nullish.');
  }

  if (loweredError.includes('type') || loweredError.includes('assignable')) {
    causes.add('The runtime or compile-time shape differs from the expected interface.');
  }

  if (loweredError.includes('fetch') || loweredError.includes('network')) {
    causes.add('The request path, credentials mode, or backend availability may be misconfigured.');
  }

  if (loweredCode.includes('async') || loweredCode.includes('await')) {
    causes.add('An async flow may be missing error handling or awaiting a promise chain inconsistently.');
  }

  if (causes.size === 0) {
    causes.add('The failure likely comes from a mismatch between assumptions in the code and actual runtime input.');
  }

  return [...causes];
};

export const generateDebugPlan = (input: DebugHelperInput): DebugHelperOutput => ({
  summary:
    'Start by narrowing the failing boundary, validating assumptions, and reproducing the issue with the smallest possible input.',
  possibleCauses: inferCauses(input.errorMessage, input.codeSnippet),
  resolutionSteps: [
    `Reproduce the issue using the provided context: ${input.technicalContext}.`,
    'Log or inspect the concrete values that flow into the failing line before changing code.',
    'Verify environment-dependent assumptions such as API URLs, auth state, and database records.',
    'Apply the smallest correction first, then rerun the exact scenario that originally failed.',
  ],
  debugChecklist: [
    'Confirm the stack trace points to the real origin instead of a downstream symptom.',
    'Check for nullish values, stale state, or incorrect async ordering.',
    'Compare the actual payload shape against the expected schema or type.',
    'Add a focused regression test once the fix is confirmed.',
  ],
});


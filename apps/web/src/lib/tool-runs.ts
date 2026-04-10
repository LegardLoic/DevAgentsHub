import type {
  DebugHelperInput,
  PromptGeneratorInput,
  ProjectStructureInput,
  SavedToolRunDetail,
  ToolSlug,
} from '@devagentshub/types';

type SearchParamsReader = {
  get: (key: string) => string | null;
};

const promptDetailLevels = new Set<PromptGeneratorInput['detailLevel']>(['concise', 'balanced', 'detailed']);
const projectTemplates = new Set<ProjectStructureInput['template']>([
  'react-next',
  'node-express',
  'fullstack-monorepo',
  'game-dev-docs',
]);

export const promptGeneratorDefaultValues: PromptGeneratorInput = {
  projectType: 'Production-ready fullstack platform',
  stack: 'Next.js, Express, Prisma, PostgreSQL',
  goal: 'Scaffold a maintainable MVP with tools, guides, learning, and community features.',
  constraints: 'Use strict typing, layered backend architecture, and local Docker-based PostgreSQL.',
  detailLevel: 'detailed',
};

export const projectStructureDefaultValues: ProjectStructureInput = {
  projectName: 'DevAgentsHub',
  template: 'fullstack-monorepo',
  includeTesting: true,
  includeDocker: true,
};

export const debugHelperDefaultValues: DebugHelperInput = {
  errorMessage: 'TypeError: Cannot read properties of undefined (reading "profile")',
  codeSnippet: "const displayName = data.user.profile.displayName;\nreturn <span>{displayName}</span>;",
  technicalContext:
    'Next.js frontend calling an authenticated API endpoint where the user can exist without a profile.',
};

const readText = (searchParams: SearchParamsReader, key: string, fallback: string): string =>
  searchParams.get(key)?.trim() || fallback;

const readBoolean = (searchParams: SearchParamsReader, key: string, fallback: boolean): boolean => {
  const value = searchParams.get(key);

  if (value === null) {
    return fallback;
  }

  return value === 'true';
};

export const getPromptGeneratorInitialValues = (
  searchParams: SearchParamsReader,
): PromptGeneratorInput => ({
  projectType: readText(searchParams, 'projectType', promptGeneratorDefaultValues.projectType),
  stack: readText(searchParams, 'stack', promptGeneratorDefaultValues.stack),
  goal: readText(searchParams, 'goal', promptGeneratorDefaultValues.goal),
  constraints: readText(searchParams, 'constraints', promptGeneratorDefaultValues.constraints ?? ''),
  detailLevel: promptDetailLevels.has(searchParams.get('detailLevel') as PromptGeneratorInput['detailLevel'])
    ? (searchParams.get('detailLevel') as PromptGeneratorInput['detailLevel'])
    : promptGeneratorDefaultValues.detailLevel,
});

export const getProjectStructureInitialValues = (
  searchParams: SearchParamsReader,
): ProjectStructureInput => ({
  projectName: readText(searchParams, 'projectName', projectStructureDefaultValues.projectName),
  template: projectTemplates.has(searchParams.get('template') as ProjectStructureInput['template'])
    ? (searchParams.get('template') as ProjectStructureInput['template'])
    : projectStructureDefaultValues.template,
  includeTesting: readBoolean(
    searchParams,
    'includeTesting',
    projectStructureDefaultValues.includeTesting,
  ),
  includeDocker: readBoolean(searchParams, 'includeDocker', projectStructureDefaultValues.includeDocker),
});

export const getDebugHelperInitialValues = (searchParams: SearchParamsReader): DebugHelperInput => ({
  errorMessage: readText(searchParams, 'errorMessage', debugHelperDefaultValues.errorMessage),
  codeSnippet: readText(searchParams, 'codeSnippet', debugHelperDefaultValues.codeSnippet),
  technicalContext: readText(searchParams, 'technicalContext', debugHelperDefaultValues.technicalContext),
});

export const getToolPath = (slug: ToolSlug): string => `/tools/${slug}`;

export const buildSavedRunReuseHref = (run: SavedToolRunDetail): string => {
  const searchParams = new URLSearchParams();

  switch (run.toolSlug) {
    case 'prompt-generator':
      searchParams.set('projectType', run.input.projectType);
      searchParams.set('stack', run.input.stack);
      searchParams.set('goal', run.input.goal);
      if (run.input.constraints) {
        searchParams.set('constraints', run.input.constraints);
      }
      searchParams.set('detailLevel', run.input.detailLevel);
      break;

    case 'project-structure-generator':
      searchParams.set('projectName', run.input.projectName);
      searchParams.set('template', run.input.template);
      searchParams.set('includeTesting', String(run.input.includeTesting));
      searchParams.set('includeDocker', String(run.input.includeDocker));
      break;

    case 'debug-helper':
      searchParams.set('errorMessage', run.input.errorMessage);
      searchParams.set('codeSnippet', run.input.codeSnippet);
      searchParams.set('technicalContext', run.input.technicalContext);
      break;
  }

  return `${getToolPath(run.toolSlug)}?${searchParams.toString()}`;
};

export const getSavedRunPrimaryCopyText = (run: SavedToolRunDetail): string => {
  switch (run.toolSlug) {
    case 'prompt-generator':
      return run.output.prompt;

    case 'project-structure-generator':
      return JSON.stringify(run.output, null, 2);

    case 'debug-helper':
      return [
        run.output.summary,
        '',
        'Possible causes:',
        ...run.output.possibleCauses.map((item) => `- ${item}`),
        '',
        'Resolution steps:',
        ...run.output.resolutionSteps.map((item) => `- ${item}`),
        '',
        'Debug checklist:',
        ...run.output.debugChecklist.map((item) => `- ${item}`),
      ].join('\n');
  }
};

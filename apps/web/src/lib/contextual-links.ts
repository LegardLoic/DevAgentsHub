import type { ToolSlug } from '@devagentshub/types';

export interface ContextualLink {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
}

type GuideSlug =
  | 'brief-coding-agents-clearly'
  | 'structure-ai-dev-projects-cleanly'
  | 'use-ai-agents-in-dev-workflow';

interface GuideReference {
  slug: GuideSlug;
  title: string;
  description: string;
}

const guideReferences: Record<GuideSlug, GuideReference> = {
  'brief-coding-agents-clearly': {
    slug: 'brief-coding-agents-clearly',
    title: 'Brief coding agents clearly',
    description:
      'Use explicit scope, constraints, and expected output so agent work starts with less ambiguity.',
  },
  'structure-ai-dev-projects-cleanly': {
    slug: 'structure-ai-dev-projects-cleanly',
    title: 'Structure AI-assisted projects cleanly',
    description:
      'Keep repository boundaries, tooling, and delivery rules readable before implementation expands.',
  },
  'use-ai-agents-in-dev-workflow': {
    slug: 'use-ai-agents-in-dev-workflow',
    title: 'Use AI agents in a practical workflow',
    description:
      'Connect prompting, implementation, review, and testing without skipping engineering judgment.',
  },
};

const guideLink = (
  slug: GuideSlug,
  eyebrow = 'Related guide',
  actionLabel = 'Read guide',
): ContextualLink => {
  const guide = guideReferences[slug];

  return {
    href: `/guides/${guide.slug}`,
    eyebrow,
    title: guide.title,
    description: guide.description,
    actionLabel,
  };
};

const guideContextualLinks: Record<GuideSlug, ContextualLink[]> = {
  'brief-coding-agents-clearly': [
    {
      href: '/tools/prompt-generator',
      eyebrow: 'Apply with a tool',
      title: 'Generate a sharper agent brief',
      description:
        'Turn the article framing into a structured prompt with stack, goal, constraints, and detail level.',
      actionLabel: 'Open prompt generator',
    },
    {
      href: '/formations/ai-agents-for-developers',
      eyebrow: 'Reinforce',
      title: 'Practice the agent workflow',
      description:
        'Use the learning path to turn briefing discipline into a repeatable delivery habit.',
      actionLabel: 'Open formation',
    },
    {
      href: '/community',
      eyebrow: 'Pressure-test',
      title: 'Compare briefing patterns',
      description:
        'Bring a prompt or workflow question to the community and refine it with feedback.',
      actionLabel: 'Open community',
    },
  ],
  'structure-ai-dev-projects-cleanly': [
    {
      href: '/tools/project-structure-generator',
      eyebrow: 'Apply with a tool',
      title: 'Generate a project tree',
      description:
        'Move from architecture principles to a concrete folder structure for a real project.',
      actionLabel: 'Open structure generator',
    },
    {
      href: '/formations/ai-agents-for-developers',
      eyebrow: 'Learn deeper',
      title: 'Connect structure to delivery',
      description:
        'Use the course lessons to keep generated structure aligned with reviewable work.',
      actionLabel: 'Open formation',
    },
    {
      href: '/tools/debug-helper',
      eyebrow: 'Stabilize',
      title: 'Debug implementation issues',
      description:
        'When structure meets runtime reality, convert errors into a focused investigation plan.',
      actionLabel: 'Open debug helper',
    },
  ],
  'use-ai-agents-in-dev-workflow': [
    {
      href: '/dashboard/templates',
      eyebrow: 'Reuse',
      title: 'Turn repeatable inputs into templates',
      description:
        'Save the prompts and tool inputs that support your workflow so they are ready for future work.',
      actionLabel: 'Open templates',
    },
    {
      href: '/tools',
      eyebrow: 'Execute',
      title: 'Run the next tool step',
      description:
        'Pick the prompt, structure, or debug flow that matches the next bottleneck in your project.',
      actionLabel: 'Open tools',
    },
    {
      href: '/community',
      eyebrow: 'Discuss',
      title: 'Share workflow tradeoffs',
      description:
        'Use the community board to compare review loops, prompt patterns, and delivery constraints.',
      actionLabel: 'Open community',
    },
  ],
};

const defaultGuideContextualLinks: ContextualLink[] = [
  {
    href: '/tools',
    eyebrow: 'Apply',
    title: 'Move from reading to execution',
    description:
      'Use the tool catalog to turn article context into a concrete prompt, structure, or debug plan.',
    actionLabel: 'Open tools',
  },
  {
    href: '/formations',
    eyebrow: 'Learn',
    title: 'Reinforce the same topic',
    description:
      'Continue through the learning path when a guide needs more practice and repetition.',
    actionLabel: 'Open formations',
  },
  {
    href: '/community',
    eyebrow: 'Discuss',
    title: 'Pressure-test the idea',
    description:
      'Bring the topic to the community when you want feedback or alternate implementation angles.',
    actionLabel: 'Open community',
  },
];

const toolContextualLinks: Record<ToolSlug, ContextualLink[]> = {
  'prompt-generator': [
    guideLink('brief-coding-agents-clearly', 'Read alongside'),
    {
      href: '/formations/ai-agents-for-developers',
      eyebrow: 'Practice',
      title: 'Make prompting repeatable',
      description:
        'Use the course to turn prompt generation into a stable implementation workflow.',
      actionLabel: 'Open formation',
    },
    {
      href: '/community',
      eyebrow: 'Discuss',
      title: 'Improve the prompt with feedback',
      description:
        'Share the generated brief or ask how others would constrain the same agent task.',
      actionLabel: 'Open community',
    },
  ],
  'project-structure-generator': [
    guideLink('structure-ai-dev-projects-cleanly', 'Read alongside'),
    {
      href: '/formations/ai-agents-for-developers',
      eyebrow: 'Practice',
      title: 'Connect structure to delivery',
      description:
        'Revisit the course when project layout decisions need stronger implementation discipline.',
      actionLabel: 'Open formation',
    },
    {
      href: '/tools/debug-helper',
      eyebrow: 'Next tool',
      title: 'Stabilize the implementation',
      description:
        'Once the structure exists, use the debug helper to diagnose errors without losing context.',
      actionLabel: 'Open debug helper',
    },
  ],
  'debug-helper': [
    guideLink('use-ai-agents-in-dev-workflow', 'Read alongside'),
    {
      href: '/community',
      eyebrow: 'Escalate',
      title: 'Ask for another debugging angle',
      description:
        'Turn the diagnosis into a community thread when the root cause still needs review.',
      actionLabel: 'Open community',
    },
    {
      href: '/dashboard/saved-runs',
      eyebrow: 'Review history',
      title: 'Compare with previous runs',
      description:
        'Look back at saved debugging plans to spot recurring failure modes across projects.',
      actionLabel: 'Open saved runs',
    },
  ],
};

export const getGuideContextualLinks = (slug: string): ContextualLink[] =>
  guideContextualLinks[slug as GuideSlug] ?? defaultGuideContextualLinks;

export const getRelatedGuideLinks = (currentSlug: string, limit = 2): ContextualLink[] =>
  Object.values(guideReferences)
    .filter((guide) => guide.slug !== currentSlug)
    .slice(0, limit)
    .map((guide) => guideLink(guide.slug));

export const getCourseContextualLinks = (courseSlug: string): ContextualLink[] =>
  courseSlug === 'ai-agents-for-developers'
    ? [
        guideLink('use-ai-agents-in-dev-workflow', 'Read alongside'),
        {
          href: '/tools/prompt-generator',
          eyebrow: 'Apply with a tool',
          title: 'Brief the next agent task',
          description:
            'Use the prompt generator to turn the course principles into a concrete working prompt.',
          actionLabel: 'Open prompt generator',
        },
        {
          href: '/community',
          eyebrow: 'Discuss',
          title: 'Compare learning takeaways',
          description:
            'Bring a lesson question or workflow decision to the community board for feedback.',
          actionLabel: 'Open community',
        },
      ]
    : defaultGuideContextualLinks;

export const getLessonContextualLinks = (courseSlug: string): ContextualLink[] =>
  getCourseContextualLinks(courseSlug);

export const getToolContextualLinks = (toolSlug: ToolSlug): ContextualLink[] =>
  toolContextualLinks[toolSlug];

export const dashboardContextualLinks: ContextualLink[] = [
  guideLink('brief-coding-agents-clearly', 'Read'),
  {
    href: '/tools/prompt-generator',
    eyebrow: 'Apply',
    title: 'Start a new agent brief',
    description:
      'Use a fresh prompt run when the next task needs sharper constraints before coding begins.',
    actionLabel: 'Open prompt generator',
  },
  {
    href: '/formations/ai-agents-for-developers',
    eyebrow: 'Reinforce',
    title: 'Continue the learning loop',
    description:
      'Use the course to connect saved work, templates, and bookmarks back to repeatable habits.',
    actionLabel: 'Open formation',
  },
];

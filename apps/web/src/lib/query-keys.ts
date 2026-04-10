export const queryKeys = {
  auth: ['auth', 'me'] as const,
  tools: ['tools'] as const,
  savedRuns: (userId: string) => ['me', 'tool-runs', userId] as const,
  savedRun: (userId: string, id: string) => ['me', 'tool-runs', userId, id] as const,
  articles: ['articles'] as const,
  article: (slug: string) => ['articles', slug] as const,
  courses: ['courses'] as const,
  course: (slug: string) => ['courses', slug] as const,
  lesson: (slug: string) => ['lessons', slug] as const,
  discussions: ['discussions'] as const,
  discussion: (slug: string) => ['discussions', slug] as const,
};

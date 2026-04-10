import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be shorter than 128 characters');

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name is required').max(80),
  email: z.string().trim().email('A valid email is required'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email('A valid email is required'),
  password: passwordSchema,
});

export const promptGeneratorSchema = z.object({
  projectType: z.string().trim().min(2, 'Project type is required').max(120),
  stack: z.string().trim().min(2, 'Stack is required').max(160),
  goal: z.string().trim().min(10, 'Goal must be at least 10 characters').max(800),
  constraints: z.string().trim().max(1000).optional().or(z.literal('')),
  detailLevel: z.enum(['concise', 'balanced', 'detailed']),
});

export const projectStructureSchema = z.object({
  projectName: z.string().trim().min(2, 'Project name is required').max(80),
  template: z.enum([
    'react-next',
    'node-express',
    'fullstack-monorepo',
    'game-dev-docs',
  ]),
  includeTesting: z.boolean(),
  includeDocker: z.boolean(),
});

export const debugHelperSchema = z.object({
  errorMessage: z.string().trim().min(8, 'Error message is required').max(2000),
  codeSnippet: z.string().trim().min(8, 'Code snippet is required').max(8000),
  technicalContext: z.string().trim().min(8, 'Context is required').max(1200),
});

export const discussionSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(140),
  content: z.string().trim().min(20, 'Content must be at least 20 characters').max(4000),
});

export const discussionReplySchema = z.object({
  content: z.string().trim().min(10, 'Reply must be at least 10 characters').max(2000),
});

export const lessonProgressSchema = z.object({
  completed: z.boolean(),
});

const contentSlugSchema = z
  .string()
  .trim()
  .min(2, 'Slug is required')
  .max(120, 'Slug must be shorter than 120 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, and hyphens only');

export const adminArticleSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(160),
  slug: contentSlugSchema,
  excerpt: z.string().trim().min(20, 'Excerpt must be at least 20 characters').max(400),
  content: z.string().trim().min(40, 'Content must be at least 40 characters').max(40000),
  isPublished: z.boolean(),
});

export const adminCourseSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(160),
  slug: contentSlugSchema,
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(1200),
  isPublished: z.boolean(),
});

export const adminLessonSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(160),
  slug: contentSlugSchema,
  excerpt: z.string().trim().min(20, 'Excerpt must be at least 20 characters').max(400),
  content: z.string().trim().min(40, 'Content must be at least 40 characters').max(40000),
  order: z.number().int().min(1, 'Order must be 1 or higher'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PromptGeneratorInput = z.infer<typeof promptGeneratorSchema>;
export type ProjectStructureInput = z.infer<typeof projectStructureSchema>;
export type DebugHelperInput = z.infer<typeof debugHelperSchema>;
export type DiscussionInput = z.infer<typeof discussionSchema>;
export type DiscussionReplyInput = z.infer<typeof discussionReplySchema>;
export type LessonProgressInput = z.infer<typeof lessonProgressSchema>;
export type AdminArticleInput = z.infer<typeof adminArticleSchema>;
export type AdminCourseInput = z.infer<typeof adminCourseSchema>;
export type AdminLessonInput = z.infer<typeof adminLessonSchema>;

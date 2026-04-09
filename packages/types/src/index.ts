export type UserRole = 'ADMIN' | 'USER';

export type ToolSlug =
  | 'prompt-generator'
  | 'project-structure-generator'
  | 'debug-helper';

export type ToolCategory = 'PROMPTING' | 'ARCHITECTURE' | 'DEBUGGING';

export type DetailLevel = 'concise' | 'balanced' | 'detailed';

export interface ProfileSummary {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  profile: ProfileSummary | null;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthPayload {
  displayName: string;
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
}

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
}

export interface ToolSummary {
  id: string;
  slug: ToolSlug;
  name: string;
  description: string;
  category: ToolCategory;
  isPublished: boolean;
}

export interface PromptGeneratorInput {
  projectType: string;
  stack: string;
  goal: string;
  constraints?: string;
  detailLevel: DetailLevel;
}

export interface PromptGeneratorOutput {
  title: string;
  summary: string;
  prompt: string;
  sections: Array<{
    label: string;
    value: string;
  }>;
}

export type ProjectTemplate =
  | 'react-next'
  | 'node-express'
  | 'fullstack-monorepo'
  | 'game-dev-docs';

export interface ProjectStructureInput {
  projectName: string;
  template: ProjectTemplate;
  includeTesting: boolean;
  includeDocker: boolean;
}

export interface ProjectTreeNode {
  name: string;
  type: 'file' | 'directory';
  children?: ProjectTreeNode[];
}

export interface ProjectStructureOutput {
  template: ProjectTemplate;
  projectName: string;
  description: string;
  tree: ProjectTreeNode[];
  notes: string[];
}

export interface DebugHelperInput {
  errorMessage: string;
  codeSnippet: string;
  technicalContext: string;
}

export interface DebugHelperOutput {
  summary: string;
  possibleCauses: string[];
  resolutionSteps: string[];
  debugChecklist: string[];
}

export interface ToolRunOutputMap {
  'prompt-generator': PromptGeneratorOutput;
  'project-structure-generator': ProjectStructureOutput;
  'debug-helper': DebugHelperOutput;
}

export interface ToolRun<TInput = unknown, TOutput = unknown> {
  id: string;
  toolId: string;
  userId: string | null;
  inputJson: TInput;
  outputJson: TOutput;
  createdAt: string;
}

export interface ToolRunResult<TOutput> {
  tool: ToolSummary;
  output: TOutput;
}

export interface ArticlePreview {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleDetail extends ArticlePreview {
  content: string;
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  order: number;
  excerpt: string;
  completed?: boolean;
  completedAt?: string | null;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  isPublished: boolean;
  lessonsCount: number;
}

export interface CourseDetail extends CourseSummary {
  lessons: LessonSummary[];
}

export interface LessonDetail {
  id: string;
  slug: string;
  title: string;
  order: number;
  content: string;
  course: Pick<CourseSummary, 'id' | 'slug' | 'title'>;
  progress?: {
    completed: boolean;
    completedAt: string | null;
  } | null;
}

export interface LessonProgressPayload {
  completed: boolean;
}

export interface LessonProgressResponse {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

export interface DiscussionReply {
  id: string;
  content: string;
  createdAt: string;
  author: AuthUser;
}

export interface DiscussionPreview {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  author: AuthUser;
  repliesCount: number;
}

export interface DiscussionDetail extends DiscussionPreview {
  replies: DiscussionReply[];
}

export interface CreateDiscussionPayload {
  title: string;
  content: string;
}

export interface CreateDiscussionReplyPayload {
  content: string;
}


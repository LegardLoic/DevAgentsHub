import type { SavedTemplateDetail } from '@devagentshub/types';
import type {
  CreateBookmarkInput,
  CreateTemplateInput,
  UpdateTemplateInput,
} from '@devagentshub/validation';
import { parseTemplateInput } from '@devagentshub/validation';

import { AppError } from '../utils/app-error';
import { articleRepository, type ArticleRepository } from '../repositories/article.repository';
import { bookmarkRepository, type BookmarkRepository } from '../repositories/bookmark.repository';
import { courseRepository, type CourseRepository } from '../repositories/course.repository';
import { templateRepository, type TemplateRepository } from '../repositories/template.repository';
import { toolRepository, type ToolRepository } from '../repositories/tool.repository';

const TEMPLATE_NAME_MAX_LENGTH = 120;

export class MeService {
  constructor(
    private readonly tools: ToolRepository = toolRepository,
    private readonly templates: TemplateRepository = templateRepository,
    private readonly bookmarks: BookmarkRepository = bookmarkRepository,
    private readonly articles: ArticleRepository = articleRepository,
    private readonly courses: CourseRepository = courseRepository,
  ) {}

  async listToolRuns(userId: string) {
    return this.tools.listRunsByUserId(userId);
  }

  async getToolRun(userId: string, id: string) {
    const run = await this.tools.findRunByIdForUser(userId, id);

    if (!run) {
      throw new AppError('The requested saved run could not be found.', 404, 'TOOL_RUN_NOT_FOUND');
    }

    return run;
  }

  async listTemplates(userId: string) {
    return this.templates.listByUserId(userId);
  }

  async getTemplate(userId: string, id: string) {
    const template = await this.templates.findByIdForUser(userId, id);

    if (!template) {
      throw new AppError('The requested template could not be found.', 404, 'TEMPLATE_NOT_FOUND');
    }

    return template;
  }

  async createTemplate(userId: string, input: CreateTemplateInput) {
    const tool = await this.tools.findRecordBySlug(input.toolSlug);

    if (!tool) {
      throw new AppError(
        'The selected tool is not supported for templates.',
        400,
        'INVALID_TOOL_SLUG',
      );
    }

    return this.templates.createForUser(userId, input);
  }

  async updateTemplate(userId: string, id: string, input: UpdateTemplateInput) {
    const existingTemplate = await this.templates.findByIdForUser(userId, id);

    if (!existingTemplate) {
      throw new AppError('The requested template could not be found.', 404, 'TEMPLATE_NOT_FOUND');
    }

    const nextInput =
      input.input !== undefined
        ? parseTemplateInput(existingTemplate.toolSlug, input.input)
        : undefined;

    const updatedTemplate = await this.templates.updateForUser(userId, id, {
      name: input.name,
      input: nextInput,
    });

    if (!updatedTemplate) {
      throw new AppError('The requested template could not be found.', 404, 'TEMPLATE_NOT_FOUND');
    }

    return updatedTemplate;
  }

  async duplicateTemplate(userId: string, id: string) {
    const existingTemplate = await this.templates.findByIdForUser(userId, id);

    if (!existingTemplate) {
      throw new AppError('The requested template could not be found.', 404, 'TEMPLATE_NOT_FOUND');
    }

    return this.templates.createForUser(
      userId,
      this.buildTemplateDuplicatePayload(existingTemplate),
    );
  }

  async listBookmarks(userId: string) {
    return this.bookmarks.listByUserId(userId);
  }

  async createBookmark(userId: string, input: CreateBookmarkInput) {
    if (input.targetType === 'article') {
      const article = await this.articles.findPublishedById(input.targetId);

      if (!article) {
        throw new AppError(
          'The article to bookmark could not be found.',
          404,
          'BOOKMARK_TARGET_NOT_FOUND',
        );
      }

      const existingBookmark = await this.bookmarks.findByTargetForUser(
        userId,
        'article',
        input.targetId,
      );

      if (existingBookmark) {
        throw new AppError('This article is already bookmarked.', 409, 'BOOKMARK_ALREADY_EXISTS');
      }

      return this.bookmarks.createArticleBookmark(userId, input.targetId);
    }

    const course = await this.courses.findPublishedById(input.targetId);

    if (!course) {
      throw new AppError(
        'The course to bookmark could not be found.',
        404,
        'BOOKMARK_TARGET_NOT_FOUND',
      );
    }

    const existingBookmark = await this.bookmarks.findByTargetForUser(
      userId,
      'course',
      input.targetId,
    );

    if (existingBookmark) {
      throw new AppError('This course is already bookmarked.', 409, 'BOOKMARK_ALREADY_EXISTS');
    }

    return this.bookmarks.createCourseBookmark(userId, input.targetId);
  }

  async deleteBookmark(userId: string, id: string) {
    const deleted = await this.bookmarks.deleteByIdForUser(userId, id);

    if (!deleted) {
      throw new AppError('The requested bookmark could not be found.', 404, 'BOOKMARK_NOT_FOUND');
    }

    return {
      success: true,
    };
  }

  private buildTemplateDuplicatePayload(template: SavedTemplateDetail): CreateTemplateInput {
    const name = buildDuplicateTemplateName(template.name);

    switch (template.toolSlug) {
      case 'prompt-generator':
        return {
          name,
          toolSlug: 'prompt-generator',
          input: template.input,
        };

      case 'project-structure-generator':
        return {
          name,
          toolSlug: 'project-structure-generator',
          input: template.input,
        };

      case 'debug-helper':
        return {
          name,
          toolSlug: 'debug-helper',
          input: template.input,
        };
    }
  }
}

export const meService = new MeService();

const buildDuplicateTemplateName = (name: string): string => {
  const suffix = ' copy';

  return `${name.slice(0, TEMPLATE_NAME_MAX_LENGTH - suffix.length)}${suffix}`;
};

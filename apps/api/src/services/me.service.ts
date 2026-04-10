import type { CreateTemplateInput, UpdateTemplateInput } from '@devagentshub/validation';
import { parseTemplateInput } from '@devagentshub/validation';

import { AppError } from '../utils/app-error';
import { templateRepository, type TemplateRepository } from '../repositories/template.repository';
import { toolRepository, type ToolRepository } from '../repositories/tool.repository';

export class MeService {
  constructor(
    private readonly tools: ToolRepository = toolRepository,
    private readonly templates: TemplateRepository = templateRepository,
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
      throw new AppError('The selected tool is not supported for templates.', 400, 'INVALID_TOOL_SLUG');
    }

    return this.templates.createForUser(userId, input);
  }

  async updateTemplate(userId: string, id: string, input: UpdateTemplateInput) {
    const existingTemplate = await this.templates.findByIdForUser(userId, id);

    if (!existingTemplate) {
      throw new AppError('The requested template could not be found.', 404, 'TEMPLATE_NOT_FOUND');
    }

    const nextInput =
      input.input !== undefined ? parseTemplateInput(existingTemplate.toolSlug, input.input) : undefined;

    const updatedTemplate = await this.templates.updateForUser(userId, id, {
      name: input.name,
      input: nextInput,
    });

    if (!updatedTemplate) {
      throw new AppError('The requested template could not be found.', 404, 'TEMPLATE_NOT_FOUND');
    }

    return updatedTemplate;
  }
}

export const meService = new MeService();

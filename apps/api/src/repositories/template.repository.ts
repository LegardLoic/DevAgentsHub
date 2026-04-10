import type { Prisma } from '@prisma/client';

import type {
  CreateTemplatePayload,
  SavedTemplateDetail,
  SavedTemplateSummary,
  ToolRunInputMap,
  ToolSlug,
  UpdateTemplatePayload,
} from '@devagentshub/types';
import { excerpt } from '@devagentshub/utils';

import { prisma } from '../lib/prisma';
import { serializeTool, toolSelect } from './tool.repository';

const templateInclude = {
  tool: {
    select: toolSelect,
  },
} satisfies Prisma.TemplateInclude;

type TemplateRecord = Prisma.TemplateGetPayload<{
  include: typeof templateInclude;
}>;

const buildTemplatePreview = (record: TemplateRecord): string => {
  switch (record.toolSlug as ToolSlug) {
    case 'prompt-generator': {
      const input = record.inputJson as unknown as ToolRunInputMap['prompt-generator'];

      return excerpt(`${input.projectType}. ${input.goal}`, 160);
    }

    case 'project-structure-generator': {
      const input = record.inputJson as unknown as ToolRunInputMap['project-structure-generator'];

      return excerpt(
        `${input.projectName} on ${input.template}. Testing: ${input.includeTesting ? 'yes' : 'no'}. Docker: ${input.includeDocker ? 'yes' : 'no'}.`,
        160,
      );
    }

    case 'debug-helper': {
      const input = record.inputJson as unknown as ToolRunInputMap['debug-helper'];

      return excerpt(`${input.errorMessage} ${input.technicalContext}`, 160);
    }

    default:
      return 'Reusable tool template';
  }
};

export const serializeSavedTemplateSummary = (
  record: TemplateRecord,
): SavedTemplateSummary => ({
  id: record.id,
  name: record.name,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
  toolSlug: record.toolSlug as ToolSlug,
  tool: serializeTool(record.tool),
  preview: buildTemplatePreview(record),
});

export const serializeSavedTemplateDetail = (
  record: TemplateRecord,
): SavedTemplateDetail => {
  const summary = serializeSavedTemplateSummary(record);

  switch (record.toolSlug as ToolSlug) {
    case 'prompt-generator':
      return {
        ...summary,
        toolSlug: 'prompt-generator',
        tool: {
          ...summary.tool,
          slug: 'prompt-generator',
        },
        input: record.inputJson as unknown as ToolRunInputMap['prompt-generator'],
      };

    case 'project-structure-generator':
      return {
        ...summary,
        toolSlug: 'project-structure-generator',
        tool: {
          ...summary.tool,
          slug: 'project-structure-generator',
        },
        input: record.inputJson as unknown as ToolRunInputMap['project-structure-generator'],
      };

    case 'debug-helper':
      return {
        ...summary,
        toolSlug: 'debug-helper',
        tool: {
          ...summary.tool,
          slug: 'debug-helper',
        },
        input: record.inputJson as unknown as ToolRunInputMap['debug-helper'],
      };
  }

  throw new Error(`Unsupported tool slug for template serialization: ${record.toolSlug}`);
};

type CreateTemplateData = CreateTemplatePayload;

type UpdateTemplateData = Pick<UpdateTemplatePayload, 'name'> & {
  input?: Prisma.InputJsonValue;
};

export class TemplateRepository {
  async listByUserId(userId: string): Promise<SavedTemplateSummary[]> {
    const templates = await prisma.template.findMany({
      where: {
        userId,
      },
      include: templateInclude,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return templates.map(serializeSavedTemplateSummary);
  }

  async findByIdForUser(userId: string, id: string): Promise<SavedTemplateDetail | null> {
    const template = await prisma.template.findFirst({
      where: {
        id,
        userId,
      },
      include: templateInclude,
    });

    if (!template) {
      return null;
    }

    return serializeSavedTemplateDetail(template);
  }

  async createForUser(userId: string, data: CreateTemplateData): Promise<SavedTemplateDetail> {
    const template = await prisma.template.create({
      data: {
        userId,
        name: data.name,
        toolSlug: data.toolSlug,
        inputJson: data.input as unknown as Prisma.InputJsonValue,
      },
      include: templateInclude,
    });

    return serializeSavedTemplateDetail(template);
  }

  async updateForUser(userId: string, id: string, data: UpdateTemplateData): Promise<SavedTemplateDetail | null> {
    const template = await prisma.template.findFirst({
      where: {
        id,
        userId,
      },
      include: templateInclude,
    });

    if (!template) {
      return null;
    }

    const updatedTemplate = await prisma.template.update({
      where: {
        id: template.id,
      },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.input !== undefined ? { inputJson: data.input } : {}),
      },
      include: templateInclude,
    });

    return serializeSavedTemplateDetail(updatedTemplate);
  }
}

export const templateRepository = new TemplateRepository();

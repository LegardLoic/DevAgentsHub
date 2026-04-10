import type { Prisma } from '@prisma/client';

import type {
  SavedToolRunDetail,
  SavedToolRunSummary,
  ToolRunInputMap,
  ToolRunOutputMap,
  ToolSlug,
  ToolSummary,
} from '@devagentshub/types';
import { excerpt } from '@devagentshub/utils';

import { prisma } from '../lib/prisma';

export const toolSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  category: true,
  isPublished: true,
} satisfies Prisma.ToolSelect;

export type ToolRecord = Prisma.ToolGetPayload<{
  select: typeof toolSelect;
}>;

const toolRunInclude = {
  tool: {
    select: toolSelect,
  },
} satisfies Prisma.ToolRunInclude;

type ToolRunRecord = Prisma.ToolRunGetPayload<{
  include: typeof toolRunInclude;
}>;

export const serializeTool = (tool: ToolRecord): ToolSummary => ({
  id: tool.id,
  slug: tool.slug as ToolSlug,
  name: tool.name,
  description: tool.description,
  category: tool.category,
  isPublished: tool.isPublished,
});

const buildSavedRunPreview = (run: ToolRunRecord): string => {
  switch (run.tool.slug as ToolSlug) {
    case 'prompt-generator': {
      const output = run.outputJson as unknown as ToolRunOutputMap['prompt-generator'];

      return excerpt(output.prompt, 160);
    }

    case 'project-structure-generator': {
      const output = run.outputJson as unknown as ToolRunOutputMap['project-structure-generator'];
      const input = run.inputJson as unknown as ToolRunInputMap['project-structure-generator'];

      return excerpt(`${output.description} Template: ${input.template}.`, 160);
    }

    case 'debug-helper': {
      const output = run.outputJson as unknown as ToolRunOutputMap['debug-helper'];

      return excerpt(output.summary, 160);
    }

    default:
      return 'Saved tool run';
  }
};

export const serializeSavedToolRunSummary = (run: ToolRunRecord): SavedToolRunSummary => ({
  id: run.id,
  createdAt: run.createdAt.toISOString(),
  toolSlug: run.tool.slug as ToolSlug,
  tool: serializeTool(run.tool),
  preview: buildSavedRunPreview(run),
});

export const serializeSavedToolRunDetail = (run: ToolRunRecord): SavedToolRunDetail => {
  const summary = serializeSavedToolRunSummary(run);

  switch (run.tool.slug as ToolSlug) {
    case 'prompt-generator':
      return {
        ...summary,
        toolSlug: 'prompt-generator',
        tool: {
          ...summary.tool,
          slug: 'prompt-generator',
        },
        input: run.inputJson as unknown as ToolRunInputMap['prompt-generator'],
        output: run.outputJson as unknown as ToolRunOutputMap['prompt-generator'],
      };

    case 'project-structure-generator':
      return {
        ...summary,
        toolSlug: 'project-structure-generator',
        tool: {
          ...summary.tool,
          slug: 'project-structure-generator',
        },
        input: run.inputJson as unknown as ToolRunInputMap['project-structure-generator'],
        output: run.outputJson as unknown as ToolRunOutputMap['project-structure-generator'],
      };

    case 'debug-helper':
      return {
        ...summary,
        toolSlug: 'debug-helper',
        tool: {
          ...summary.tool,
          slug: 'debug-helper',
        },
        input: run.inputJson as unknown as ToolRunInputMap['debug-helper'],
        output: run.outputJson as unknown as ToolRunOutputMap['debug-helper'],
      };
  }

  throw new Error(`Unsupported tool slug for saved run serialization: ${run.tool.slug}`);
};

export class ToolRepository {
  async listPublished(): Promise<ToolSummary[]> {
    const tools = await prisma.tool.findMany({
      where: { isPublished: true },
      select: toolSelect,
      orderBy: { name: 'asc' },
    });

    return tools.map(serializeTool);
  }

  async findRecordBySlug(slug: string): Promise<ToolRecord | null> {
    return prisma.tool.findUnique({
      where: { slug },
      select: toolSelect,
    });
  }

  async findPublishedRecordBySlug(slug: string): Promise<ToolRecord | null> {
    return prisma.tool.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      select: toolSelect,
    });
  }

  async createRun(
    toolId: string,
    userId: string | null,
    inputJson: Prisma.InputJsonValue,
    outputJson: Prisma.InputJsonValue,
  ): Promise<void> {
    await prisma.toolRun.create({
      data: {
        toolId,
        userId,
        inputJson,
        outputJson,
      },
    });
  }

  async listRunsByUserId(userId: string): Promise<SavedToolRunSummary[]> {
    const runs = await prisma.toolRun.findMany({
      where: {
        userId,
      },
      include: toolRunInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return runs.map(serializeSavedToolRunSummary);
  }

  async findRunByIdForUser(userId: string, id: string): Promise<SavedToolRunDetail | null> {
    const run = await prisma.toolRun.findFirst({
      where: {
        id,
        userId,
      },
      include: toolRunInclude,
    });

    if (!run) {
      return null;
    }

    return serializeSavedToolRunDetail(run);
  }
}

export const toolRepository = new ToolRepository();

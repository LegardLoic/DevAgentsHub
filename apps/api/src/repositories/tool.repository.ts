import type { Prisma } from '@prisma/client';

import type { ToolSummary, ToolSlug } from '@devagentshub/types';

import { prisma } from '../lib/prisma';

const toolSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  category: true,
  isPublished: true,
} satisfies Prisma.ToolSelect;

type ToolRecord = Prisma.ToolGetPayload<{
  select: typeof toolSelect;
}>;

export const serializeTool = (tool: ToolRecord): ToolSummary => ({
  id: tool.id,
  slug: tool.slug as ToolSlug,
  name: tool.name,
  description: tool.description,
  category: tool.category,
  isPublished: tool.isPublished,
});

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
}

export const toolRepository = new ToolRepository();


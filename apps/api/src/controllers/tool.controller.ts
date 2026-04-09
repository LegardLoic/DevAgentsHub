import type { ToolSlug } from '@devagentshub/types';

import { asyncHandler } from '../utils/async-handler';
import { toolService, type ToolService } from '../services/tool.service';

export class ToolController {
  constructor(private readonly tools: ToolService = toolService) {}

  list = asyncHandler(async (_req, res) => {
    const items = await this.tools.listTools();

    res.status(200).json({
      data: items,
    });
  });

  getBySlug = asyncHandler(async (req, res) => {
    const item = await this.tools.getTool(req.params.slug as ToolSlug);

    res.status(200).json({
      data: item,
    });
  });

  runPromptGenerator = asyncHandler(async (req, res) => {
    const result = await this.tools.runPromptGenerator(req.body, req.authUser?.id ?? null);

    res.status(200).json({
      data: result,
    });
  });

  runProjectStructureGenerator = asyncHandler(async (req, res) => {
    const result = await this.tools.runProjectStructureGenerator(
      req.body,
      req.authUser?.id ?? null,
    );

    res.status(200).json({
      data: result,
    });
  });

  runDebugHelper = asyncHandler(async (req, res) => {
    const result = await this.tools.runDebugHelper(req.body, req.authUser?.id ?? null);

    res.status(200).json({
      data: result,
    });
  });
}

export const toolController = new ToolController();


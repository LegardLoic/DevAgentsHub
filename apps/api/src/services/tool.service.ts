import type {
  DebugHelperOutput,
  ToolRunResult,
  ToolRunOutputMap,
  ToolSlug,
} from '@devagentshub/types';
import type {
  DebugHelperInput,
  ProjectStructureInput,
  PromptGeneratorInput,
} from '@devagentshub/validation';

import { generateDebugPlan, generateProjectStructure, generatePrompt } from '@devagentshub/utils';

import { AppError } from '../utils/app-error';
import { serializeTool, toolRepository, type ToolRepository } from '../repositories/tool.repository';

export class ToolService {
  constructor(private readonly tools: ToolRepository = toolRepository) {}

  async listTools() {
    return this.tools.listPublished();
  }

  async getTool(slug: ToolSlug) {
    const tool = await this.tools.findPublishedRecordBySlug(slug);

    if (!tool) {
      throw new AppError('The requested tool could not be found.', 404, 'TOOL_NOT_FOUND');
    }

    return serializeTool(tool);
  }

  private async runTool<TInput, TOutput extends ToolRunOutputMap[ToolSlug]>(
    slug: ToolSlug,
    input: TInput,
    userId: string | null,
    executor: (value: TInput) => TOutput,
  ): Promise<ToolRunResult<TOutput>> {
    const tool = await this.tools.findPublishedRecordBySlug(slug);

    if (!tool) {
      throw new AppError('The requested tool could not be found.', 404, 'TOOL_NOT_FOUND');
    }

    const output = executor(input);

    await this.tools.createRun(tool.id, userId, input as never, output as never);

    return {
      tool: serializeTool(tool),
      output,
    };
  }

  runPromptGenerator(input: PromptGeneratorInput, userId: string | null) {
    return this.runTool('prompt-generator', input, userId, generatePrompt);
  }

  runProjectStructureGenerator(input: ProjectStructureInput, userId: string | null) {
    return this.runTool('project-structure-generator', input, userId, generateProjectStructure);
  }

  runDebugHelper(input: DebugHelperInput, userId: string | null): Promise<ToolRunResult<DebugHelperOutput>> {
    return this.runTool('debug-helper', input, userId, generateDebugPlan);
  }
}

export const toolService = new ToolService();


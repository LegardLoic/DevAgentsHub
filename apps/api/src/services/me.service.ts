import { AppError } from '../utils/app-error';
import { toolRepository, type ToolRepository } from '../repositories/tool.repository';

export class MeService {
  constructor(private readonly tools: ToolRepository = toolRepository) {}

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
}

export const meService = new MeService();

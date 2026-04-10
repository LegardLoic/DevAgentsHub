import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/app-error';
import { meService, type MeService } from '../services/me.service';

export class MeController {
  constructor(private readonly me: MeService = meService) {}

  listToolRuns = asyncHandler(async (req, res) => {
    if (!req.authUser) {
      throw new AppError('Authentication is required for this action.', 401, 'UNAUTHORIZED');
    }

    const runs = await this.me.listToolRuns(req.authUser.id);

    res.status(200).json({
      data: runs,
    });
  });

  getToolRun = asyncHandler(async (req, res) => {
    if (!req.authUser) {
      throw new AppError('Authentication is required for this action.', 401, 'UNAUTHORIZED');
    }

    const run = await this.me.getToolRun(req.authUser.id, req.params.id as string);

    res.status(200).json({
      data: run,
    });
  });
}

export const meController = new MeController();

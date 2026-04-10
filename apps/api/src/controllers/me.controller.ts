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

  listTemplates = asyncHandler(async (req, res) => {
    if (!req.authUser) {
      throw new AppError('Authentication is required for this action.', 401, 'UNAUTHORIZED');
    }

    const templates = await this.me.listTemplates(req.authUser.id);

    res.status(200).json({
      data: templates,
    });
  });

  getTemplate = asyncHandler(async (req, res) => {
    if (!req.authUser) {
      throw new AppError('Authentication is required for this action.', 401, 'UNAUTHORIZED');
    }

    const template = await this.me.getTemplate(req.authUser.id, req.params.id as string);

    res.status(200).json({
      data: template,
    });
  });

  createTemplate = asyncHandler(async (req, res) => {
    if (!req.authUser) {
      throw new AppError('Authentication is required for this action.', 401, 'UNAUTHORIZED');
    }

    const template = await this.me.createTemplate(req.authUser.id, req.body);

    res.status(201).json({
      data: template,
    });
  });

  updateTemplate = asyncHandler(async (req, res) => {
    if (!req.authUser) {
      throw new AppError('Authentication is required for this action.', 401, 'UNAUTHORIZED');
    }

    const template = await this.me.updateTemplate(req.authUser.id, req.params.id as string, req.body);

    res.status(200).json({
      data: template,
    });
  });
}

export const meController = new MeController();

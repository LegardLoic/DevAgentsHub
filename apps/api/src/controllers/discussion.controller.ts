import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/app-error';
import { discussionService, type DiscussionService } from '../services/discussion.service';

export class DiscussionController {
  constructor(private readonly discussions: DiscussionService = discussionService) {}

  list = asyncHandler(async (_req, res) => {
    const items = await this.discussions.listDiscussions();

    res.status(200).json({
      data: items,
    });
  });

  getBySlug = asyncHandler(async (req, res) => {
    const discussion = await this.discussions.getDiscussion(req.params.slug as string);

    res.status(200).json({
      data: discussion,
    });
  });

  create = asyncHandler(async (req, res) => {
    if (!req.authUser) {
      throw new AppError('Authentication is required for this action.', 401, 'UNAUTHORIZED');
    }

    const discussion = await this.discussions.createDiscussion(req.authUser.id, req.body);

    res.status(201).json({
      data: discussion,
    });
  });

  reply = asyncHandler(async (req, res) => {
    if (!req.authUser) {
      throw new AppError('Authentication is required for this action.', 401, 'UNAUTHORIZED');
    }

    const reply = await this.discussions.createReply(req.authUser.id, req.params.id as string, req.body);

    res.status(201).json({
      data: reply,
    });
  });
}

export const discussionController = new DiscussionController();

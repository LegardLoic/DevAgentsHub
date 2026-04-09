import type { DiscussionInput, DiscussionReplyInput } from '@devagentshub/validation';

import { slugify } from '@devagentshub/utils';

import { AppError } from '../utils/app-error';
import { sanitizePlainText } from '../utils/sanitize';
import { discussionRepository, type DiscussionRepository } from '../repositories/discussion.repository';

export class DiscussionService {
  constructor(private readonly discussions: DiscussionRepository = discussionRepository) {}

  async listDiscussions() {
    return this.discussions.listAll();
  }

  async getDiscussion(slug: string) {
    const discussion = await this.discussions.findBySlug(slug);

    if (!discussion) {
      throw new AppError('The requested discussion could not be found.', 404, 'DISCUSSION_NOT_FOUND');
    }

    return discussion;
  }

  private async buildUniqueSlug(title: string): Promise<string> {
    const baseSlug = slugify(title);
    let candidate = baseSlug;
    let index = 1;

    while (await this.discussions.findBySlug(candidate)) {
      candidate = `${baseSlug}-${index}`;
      index += 1;
    }

    return candidate;
  }

  async createDiscussion(userId: string, input: DiscussionInput) {
    const title = sanitizePlainText(input.title);
    const content = sanitizePlainText(input.content);

    if (title.length < 5 || content.length < 20) {
      throw new AppError(
        'The sanitized discussion content is too short.',
        400,
        'INVALID_DISCUSSION_CONTENT',
      );
    }

    const slug = await this.buildUniqueSlug(title);

    return this.discussions.createDiscussion({
      userId,
      slug,
      title,
      content,
    });
  }

  async createReply(userId: string, discussionId: string, input: DiscussionReplyInput) {
    const discussion = await this.discussions.findRecordById(discussionId);

    if (!discussion) {
      throw new AppError('The requested discussion could not be found.', 404, 'DISCUSSION_NOT_FOUND');
    }

    const content = sanitizePlainText(input.content);

    if (content.length < 10) {
      throw new AppError('The sanitized reply content is too short.', 400, 'INVALID_REPLY_CONTENT');
    }

    return this.discussions.createReply({
      discussionId,
      userId,
      content,
    });
  }
}

export const discussionService = new DiscussionService();


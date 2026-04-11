import type { ArticleDetail, CourseDetail } from '@devagentshub/types';

import {
  analyticsRepository,
  productEventTypes,
  type AnalyticsRepository,
} from '../repositories/analytics.repository';

export class AnalyticsService {
  constructor(private readonly analytics: AnalyticsRepository = analyticsRepository) {}

  getOverview() {
    return this.analytics.getOverview();
  }

  async trackArticleView(article: ArticleDetail, userId?: string | null): Promise<void> {
    await this.trackSafely({
      eventType: productEventTypes.articleViewed,
      userId,
      entityType: 'article',
      entityId: article.id,
      metadata: {
        slug: article.slug,
        title: article.title,
      },
    });
  }

  async trackCourseView(course: CourseDetail, userId?: string | null): Promise<void> {
    await this.trackSafely({
      eventType: productEventTypes.courseViewed,
      userId,
      entityType: 'course',
      entityId: course.id,
      metadata: {
        slug: course.slug,
        title: course.title,
      },
    });
  }

  async trackTemplateDuplicated(input: {
    templateId: string;
    toolSlug: string;
    userId: string;
  }): Promise<void> {
    await this.trackSafely({
      eventType: productEventTypes.templateDuplicated,
      userId: input.userId,
      entityType: 'template',
      entityId: input.templateId,
      metadata: {
        toolSlug: input.toolSlug,
      },
    });
  }

  private async trackSafely(input: Parameters<AnalyticsRepository['createEvent']>[0]) {
    try {
      await this.analytics.createEvent(input);
    } catch {
      // Analytics should never block user-facing product flows.
    }
  }
}

export const analyticsService = new AnalyticsService();

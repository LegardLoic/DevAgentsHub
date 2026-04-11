import { asyncHandler } from '../utils/async-handler';
import { analyticsService, type AnalyticsService } from '../services/analytics.service';

export class AdminAnalyticsController {
  constructor(private readonly analytics: AnalyticsService = analyticsService) {}

  overview = asyncHandler(async (_req, res) => {
    const overview = await this.analytics.getOverview();

    res.status(200).json({
      data: overview,
    });
  });
}

export const adminAnalyticsController = new AdminAnalyticsController();

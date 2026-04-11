import type { AnalyticsOverview } from '@devagentshub/types';

import { apiFetch } from './api';

export const fetchAdminAnalyticsOverview = () =>
  apiFetch<AnalyticsOverview>('/api/admin/analytics/overview');

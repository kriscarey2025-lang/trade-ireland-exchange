import { usePageTimeTracking } from '@/hooks/useEngagementTracking';

export const EngagementTracker = () => {
  usePageTimeTracking();
  return null;
};

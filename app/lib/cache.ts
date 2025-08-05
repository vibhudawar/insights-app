import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Cache utility functions for revalidating cached data
 */

export const CACHE_TAGS = {
  BOARDS: 'boards',
  BOARD_DETAILS: 'board-details',
  FEATURE_REQUESTS: 'feature-requests',
  DASHBOARD_STATS: 'dashboard-stats',
  USER_BOARDS: 'user-boards',
  COMMENTS: 'comments',
} as const;

/**
 * Revalidate board-related cache when board data changes
 */
export function revalidateBoard(slug: string, userId?: string) {
  // Revalidate specific board pages
  revalidatePath(`/b/${slug}`);
  revalidatePath(`/dashboard/boards/${slug}`);
  revalidatePath(`/dashboard/boards/${slug}/edit`);
  revalidatePath(`/dashboard/boards/${slug}/analytics`);
  
  // Revalidate API routes
  revalidateTag(`${CACHE_TAGS.BOARD_DETAILS}-${slug}`);
  revalidateTag(`${CACHE_TAGS.FEATURE_REQUESTS}-${slug}`);
  
  // Revalidate user's board list if userId provided
  if (userId) {
    revalidateTag(`${CACHE_TAGS.USER_BOARDS}-${userId}`);
    revalidatePath('/dashboard/boards');
  }
}

/**
 * Revalidate feature request related cache when requests change
 */
export function revalidateFeatureRequests(slug: string, userId?: string) {
  // Revalidate board pages that show feature requests
  revalidatePath(`/b/${slug}`);
  revalidatePath(`/dashboard/boards/${slug}`);
  revalidatePath(`/dashboard/boards/${slug}/analytics`);
  
  // Revalidate API routes
  revalidateTag(`${CACHE_TAGS.FEATURE_REQUESTS}-${slug}`);
  
  // Revalidate dashboard stats if userId provided
  if (userId) {
    revalidateTag(`${CACHE_TAGS.DASHBOARD_STATS}-${userId}`);
    revalidatePath('/dashboard');
  }
}

/**
 * Revalidate comments cache when comments change
 */
export function revalidateComments(featureRequestId: string, slug?: string, userId?: string) {
  // Revalidate comments for specific feature request
  revalidateTag(`comments-${featureRequestId}`);
  
  // Also revalidate feature requests since comment count changed
  if (slug) {
    revalidateFeatureRequests(slug, userId);
  }
}

/**
 * Revalidate dashboard stats when board or request data changes
 */
export function revalidateDashboardStats(userId: string) {
  revalidateTag(`${CACHE_TAGS.DASHBOARD_STATS}-${userId}`);
  revalidatePath('/dashboard');
}

/**
 * Revalidate all user-related cache
 */
export function revalidateUserCache(userId: string) {
  revalidateTag(`${CACHE_TAGS.USER_BOARDS}-${userId}`);
  revalidateTag(`${CACHE_TAGS.DASHBOARD_STATS}-${userId}`);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/boards');
}
import {unstable_cache} from "next/cache";
import {prisma} from "@/lib/prisma";
import {CACHE_TAGS} from "./cache";
import {RequestStatus} from "@/types";

/**
 * Cached database queries using Next.js unstable_cache
 * These provide server-side caching for expensive database operations
 */

/**
 * Get board details with caching
 */
export const getCachedBoardBySlug = (slug: string) =>
 unstable_cache(
  async () => {
   return prisma.board.findUnique({
    where: {slug},
    select: {
     id: true,
     title: true,
     description: true,
     slug: true,
     theme_config: true,
     is_public: true,
     created_at: true,
     creator_id: true,
     creator: {
      select: {
       id: true,
       name: true,
       email: true,
       image: true,
      },
     },
     _count: {
      select: {
       feature_requests: true,
      },
     },
    },
   });
  },
  [`board-by-slug-${slug}`],
  {
   tags: [`${CACHE_TAGS.BOARD_DETAILS}-${slug}`],
   revalidate: 300, // 5 minutes
  }
 )();

/**
 * Get user's boards with caching
 */
export const getCachedUserBoards = (userId: string, limit?: number) =>
 unstable_cache(
  async () => {
   return prisma.board.findMany({
    where: {
     creator_id: userId,
    },
    include: {
     creator: {
      select: {
       id: true,
       name: true,
       email: true,
       image: true,
      },
     },
     feature_requests: {
      select: {
       id: true,
       title: true,
       status: true,
       upvote_count: true,
       comment_count: true,
       created_at: true,
      },
     },
    },
    orderBy: {
     updated_at: "desc",
    },
    take: limit,
   });
  },
  [`user-boards-${userId}-${limit || "all"}`],
  {
   tags: [`${CACHE_TAGS.USER_BOARDS}-${userId}`],
   revalidate: 60, // 1 minute
  }
 )();

/**
 * Get dashboard stats with caching
 */
export const getCachedDashboardStats = (userId: string) =>
 unstable_cache(
  async () => {
   const thirtyDaysAgo = new Date();
   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

   const statsResult = await prisma.$queryRaw<
    Array<{
     total_boards: bigint;
     total_requests: bigint;
     total_upvotes: bigint;
     active_boards: bigint;
    }>
   >`
        SELECT 
          COUNT(DISTINCT b.id) as total_boards,
          COUNT(fr.id) as total_requests,
          COALESCE(SUM(fr.upvote_count), 0) as total_upvotes,
          COUNT(DISTINCT CASE WHEN fr.created_at > ${thirtyDaysAgo} THEN b.id END) as active_boards
        FROM boards b
        LEFT JOIN feature_requests fr ON b.id = fr.board_id
        WHERE b.creator_id = ${userId}
      `;

   const result = statsResult[0];
   return {
    totalBoards: Number(result.total_boards),
    totalRequests: Number(result.total_requests),
    totalUpvotes: Number(result.total_upvotes),
    activeBoards: Number(result.active_boards),
   };
  },
  [`dashboard-stats-${userId}`],
  {
   tags: [`${CACHE_TAGS.DASHBOARD_STATS}-${userId}`],
   revalidate: 300, // 5 minutes
  }
 )();

/**
 * Get feature requests for a board with caching
 */
export const getCachedFeatureRequests = (
 boardId: string,
 filters: {
  status?: string;
  search?: string;
  sortBy?: string;
 } = {}
) =>
 unstable_cache(
  async () => {
   const {status, search, sortBy = "upvotes"} = filters;

   // Build where clause for filtering
   const whereClause: {
    board_id: string;
    status?: RequestStatus;
    OR?: Array<{
     title?: {contains: string; mode: "insensitive"};
     description?: {contains: string; mode: "insensitive"};
    }>;
   } = {
    board_id: boardId,
   };

   if (status && status !== "ALL") {
    whereClause.status = status as RequestStatus;
   }

   if (search) {
    whereClause.OR = [
     {title: {contains: search, mode: "insensitive"}},
     {description: {contains: search, mode: "insensitive"}},
    ];
   }

   // Build orderBy clause
   let orderBy: {created_at?: "desc" | "asc"; upvote_count?: "desc"} = {};
   switch (sortBy) {
    case "newest":
     orderBy = {created_at: "desc"};
     break;
    case "oldest":
     orderBy = {created_at: "asc"};
     break;
    case "upvotes":
    default:
     orderBy = {upvote_count: "desc"};
     break;
   }

   return prisma.featureRequest.findMany({
    where: whereClause,
    include: {
     upvotes: {
      select: {
       user_id: true,
      },
     },
     _count: {
      select: {
       upvotes: true,
       comments: true,
      },
     },
    },
    orderBy,
   });
  },
  [`feature-requests-${boardId}-${JSON.stringify(filters)}`],
  {
   tags: [`${CACHE_TAGS.FEATURE_REQUESTS}-${boardId}`],
   revalidate: 30, // 30 seconds
  }
 )();

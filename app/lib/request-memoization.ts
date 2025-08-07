import {cache} from "react";
import {prisma} from "@/lib/prisma";

/**
 * Request-scoped memoized functions using React's cache()
 * These prevent duplicate database calls within the same request
 */

/**
 * Memoized session check to prevent multiple auth lookups
 */
export const memoizedGetServerSession = cache(async (authOptions: unknown) => {
 const {getServerSession} = await import("next-auth/next");
 return getServerSession(authOptions);
});

/**
 * Memoized board lookup by slug
 */
export const memoizedFindBoardBySlug = cache(async (slug: string) => {
 return prisma.board.findUnique({
  where: {slug},
  include: {
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
});

/**
 * Memoized board lookup by slug with specific selection
 */
export const memoizedFindBoardBySlugMinimal = cache(async (slug: string) => {
 return prisma.board.findUnique({
  where: {slug},
  select: {
   id: true,
   slug: true,
   creator_id: true,
   is_public: true,
  },
 });
});

/**
 * Memoized feature request lookup
 */
export const memoizedFindFeatureRequest = cache(async (id: string) => {
 return prisma.featureRequest.findUnique({
  where: {id},
  include: {
   board: {
    select: {
     slug: true,
     creator_id: true,
     is_public: true,
    },
   },
  },
 });
});

/**
 * Memoized user lookup
 */
export const memoizedFindUser = cache(async (id: string) => {
 return prisma.user.findUnique({
  where: {id},
  select: {
   id: true,
   name: true,
   email: true,
   image: true,
   account_tier: true,
  },
 });
});

/**
 * Memoized upvote check
 */
export const memoizedFindUpvote = cache(
 async (featureRequestId: string, userIdentifier: string) => {
  return prisma.upvote.findUnique({
   where: {
    feature_request_id_user_id: {
     feature_request_id: featureRequestId,
     user_id: userIdentifier,
    },
   },
   select: {id: true},
  });
 }
);

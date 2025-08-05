import { notFound } from 'next/navigation';
import { getCachedBoardBySlug } from '@/lib/cached-queries';
import { prisma } from '@/lib/prisma';
import { BoardWithRequests, FeatureRequestWithDetails } from '@/types';

/**
 * Server component for initial board data loading with ISR support
 */

export async function generateStaticParams() {
  // Generate static params for public boards
  const publicBoards = await prisma.board.findMany({
    where: { is_public: true },
    select: { slug: true },
    take: 100, // Limit to most popular boards
  });

  return publicBoards.map((board) => ({
    slug: board.slug,
  }));
}

interface BoardServerProps {
  slug: string;
}

export async function BoardServer({ slug }: BoardServerProps) {
  // Get board data with caching
  const board = await getCachedBoardBySlug(slug);

  if (!board || !board.is_public) {
    notFound();
  }

  // Get initial feature requests
  const featureRequests = await prisma.featureRequest.findMany({
    where: { board_id: board.id },
    include: {
      upvotes: {
        select: {
          user_identifier: true,
        },
      },
      _count: {
        select: {
          upvotes: true,
          comments: true,
        },
      },
    },
    orderBy: { upvote_count: 'desc' },
    take: 50, // Initial load
  });

  return {
    board: board as unknown as BoardWithRequests,
    initialRequests: featureRequests as unknown as FeatureRequestWithDetails[],
  };
}

// Enable ISR with 5 minute revalidation
export const revalidate = 300;
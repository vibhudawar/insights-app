import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache";

export async function GET(
 request: NextRequest,
 {params}: {params: Promise<{slug: string}>}
) {
 try {
  const resolvedParams = await params;
  const board = await prisma.board.findUnique({
   where: {slug: resolvedParams.slug},
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

  if (!board) {
   return NextResponse.json(
    {success: false, error: "Board not found"},
    {status: 404}
   );
  }

  // Check if board is public or if user has access
  if (!board.is_public) {
   return NextResponse.json(
    {success: false, error: "This board is private"},
    {status: 403}
   );
  }

  const response = NextResponse.json({
   success: true,
   data: board,
  });

  // Cache public board data for 5 minutes, stale-while-revalidate for 1 hour
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=3600'
  );
  response.headers.set('Cache-Tag', `${CACHE_TAGS.BOARD_DETAILS}-${resolvedParams.slug}`);

  return response;
 } catch (error) {
  console.error("Board fetch error:", error);
  return NextResponse.json(
   {success: false, error: "Internal server error"},
   {status: 500}
  );
 }
}

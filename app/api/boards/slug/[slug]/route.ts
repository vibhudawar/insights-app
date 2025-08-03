import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(
 request: NextRequest,
 {params}: {params: Promise<{slug: string}>}
) {
 try {
  const resolvedParams = await params;
  const board = await prisma.board.findUnique({
   where: {slug: resolvedParams.slug},
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
     orderBy: {
      upvote_count: "desc",
     },
     take: 10, // Limit for basic board info
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

  return NextResponse.json({
   success: true,
   data: board,
  });
 } catch (error) {
  console.error("Board fetch error:", error);
  return NextResponse.json(
   {success: false, error: "Internal server error"},
   {status: 500}
  );
 }
}

import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {CreateBoardFormData} from "@/types";
import {revalidateUserCache, CACHE_TAGS} from "@/lib/cache";
import {getCachedUserBoards} from "@/lib/cached-queries";
import {ensureUserExists} from "@/lib/user-sync";

export async function GET(request: NextRequest) {
 try {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
   return NextResponse.json(
    {success: false, error: "Unauthorized"},
    {status: 401}
   );
  }

  const {searchParams} = new URL(request.url);
  const limit = searchParams.get("limit");
  const limitNumber = limit ? parseInt(limit, 10) : undefined;

  // Use cached query for better performance
  const boards = await getCachedUserBoards(session.user.id, limitNumber);

  const response = NextResponse.json({
   success: true,
   data: boards,
  });

  // Cache for 60 seconds, stale-while-revalidate for 300 seconds
  response.headers.set(
   "Cache-Control",
   "private, s-maxage=60, stale-while-revalidate=300"
  );
  response.headers.set(
   "Cache-Tag",
   `${CACHE_TAGS.USER_BOARDS}-${session.user.id}`
  );

  return response;
 } catch (error) {
  console.error("Boards fetch error:", error);
  return NextResponse.json(
   {success: false, error: "Internal server error"},
   {status: 500}
  );
 }
}

export async function POST(request: NextRequest) {
 try {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
   return NextResponse.json(
    {success: false, error: "Unauthorized"},
    {status: 401}
   );
  }

  const body = await request.json();
  const {title, description, slug, themeConfig, isPublic}: CreateBoardFormData =
   body;

  // Validate required fields
  if (!title || !slug) {
   return NextResponse.json(
    {success: false, error: "Title and slug are required"},
    {status: 400}
   );
  }

  // Ensure user exists in database (handle case where DB was reset but session exists)
  await ensureUserExists(session);

  // Check if slug is already taken
  const existingBoard = await prisma.board.findUnique({
   where: {slug},
  });

  if (existingBoard) {
   return NextResponse.json(
    {success: false, error: "Slug is already taken"},
    {status: 400}
   );
  }

  // Create the board
  const board = await prisma.board.create({
   data: {
    creator_id: session.user.id,
    title,
    description,
    slug,
    theme_config: themeConfig
     ? JSON.parse(JSON.stringify(themeConfig))
     : undefined,
    is_public: isPublic,
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
    feature_requests: true,
   },
  });

  // Revalidate user's board cache after creating new board
  revalidateUserCache(session.user.id);

  return NextResponse.json({
   success: true,
   data: board,
   message: "Board created successfully",
  });
 } catch (error) {
  console.error("Board creation error:", error);
  return NextResponse.json(
   {success: false, error: "Internal server error"},
   {status: 500}
  );
 }
}

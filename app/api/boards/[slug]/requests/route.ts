import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {revalidateFeatureRequests, CACHE_TAGS} from "@/lib/cache";
import {requireAuth} from "@/lib/permissions";

export async function GET(
 request: NextRequest,
 {params}: {params: Promise<{slug: string}>}
) {
 try {
  const resolvedParams = await params;
  const {searchParams} = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "upvotes"; // upvotes, newest, oldest

  // First, find the board
  const board = await prisma.board.findUnique({
   where: {slug: resolvedParams.slug},
  });

  if (!board) {
   return NextResponse.json(
    {success: false, error: "Board not found"},
    {status: 404}
   );
  }

  // Build where clause for filtering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {
   board_id: board.id,
  };

  if (status && status !== "ALL") {
   whereClause.status = status;
  }

  if (search) {
   whereClause.OR = [
    {title: {contains: search, mode: "insensitive"}},
    {description: {contains: search, mode: "insensitive"}},
   ];
  }

  // Build orderBy clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = {};
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

  const featureRequests = await prisma.featureRequest.findMany({
   where: whereClause,
   include: {
    submitter: {
     select: {
      id: true,
      name: true,
      image: true,
     },
    },
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

  const response = NextResponse.json({
   success: true,
   data: featureRequests,
  });

  // Cache feature requests for 30 seconds, stale-while-revalidate for 5 minutes
  // Short cache because this data changes frequently with upvotes/comments
  response.headers.set(
   "Cache-Control",
   "public, s-maxage=30, stale-while-revalidate=300"
  );
  response.headers.set(
   "Cache-Tag",
   `${CACHE_TAGS.FEATURE_REQUESTS}-${resolvedParams.slug}`
  );

  return response;
 } catch (error) {
  console.error("Feature requests fetch error:", error);
  return NextResponse.json(
   {success: false, error: "Internal server error"},
   {status: 500}
  );
 }
}

export const POST = requireAuth(
 async (request: NextRequest, {params}: {params: Promise<{slug: string}>}) => {
  try {
   const session = (
    request as NextRequest & {
     session: {user: {id: string; name?: string | null; email?: string | null}};
    }
   ).session;
   const resolvedParams = await params;

   // First, find the board
   const board = await prisma.board.findUnique({
    where: {slug: resolvedParams.slug},
   });

   if (!board) {
    return NextResponse.json(
     {success: false, error: "Board not found"},
     {status: 404}
    );
   }

   if (!board.is_public) {
    return NextResponse.json(
     {success: false, error: "This board is private"},
     {status: 403}
    );
   }

   const body = await request.json();
   const {title, description}: {title: string; description?: string} = body;

   // Validate required fields
   if (!title?.trim()) {
    return NextResponse.json(
     {success: false, error: "Title is required"},
     {status: 400}
    );
   }

   // Create the feature request with authenticated user
   const featureRequest = await prisma.featureRequest.create({
    data: {
     board_id: board.id,
     title: title.trim(),
     description: description?.trim() || null,
     submitter_id: session.user.id,
     // Keep backward compatibility fields from user session
     submitter_name: session.user.name || null,
     submitter_email: session.user.email || null,
    },
    include: {
     submitter: {
      select: {
       id: true,
       name: true,
       email: true,
       image: true,
      },
     },
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
   });

   // Revalidate feature request cache after creating new request
   revalidateFeatureRequests(resolvedParams.slug, board.creator_id);

   return NextResponse.json({
    success: true,
    data: featureRequest,
    message: "Feature request created successfully",
   });
  } catch (error) {
   console.error("Feature request creation error:", error);
   return NextResponse.json(
    {success: false, error: "Internal server error"},
    {status: 500}
   );
  }
 }
);

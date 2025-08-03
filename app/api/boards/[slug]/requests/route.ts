import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {CreateFeatureRequestFormData} from "@/types";

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
    upvotes: {
     select: {
      user_identifier: true,
     },
    },
    comments: {
     select: {
      id: true,
     },
    },
   },
   orderBy,
  });

  return NextResponse.json({
   success: true,
   data: featureRequests,
  });
 } catch (error) {
  console.error("Feature requests fetch error:", error);
  return NextResponse.json(
   {success: false, error: "Internal server error"},
   {status: 500}
  );
 }
}

export async function POST(
 request: NextRequest,
 {params}: {params: Promise<{slug: string}>}
) {
 try {
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
  const {
   title,
   description,
   submitterName,
   submitterEmail,
  }: CreateFeatureRequestFormData = body;

  // Validate required fields
  if (!title || !submitterEmail) {
   return NextResponse.json(
    {success: false, error: "Title and email are required"},
    {status: 400}
   );
  }

  // Create the feature request
  const featureRequest = await prisma.featureRequest.create({
   data: {
    board_id: board.id,
    title,
    description,
    submitter_name: submitterName,
    submitter_email: submitterEmail,
   },
   include: {
    upvotes: true,
    comments: true,
   },
  });

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

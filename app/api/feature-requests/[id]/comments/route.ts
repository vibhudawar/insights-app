import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {CreateCommentFormData} from "@/types";

export async function GET(
 request: NextRequest,
 {params}: {params: Promise<{id: string}>}
) {
 try {
  const resolvedParams = await params;
  // Check if feature request exists
  const featureRequest = await prisma.featureRequest.findUnique({
   where: {id: resolvedParams.id},
  });

  if (!featureRequest) {
   return NextResponse.json(
    {success: false, error: "Feature request not found"},
    {status: 404}
   );
  }

  // Get comments with replies
  const comments = await prisma.comment.findMany({
   where: {
    feature_request_id: resolvedParams.id,
    parent_comment_id: null, // Only top-level comments
   },
   include: {
    replies: {
     orderBy: {created_at: "asc"},
    },
   },
   orderBy: {created_at: "desc"},
  });

  return NextResponse.json({
   success: true,
   data: comments,
  });
 } catch (error) {
  console.error("Comments fetch error:", error);
  return NextResponse.json(
   {success: false, error: "Internal server error"},
   {status: 500}
  );
 }
}

export async function POST(
 request: NextRequest,
 {params}: {params: Promise<{id: string}>}
) {
 try {
  const resolvedParams = await params;
  // Check if feature request exists
  const featureRequest = await prisma.featureRequest.findUnique({
   where: {id: resolvedParams.id},
  });

  if (!featureRequest) {
   return NextResponse.json(
    {success: false, error: "Feature request not found"},
    {status: 404}
   );
  }

  const body = await request.json();
  const {
   content,
   authorName,
   authorEmail,
   parentCommentId,
  }: CreateCommentFormData = body;

  // Validate required fields
  if (!content || !authorName || !authorEmail) {
   return NextResponse.json(
    {success: false, error: "Content, name, and email are required"},
    {status: 400}
   );
  }

  // Create the comment
  const comment = await prisma.$transaction(async (tx) => {
   const newComment = await tx.comment.create({
    data: {
     feature_request_id: resolvedParams.id,
     parent_comment_id: parentCommentId || null,
     author_name: authorName,
     author_email: authorEmail,
     content,
    },
    include: {
     replies: true,
    },
   });

   // Update comment count on the feature request
   await tx.featureRequest.update({
    where: {id: resolvedParams.id},
    data: {
     comment_count: {
      increment: 1,
     },
    },
   });

   return newComment;
  });

  return NextResponse.json({
   success: true,
   data: comment,
   message: "Comment added successfully",
  });
 } catch (error) {
  console.error("Comment creation error:", error);
  return NextResponse.json(
   {success: false, error: "Internal server error"},
   {status: 500}
  );
 }
}

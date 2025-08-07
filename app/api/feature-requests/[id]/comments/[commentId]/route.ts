import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {requireCommentOwnership} from "@/lib/permissions";
import {revalidateComments} from "@/lib/cache";

/**
 * Update comment - User can edit own comments, Board owner can moderate any comment
 */
export const PUT = requireCommentOwnership(
 async (req: NextRequest, comment, _session) => {
  try {
   const body = await req.json();
   const {content} = body;

   // Validate required fields
   if (!content?.trim()) {
    return NextResponse.json(
     {success: false, error: "Content is required"},
     {status: 400}
    );
   }

   // Update the comment
   const updatedComment = await prisma.comment.update({
    where: {id: comment.id},
    data: {
     content: content.trim(),
     is_edited: true,
     updated_at: new Date(),
    },
    include: {
     author: {
      select: {
       id: true,
       name: true,
       email: true,
       image: true,
      },
     },
     feature_request: {
      select: {
       id: true,
       board: {
        select: {
         slug: true,
         creator_id: true,
        },
       },
      },
     },
     replies: {
      include: {
       author: {
        select: {
         id: true,
         name: true,
         image: true,
        },
       },
      },
      orderBy: {
       created_at: "asc",
      },
     },
    },
   });

   // Revalidate cache
   const boardSlug = updatedComment.feature_request.board.slug;
   const boardCreatorId = updatedComment.feature_request.board.creator_id;

   revalidateComments(
    updatedComment.feature_request.id,
    boardSlug,
    boardCreatorId
   );

   return NextResponse.json({
    success: true,
    data: updatedComment,
    message: "Comment updated successfully",
   });
  } catch (error) {
   console.error("Comment update error:", error);
   return NextResponse.json(
    {success: false, error: "Internal server error"},
    {status: 500}
   );
  }
 }
);

/**
 * Delete comment - User can delete own comments, Board owner can delete any comment
 */
export const DELETE = requireCommentOwnership(
 async (req: NextRequest, comment, _session) => {
  try {
   // Get feature request info for cache revalidation and comment count update
   const featureRequestInfo = await prisma.featureRequest.findUnique({
    where: {id: comment.feature_request.id},
    select: {
     id: true,
     board: {
      select: {
       slug: true,
       creator_id: true,
      },
     },
    },
   });

   if (!featureRequestInfo) {
    return NextResponse.json(
     {success: false, error: "Feature request not found"},
     {status: 404}
    );
   }

   // Count total comments that will be deleted (including replies)
   const commentCount = await prisma.comment.count({
    where: {
     OR: [{id: comment.id}, {parent_comment_id: comment.id}],
    },
   });

   // Delete the comment (cascade will handle replies)
   await prisma.$transaction([
    // Delete the comment and its replies
    prisma.comment.deleteMany({
     where: {
      OR: [{id: comment.id}, {parent_comment_id: comment.id}],
     },
    }),
    // Update comment count on feature request
    prisma.featureRequest.update({
     where: {id: featureRequestInfo.id},
     data: {
      comment_count: {
       decrement: commentCount,
      },
     },
    }),
   ]);

   // Revalidate cache
   const boardSlug = featureRequestInfo.board.slug;
   const boardCreatorId = featureRequestInfo.board.creator_id;

   revalidateComments(featureRequestInfo.id, boardSlug, boardCreatorId);

   return NextResponse.json({
    success: true,
    message: "Comment deleted successfully",
   });
  } catch (error) {
   console.error("Comment deletion error:", error);
   return NextResponse.json(
    {success: false, error: "Internal server error"},
    {status: 500}
   );
  }
 }
);

/**
 * Get single comment with details
 */
export async function GET(
 request: NextRequest,
 {params}: {params: Promise<{id: string; commentId: string}>}
) {
 try {
  const resolvedParams = await params;

  const comment = await prisma.comment.findUnique({
   where: {id: resolvedParams.commentId},
   include: {
    author: {
     select: {
      id: true,
      name: true,
      email: true,
      image: true,
     },
    },
    feature_request: {
     select: {
      id: true,
      title: true,
      board: {
       select: {
        title: true,
        slug: true,
        is_public: true,
       },
      },
     },
    },
    replies: {
     include: {
      author: {
       select: {
        id: true,
        name: true,
        image: true,
       },
      },
     },
     orderBy: {
      created_at: "asc",
     },
    },
   },
  });

  if (!comment) {
   return NextResponse.json(
    {success: false, error: "Comment not found"},
    {status: 404}
   );
  }

  // Check if board is public
  if (!comment.feature_request.board.is_public) {
   return NextResponse.json(
    {success: false, error: "This board is private"},
    {status: 403}
   );
  }

  const response = NextResponse.json({
   success: true,
   data: comment,
  });

  // Cache comment for 5 minutes
  response.headers.set(
   "Cache-Control",
   "public, s-maxage=300, stale-while-revalidate=900"
  );

  return response;
 } catch (error) {
  console.error("Comment fetch error:", error);
  return NextResponse.json(
   {success: false, error: "Internal server error"},
   {status: 500}
  );
 }
}

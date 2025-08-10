import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {revalidateFeatureRequestsAsync} from "@/lib/cache";
import {memoizedFindFeatureRequestForUpvote} from "@/lib/request-memoization";
import {requireAuth} from "@/lib/permissions";

export const POST = requireAuth(
 async (request: NextRequest, {params}: {params: Promise<{id: string}>}) => {
  try {
   const session = (request as NextRequest & {session: {user: {id: string}}})
    .session;
   const resolvedParams = await params;

   // Check if feature request exists (optimized query)
   const featureRequest = await memoizedFindFeatureRequestForUpvote(
    resolvedParams.id
   );

   if (!featureRequest) {
    return NextResponse.json(
     {success: false, error: "Feature request not found"},
     {status: 404}
    );
   }

   // Check if board is public
   if (!featureRequest.board?.is_public) {
    return NextResponse.json(
     {success: false, error: "This board is private"},
     {status: 403}
    );
   }

   // Check for existing upvote and perform operation in single optimized transaction
   const result = await prisma.$transaction(async (tx) => {
    // Check for existing upvote
    const existingUpvote = await tx.upvote.findUnique({
     where: {
      feature_request_id_user_id: {
       feature_request_id: resolvedParams.id,
       user_id: session.user.id,
      },
     },
     select: {id: true},
    });

    if (existingUpvote) {
     // Remove upvote and decrement count
     await tx.upvote.delete({
      where: {id: existingUpvote.id},
     });

     const updatedRequest = await tx.featureRequest.update({
      where: {id: resolvedParams.id},
      data: {
       upvote_count: {
        decrement: 1,
       },
      },
      select: {upvote_count: true},
     });

     return {
      upvoted: false,
      upvote_count: updatedRequest.upvote_count,
      message: "Upvote removed",
     };
    } else {
     // Add upvote and increment count
     await tx.upvote.create({
      data: {
       feature_request_id: resolvedParams.id,
       user_id: session.user.id,
      },
     });

     const updatedRequest = await tx.featureRequest.update({
      where: {id: resolvedParams.id},
      data: {
       upvote_count: {
        increment: 1,
       },
      },
      select: {upvote_count: true},
     });

     return {
      upvoted: true,
      upvote_count: updatedRequest.upvote_count,
      message: "Upvote added",
     };
    }
   });

   // Trigger async cache revalidation (non-blocking)
   if (featureRequest.board) {
    revalidateFeatureRequestsAsync(
     featureRequest.board.slug,
     featureRequest.board.creator_id
    );
   }

   return NextResponse.json({
    success: true,
    data: {
     upvoted: result.upvoted,
     upvote_count: result.upvote_count,
    },
    message: result.message,
   });
  } catch (error) {
   console.error("Upvote toggle error:", error);
   return NextResponse.json(
    {success: false, error: "Internal server error"},
    {status: 500}
   );
  }
 }
);

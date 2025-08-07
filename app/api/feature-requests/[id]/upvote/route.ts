import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {revalidateFeatureRequests} from "@/lib/cache";
import {memoizedFindFeatureRequest} from "@/lib/request-memoization";
import {requireAuth} from "@/lib/permissions";

export const POST = requireAuth(
 async (request: NextRequest, {params}: {params: Promise<{id: string}>}) => {
  try {
   const session = (request as NextRequest & {session: {user: {id: string}}})
    .session;
   const resolvedParams = await params;

   // Check if feature request exists
   const featureRequest = await memoizedFindFeatureRequest(resolvedParams.id);

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

   // Check for existing upvote
   const existingUpvote = await prisma.upvote.findUnique({
    where: {
     feature_request_id_user_id: {
      feature_request_id: resolvedParams.id,
      user_id: session.user.id,
     },
    },
    select: {id: true},
   });

   if (existingUpvote) {
    // Remove upvote (toggle off)
    await prisma.$transaction([
     prisma.upvote.delete({
      where: {id: existingUpvote.id},
     }),
     prisma.featureRequest.update({
      where: {id: resolvedParams.id},
      data: {
       upvote_count: {
        decrement: 1,
       },
      },
     }),
    ]);

    // Revalidate feature request cache after upvote change
    if (featureRequest.board) {
     revalidateFeatureRequests(
      featureRequest.board.slug,
      featureRequest.board.creator_id
     );
    }

    return NextResponse.json({
     success: true,
     data: {upvoted: false},
     message: "Upvote removed",
    });
   } else {
    // Add upvote
    await prisma.$transaction([
     prisma.upvote.create({
      data: {
       feature_request_id: resolvedParams.id,
       user_id: session.user.id,
      },
     }),
     prisma.featureRequest.update({
      where: {id: resolvedParams.id},
      data: {
       upvote_count: {
        increment: 1,
       },
      },
     }),
    ]);

    // Revalidate feature request cache after upvote change
    if (featureRequest.board) {
     revalidateFeatureRequests(
      featureRequest.board.slug,
      featureRequest.board.creator_id
     );
    }

    return NextResponse.json({
     success: true,
     data: {upvoted: true},
     message: "Upvote added",
    });
   }
  } catch (error) {
   console.error("Upvote toggle error:", error);
   return NextResponse.json(
    {success: false, error: "Internal server error"},
    {status: 500}
   );
  }
 }
);

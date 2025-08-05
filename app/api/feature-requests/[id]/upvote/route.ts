import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import { revalidateFeatureRequests } from "@/lib/cache";
import { memoizedFindFeatureRequest, memoizedFindUpvote } from "@/lib/request-memoization";

export async function POST(
 request: NextRequest,
 {params}: {params: Promise<{id: string}>}
) {
 try {
  const resolvedParams = await params;
  const body = await request.json();
  const {userIdentifier} = body; // email or user_id

  if (!userIdentifier) {
   return NextResponse.json(
    {success: false, error: "User identifier is required"},
    {status: 400}
   );
  }

  // Check if feature request exists and get existing upvote in parallel using memoized functions
  const [featureRequest, existingUpvote] = await Promise.all([
   memoizedFindFeatureRequest(resolvedParams.id),
   memoizedFindUpvote(resolvedParams.id, userIdentifier),
  ]);

  if (!featureRequest) {
   return NextResponse.json(
    {success: false, error: "Feature request not found"},
    {status: 404}
   );
  }

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
    revalidateFeatureRequests(featureRequest.board.slug, featureRequest.board.creator_id);
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
      user_identifier: userIdentifier,
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
    revalidateFeatureRequests(featureRequest.board.slug, featureRequest.board.creator_id);
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

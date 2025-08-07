import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {requireFeatureRequestOwnership} from "@/lib/permissions";
import {revalidateFeatureRequests, revalidateUserCache} from "@/lib/cache";
import {RequestStatus} from "@/types";

/**
 * Update feature request - User can edit own requests, Board owner can moderate any request
 */
export const PUT = requireFeatureRequestOwnership(
 async (req: NextRequest, featureRequest, session) => {
  try {
   const body = await req.json();
   const {title, description, status} = body;

   // Validate required fields
   if (!title?.trim()) {
    return NextResponse.json(
     {success: false, error: "Title is required"},
     {status: 400}
    );
   }

   // Validate status if provided
   const validStatuses = ["NEW", "IN_PROGRESS", "SHIPPED", "CANCELLED"];
   if (status && !validStatuses.includes(status)) {
    return NextResponse.json(
     {success: false, error: "Invalid status"},
     {status: 400}
    );
   }

   // Check if user can modify status (only board owners can change status)
   const isBoardOwner = session.user.id === featureRequest.board.creator_id;
   const updateData: {
    title: string;
    description: string | null;
    updated_at: Date;
    status?: RequestStatus;
    is_edited?: boolean;
   } = {
    title: title.trim(),
    description: description?.trim() || null,
    updated_at: new Date(),
   };

   // Only board owners can update status
   if (status && isBoardOwner) {
    updateData.status = status as RequestStatus;
   }

   // Update the feature request
   const updatedRequest = await prisma.featureRequest.update({
    where: {id: featureRequest.id},
    data: updateData,
    include: {
     submitter: {
      select: {
       id: true,
       name: true,
       email: true,
       image: true,
      },
     },
     board: {
      select: {
       slug: true,
       creator_id: true,
       title: true,
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

   // Revalidate cache
   revalidateFeatureRequests(
    updatedRequest.board.slug,
    updatedRequest.board.creator_id
   );
   if (updatedRequest.submitter_id) {
    revalidateUserCache(updatedRequest.submitter_id);
   }

   return NextResponse.json({
    success: true,
    data: updatedRequest,
    message: "Feature request updated successfully",
   });
  } catch (error) {
   console.error("Feature request update error:", error);
   return NextResponse.json(
    {success: false, error: "Internal server error"},
    {status: 500}
   );
  }
 }
);

/**
 * Delete feature request - User can delete own requests, Board owner can delete any request
 */
export const DELETE = requireFeatureRequestOwnership(
 async (req: NextRequest, featureRequest, session) => {
  try {
   // Get board info for cache revalidation
   const boardInfo = await prisma.board.findUnique({
    where: {id: featureRequest.board.id},
    select: {
     slug: true,
     creator_id: true,
    },
   });

   // Delete the feature request (cascade will handle upvotes and comments)
   await prisma.featureRequest.delete({
    where: {id: featureRequest.id},
   });

   // Revalidate cache
   if (boardInfo) {
    revalidateFeatureRequests(boardInfo.slug, boardInfo.creator_id);
   }
   if (featureRequest.submitter_id) {
    revalidateUserCache(featureRequest.submitter_id);
   }

   return NextResponse.json({
    success: true,
    message: "Feature request deleted successfully",
   });
  } catch (error) {
   console.error("Feature request deletion error:", error);
   return NextResponse.json(
    {success: false, error: "Internal server error"},
    {status: 500}
   );
  }
 }
);

/**
 * Get single feature request with full details
 */
export async function GET(
 request: NextRequest,
 {params}: {params: Promise<{id: string}>}
) {
 try {
  const resolvedParams = await params;

  const featureRequest = await prisma.featureRequest.findUnique({
   where: {id: resolvedParams.id},
   include: {
    submitter: {
     select: {
      id: true,
      name: true,
      email: true,
      image: true,
     },
    },
    board: {
     select: {
      id: true,
      title: true,
      slug: true,
      creator_id: true,
      is_public: true,
     },
    },
    upvotes: {
     select: {
      user_id: true,
      user: {
       select: {
        name: true,
        image: true,
       },
      },
     },
    },
    comments: {
     include: {
      author: {
       select: {
        id: true,
        name: true,
        image: true,
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
     where: {
      parent_comment_id: null,
     },
     orderBy: {
      created_at: "desc",
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

  if (!featureRequest) {
   return NextResponse.json(
    {success: false, error: "Feature request not found"},
    {status: 404}
   );
  }

  // Check if board is public or user has access
  if (!featureRequest.board.is_public) {
   return NextResponse.json(
    {success: false, error: "This board is private"},
    {status: 403}
   );
  }

  const response = NextResponse.json({
   success: true,
   data: featureRequest,
  });

  // Cache single feature request for 5 minutes
  response.headers.set(
   "Cache-Control",
   "public, s-maxage=300, stale-while-revalidate=900"
  );

  return response;
 } catch (error) {
  console.error("Feature request fetch error:", error);
  return NextResponse.json(
   {success: false, error: "Internal server error"},
   {status: 500}
  );
 }
}

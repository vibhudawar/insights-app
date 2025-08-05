import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateFeatureRequests } from "@/lib/cache";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await params;

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["NEW", "IN_PROGRESS", "SHIPPED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be one of: NEW, IN_PROGRESS, SHIPPED, CANCELLED" },
        { status: 400 }
      );
    }

    // Check if feature request exists and user owns the board
    const featureRequest = await prisma.featureRequest.findUnique({
      where: { id: resolvedParams.id },
      include: {
        board: true,
      },
    });

    if (!featureRequest) {
      return NextResponse.json(
        { success: false, error: "Feature request not found" },
        { status: 404 }
      );
    }

    // Check if user is the board creator (admin/owner)
    if (featureRequest.board.creator_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Only board creators can update feature request status" },
        { status: 403 }
      );
    }

    // Update the feature request status
    const updatedFeatureRequest = await prisma.featureRequest.update({
      where: { id: resolvedParams.id },
      data: {
        status,
        updated_at: new Date(),
      },
      include: {
        board: {
          select: {
            title: true,
            slug: true,
          },
        },
        upvotes: true,
        comments: true,
      },
    });

    // Revalidate feature request cache after status update
    revalidateFeatureRequests(updatedFeatureRequest.board.slug, session.user.id);

    return NextResponse.json({
      success: true,
      data: updatedFeatureRequest,
      message: "Feature request status updated successfully",
    });
  } catch (error) {
    console.error("Feature request status update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
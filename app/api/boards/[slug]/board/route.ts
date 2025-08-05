import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateBoard, revalidateUserCache } from "@/lib/cache";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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
    const { title, description, slug, isPublic, theme_config } = body;

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Check if board exists and user owns it
    const existingBoard = await prisma.board.findUnique({
      where: { 
        slug: resolvedParams.slug,
        creator_id: session.user.id 
      },
    });

    if (!existingBoard) {
      return NextResponse.json(
        { success: false, error: "Board not found or access denied" },
        { status: 404 }
      );
    }

    // Check if new slug is available (if changed)
    if (slug !== existingBoard.slug) {
      const slugExists = await prisma.board.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: "Slug already taken" },
          { status: 400 }
        );
      }
    }

    // Update the board
    const updatedBoard = await prisma.board.update({
      where: { id: existingBoard.id },
      data: {
        title,
        description,
        slug,
        is_public: isPublic,
        theme_config: theme_config ? JSON.stringify(theme_config) : undefined,
        updated_at: new Date(),
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
        feature_requests: {
          select: {
            id: true,
            title: true,
            status: true,
            upvote_count: true,
            comment_count: true,
            created_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 5,
        },
      },
    });

    // Revalidate board cache after update
    revalidateBoard(resolvedParams.slug, session.user.id);

    return NextResponse.json({
      success: true,
      data: updatedBoard,
      message: "Board updated successfully",
    });
  } catch (error) {
    console.error("Board update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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

    // Check if board exists and user owns it
    const existingBoard = await prisma.board.findUnique({
      where: { 
        slug: resolvedParams.slug,
        creator_id: session.user.id 
      },
    });

    if (!existingBoard) {
      return NextResponse.json(
        { success: false, error: "Board not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the board (cascade will handle related records)
    await prisma.board.delete({
      where: { id: existingBoard.id },
    });

    // Revalidate user cache after board deletion
    revalidateUserCache(session.user.id);
    
    return NextResponse.json({
      success: true,
      message: "Board deleted successfully",
    });
  } catch (error) {
    console.error("Board deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
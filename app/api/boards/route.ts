import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateBoardFormData } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const limitNumber = limit ? parseInt(limit, 10) : undefined;

    const boards = await prisma.board.findMany({
      where: {
        creator_id: session.user.id,
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
        },
      },
      orderBy: {
        updated_at: "desc",
      },
      take: limitNumber,
    });

    return NextResponse.json({
      success: true,
      data: boards,
    });
  } catch (error) {
    console.error("Boards fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, slug, themeConfig, isPublic }: CreateBoardFormData = body;

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingBoard = await prisma.board.findUnique({
      where: { slug },
    });

    if (existingBoard) {
      return NextResponse.json(
        { success: false, error: "Slug is already taken" },
        { status: 400 }
      );
    }

    // Create the board
    const board = await prisma.board.create({
      data: {
        creator_id: session.user.id,
        title,
        description,
        slug,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        theme_config: themeConfig as any,
        is_public: isPublic,
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
        feature_requests: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: board,
      message: "Board created successfully",
    });
  } catch (error) {
    console.error("Board creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
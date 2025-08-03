import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all boards for the user
    const boards = await prisma.board.findMany({
      where: {
        creator_id: session.user.id,
      },
      include: {
        feature_requests: {
          include: {
            upvotes: true,
          },
        },
      },
    });

    // Calculate stats
    const totalBoards = boards.length;
    let totalRequests = 0;
    let totalUpvotes = 0;
    let activeBoards = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    boards.forEach((board) => {
      totalRequests += board.feature_requests.length;
      
      board.feature_requests.forEach((request) => {
        totalUpvotes += request.upvotes.length;
      });

      // Check if board is active (has requests in last 30 days)
      const hasRecentActivity = board.feature_requests.some(
        (request) => request.created_at > thirtyDaysAgo
      );
      if (hasRecentActivity) {
        activeBoards++;
      }
    });

    const stats: DashboardStats = {
      totalBoards,
      totalRequests,
      totalUpvotes,
      activeBoards,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
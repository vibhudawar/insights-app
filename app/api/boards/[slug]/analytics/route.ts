import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
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

    // Find the board and verify ownership
    const board = await prisma.board.findUnique({
      where: { 
        slug: resolvedParams.slug,
        creator_id: session.user.id 
      },
      include: {
        feature_requests: {
          include: {
            upvotes: true,
            comments: true,
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json(
        { success: false, error: "Board not found or access denied" },
        { status: 404 }
      );
    }

    // Calculate analytics data
    const totalRequests = board.feature_requests.length;
    const totalUpvotes = board.feature_requests.reduce(
      (sum, request) => sum + request.upvote_count,
      0
    );
    const totalComments = board.feature_requests.reduce(
      (sum, request) => sum + request.comment_count,
      0
    );

    // Status breakdown
    const statusBreakdown = {
      NEW: 0,
      IN_PROGRESS: 0,
      SHIPPED: 0,
      CANCELLED: 0,
    };

    board.feature_requests.forEach((request) => {
      statusBreakdown[request.status as keyof typeof statusBreakdown]++;
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as requests_count,
        SUM(upvote_count) as upvotes_count
      FROM feature_requests 
      WHERE board_id = ${board.id} 
        AND created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    ` as { date: Date; requests_count: bigint; upvotes_count: bigint }[];

    // Top requests by upvotes
    const topRequests = board.feature_requests
      .sort((a, b) => b.upvote_count - a.upvote_count)
      .slice(0, 10)
      .map((request) => ({
        id: request.id,
        title: request.title,
        upvote_count: request.upvote_count,
        comment_count: request.comment_count,
        status: request.status,
        created_at: request.created_at,
      }));

    // Format recent activity for chart
    const formattedActivity = recentActivity.map(item => ({
      date: item.date.toISOString().split('T')[0],
      requests_count: Number(item.requests_count),
      upvotes_count: Number(item.upvotes_count),
    }));

    const analytics = {
      total_requests: totalRequests,
      total_upvotes: totalUpvotes,
      total_comments: totalComments,
      status_breakdown: statusBreakdown,
      recent_activity: formattedActivity,
      top_requests: topRequests,
      board_info: {
        title: board.title,
        description: board.description,
        created_at: board.created_at,
        is_public: board.is_public,
      },
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
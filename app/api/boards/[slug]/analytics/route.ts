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
      select: {
        id: true,
        title: true,
        description: true,
        created_at: true,
        is_public: true,
      },
    });

    if (!board) {
      return NextResponse.json(
        { success: false, error: "Board not found or access denied" },
        { status: 404 }
      );
    }

    // Use database aggregation for better performance
    const [totalStats, statusBreakdownResult] = await Promise.all([
      // Get total counts using aggregation
      prisma.featureRequest.aggregate({
        where: { board_id: board.id },
        _count: { id: true },
        _sum: { 
          upvote_count: true,
          comment_count: true,
        },
      }),
      // Get status breakdown using groupBy
      prisma.featureRequest.groupBy({
        by: ['status'],
        where: { board_id: board.id },
        _count: { id: true },
      }),
    ]);

    const totalRequests = totalStats._count.id;
    const totalUpvotes = totalStats._sum.upvote_count || 0;
    const totalComments = totalStats._sum.comment_count || 0;

    // Format status breakdown
    const statusBreakdown = {
      NEW: 0,
      IN_PROGRESS: 0,
      SHIPPED: 0,
      CANCELLED: 0,
    };

    statusBreakdownResult.forEach((item) => {
      statusBreakdown[item.status as keyof typeof statusBreakdown] = item._count.id;
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

    // Top requests by upvotes - use database query instead of JavaScript sorting
    const topRequests = await prisma.featureRequest.findMany({
      where: { board_id: board.id },
      select: {
        id: true,
        title: true,
        upvote_count: true,
        comment_count: true,
        status: true,
        created_at: true,
      },
      orderBy: { upvote_count: 'desc' },
      take: 10,
    });

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
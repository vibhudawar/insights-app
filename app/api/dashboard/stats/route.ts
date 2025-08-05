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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Use efficient SQL aggregation instead of loading all data in memory
    const statsResult = await prisma.$queryRaw<Array<{
      total_boards: bigint;
      total_requests: bigint;
      total_upvotes: bigint;
      active_boards: bigint;
    }>>`
      SELECT 
        COUNT(DISTINCT b.id) as total_boards,
        COUNT(fr.id) as total_requests,
        COALESCE(SUM(fr.upvote_count), 0) as total_upvotes,
        COUNT(DISTINCT CASE WHEN fr.created_at > ${thirtyDaysAgo} THEN b.id END) as active_boards
      FROM boards b
      LEFT JOIN feature_requests fr ON b.id = fr.board_id
      WHERE b.creator_id = ${session.user.id}
    `;

    const result = statsResult[0];
    const stats: DashboardStats = {
      totalBoards: Number(result.total_boards),
      totalRequests: Number(result.total_requests),
      totalUpvotes: Number(result.total_upvotes),
      activeBoards: Number(result.active_boards),
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
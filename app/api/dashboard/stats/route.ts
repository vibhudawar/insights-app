import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache";
import { getCachedDashboardStats } from "@/lib/cached-queries";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use cached query for better performance
    const stats = await getCachedDashboardStats(session.user.id);

    const response = NextResponse.json({
      success: true,
      data: stats,
    });

    // Cache dashboard stats for 5 minutes, stale-while-revalidate for 15 minutes
    response.headers.set(
      'Cache-Control',
      'private, s-maxage=300, stale-while-revalidate=900'
    );
    response.headers.set('Cache-Tag', `${CACHE_TAGS.DASHBOARD_STATS}-${session.user.id}`);

    return response;
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
"use client";

import {useSession} from "next-auth/react";
import Link from "next/link";
import {useEffect, useState} from "react";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {DashboardStats, BoardWithRequests} from "@/types";
import {HiOutlineViewBoards} from "react-icons/hi";
import {LuThumbsUp} from "react-icons/lu";
import {AiOutlineThunderbolt} from "react-icons/ai";
import {IoClipboardOutline} from "react-icons/io5";
import {HeaderComponent} from "@/components/HeaderComponent";
import {FaPlus} from "react-icons/fa6";
import {StatsCard} from "@/components/StatsCard.component";
import {NoStateComponent} from "@/components/NoState.component";
import {BoardRow} from "@/components/BoardRow.component";
import {
 getBoards,
 getDashboardStats,
} from "@/frontend apis/Feature Requests/BoardApi";

export default function DashboardPage() {
 const {data: session} = useSession();
 const [stats, setStats] = useState<DashboardStats | null>(null);
 const [recentBoards, setRecentBoards] = useState<BoardWithRequests[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
  const fetchDashboardData = async () => {
   try {
    const [statsResponse, boardsResponse] = await Promise.all([
     getDashboardStats(),
     getBoards(5),
    ]);
    setStats(statsResponse.data);
    setRecentBoards(boardsResponse.data || []);
   } catch (error) {
    console.error("Error fetching dashboard data:", error);
   } finally {
    setIsLoading(false);
   }
  };

  if (session) {
   fetchDashboardData();
  }
 }, [session]);

 if (isLoading) {
  return (
   <DashboardLayout>
    <div className="flex items-center justify-center min-h-96">
     <span className="loading loading-spinner loading-lg"></span>
    </div>
   </DashboardLayout>
  );
 }

 return (
  <DashboardLayout>
   <div className="space-y-6">
    {/* Header */}
    <HeaderComponent
     title={`Welcome back, ${session?.user?.name || "User"}!`}
     description="Here's what's happening with your feedback boards"
     buttonText="Create Board"
     buttonLink="/dashboard/boards/new"
     buttonIcon={<FaPlus className="w-4 h-4 mr-2" />}
     showButton={true}
    />

    {/* Stats Cards */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
     <StatsCard
      title="Total Boards"
      stat={stats?.totalBoards || 0}
      icon={<HiOutlineViewBoards className="w-6 h-6 text-blue-600" />}
      backgroundColor="blue"
     />
     <StatsCard
      title="Total Requests"
      stat={stats?.totalRequests || 0}
      icon={<IoClipboardOutline className="w-6 h-6 text-green-600" />}
      backgroundColor="green"
     />
     <StatsCard
      title="Total Upvotes"
      stat={stats?.totalUpvotes || 0}
      icon={<LuThumbsUp className="w-6 h-6 text-purple-600" />}
      backgroundColor="purple"
     />
     <StatsCard
      title="Active Boards"
      stat={stats?.activeBoards || 0}
      icon={<AiOutlineThunderbolt className="w-6 h-6 text-orange-600" />}
      backgroundColor="orange"
     />
    </div>

    {/* Recent Boards */}
    <div className="card bg-base-100 shadow-sm">
     <div className="card-body">
      <div className="flex items-center justify-between mb-4">
       <h2 className="card-title">Recent Boards</h2>
       <Link href="/dashboard/boards" className="btn btn-sm btn-outline">
        View All
       </Link>
      </div>

      {recentBoards.length === 0 ? (
       <NoStateComponent
        title="No boards yet"
        description="Get started by creating your first feedback board"
        icon={<HiOutlineViewBoards className="w-6 h-6 text-base-content" />}
        buttonText="Create Your First Board"
        buttonLink="/dashboard/boards/new"
        showButton={true}
       />
      ) : (
       <div className="space-y-3">
        {recentBoards.map((board) => (
         <BoardRow
          key={board.id}
          title={board.title}
          icon={board.title.charAt(0).toUpperCase()}
          visibility={board.is_public ? "Public" : "Private"}
          metadata={`${board.feature_requests?.length || 0} requests`}
          showButton={true}
          buttonOneText="View"
          buttonOneLink={`/b/${board.slug}`}
          buttonTwoText="Edit"
          buttonTwoLink={`/dashboard/boards/${board.slug}/edit`}
         />
        ))}
       </div>
      )}
     </div>
    </div>
   </div>
  </DashboardLayout>
 );
}

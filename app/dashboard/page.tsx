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

export default function DashboardPage() {
 const {data: session} = useSession();
 const [stats, setStats] = useState<DashboardStats | null>(null);
 const [recentBoards, setRecentBoards] = useState<BoardWithRequests[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
  const fetchDashboardData = async () => {
   try {
    const [statsResponse, boardsResponse] = await Promise.all([
     fetch("/api/dashboard/stats"),
     fetch("/api/boards?limit=5"),
    ]);

    if (statsResponse.ok) {
     const statsData = await statsResponse.json();
     setStats(statsData.data);
    }

    if (boardsResponse.ok) {
     const boardsData = await boardsResponse.json();
     setRecentBoards(boardsData.data || []);
    }
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
    <div className="border-b border-base-300 pb-5">
     <div className="flex items-center justify-between">
      <div>
       <h1 className="text-3xl font-bold leading-tight text-base-content">
        Welcome back, {session?.user?.name || "User"}!
       </h1>
       <p className="mt-2 text-sm text-base-content/70">
        Here&apos;s what&apos;s happening with your feedback boards
       </p>
      </div>
      <div className="flex gap-3">
       <Link href="/dashboard/boards/new" className="btn btn-primary">
        <svg
         className="w-4 h-4 mr-2"
         fill="none"
         stroke="currentColor"
         viewBox="0 0 24 24"
        >
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
         />
        </svg>
        Create Board
       </Link>
      </div>
     </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
     <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
       <div className="flex items-center">
        <div className="flex-1">
         <p className="text-sm font-medium text-base-content/70">
          Total Boards
         </p>
         <p className="text-2xl font-bold text-base-content">
          {stats?.totalBoards || 0}
         </p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
         <HiOutlineViewBoards className="w-6 h-6 text-blue-600" />
        </div>
       </div>
      </div>
     </div>

     <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
       <div className="flex items-center">
        <div className="flex-1">
         <p className="text-sm font-medium text-base-content/70">
          Total Requests
         </p>
         <p className="text-2xl font-bold text-base-content">
          {stats?.totalRequests || 0}
         </p>
        </div>
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
         <IoClipboardOutline className="w-6 h-6 text-green-600" />
        </div>
       </div>
      </div>
     </div>

     <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
       <div className="flex items-center">
        <div className="flex-1">
         <p className="text-sm font-medium text-base-content/70">
          Total Upvotes
         </p>
         <p className="text-2xl font-bold text-base-content">
          {stats?.totalUpvotes || 0}
         </p>
        </div>
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
         <LuThumbsUp className="w-6 h-6 text-purple-600" />
        </div>
       </div>
      </div>
     </div>

     <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
       <div className="flex items-center">
        <div className="flex-1">
         <p className="text-sm font-medium text-base-content/70">
          Active Boards
         </p>
         <p className="text-2xl font-bold text-base-content">
          {stats?.activeBoards || 0}
         </p>
        </div>
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
         <AiOutlineThunderbolt className="w-6 h-6 text-orange-600" />
        </div>
       </div>
      </div>
     </div>
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
       <div className="text-center py-12">
        <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
         <svg
          className="w-8 h-8 text-base-content/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
         >
          <path
           strokeLinecap="round"
           strokeLinejoin="round"
           strokeWidth={2}
           d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
         </svg>
        </div>
        <h3 className="text-lg font-medium text-base-content mb-2">
         No boards yet
        </h3>
        <p className="text-base-content/70 mb-4">
         Get started by creating your first feedback board
        </p>
        <Link href="/dashboard/boards/new" className="btn btn-primary">
         Create Your First Board
        </Link>
       </div>
      ) : (
       <div className="space-y-3">
        {recentBoards.map((board) => (
         <div
          key={board.id}
          className="flex items-center justify-between p-4 border border-base-300 rounded-lg hover:bg-base-50 transition-colors"
         >
          <div className="flex-1">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
             <span className="text-sm font-semibold text-primary">
              {board.title.charAt(0).toUpperCase()}
             </span>
            </div>
            <div>
             <h3 className="font-medium text-base-content">{board.title}</h3>
             <p className="text-sm text-base-content/70">
              {board.feature_requests?.length || 0} requests •
              {board.is_public ? " Public" : " Private"}
             </p>
            </div>
           </div>
          </div>
          <div className="flex items-center gap-2">
           <Link
            href={`/b/${board.slug}`}
            className="btn btn-sm btn-ghost"
            target="_blank"
           >
            View
           </Link>
           <Link
            href={`/dashboard/boards/${board.slug}/edit`}
            className="btn btn-sm btn-outline"
           >
            Edit
           </Link>
          </div>
         </div>
        ))}
       </div>
      )}
     </div>
    </div>
   </div>
  </DashboardLayout>
 );
}

"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {BoardWithRequests} from "@/types";
import {FaPlus} from "react-icons/fa6";
import {FiClipboard} from "react-icons/fi";
import {filterBoards} from "@/utils/utility";
import {getBoards} from "@/frontend apis/apiClient";
import {CiSearch} from "react-icons/ci";
import {HeaderComponent} from "@/components/HeaderComponent";
import {SearchBar} from "@/components/SearchBar.component";
import {NoStateComponent} from "@/components/NoState.component";
import {HiOutlineViewBoards} from "react-icons/hi";
import {LuEye} from "react-icons/lu";
import {
 getTotalUpvotes,
 getRequestCount,
 getAvgEngagement,
} from "@/utils/utility";
import {AnalyticsBoardRow} from "@/components/AnalyticsBoardRow.component";

export default function AnalyticsPage() {
 const [boards, setBoards] = useState<BoardWithRequests[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 const t = useTranslations();

 useEffect(() => {
  const fetchBoards = async () => {
   try {
    const boards = await getBoards();
    setBoards(boards.data || []);
   } catch (error) {
    console.error("Error fetching boards:", error);
   } finally {
    setIsLoading(false);
   }
  };
  fetchBoards();
 }, []);

 const filteredBoards = filterBoards(boards, searchTerm);

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
     title="Analytics Overview"
     description="View analytics and performance metrics for all your boards"
     buttonText="Create Board"
     buttonLink="/dashboard/boards/new"
     buttonIcon={<FaPlus className="w-4 h-4 mr-2" />}
     showButton={false}
    />

    {/* Search */}
    <SearchBar
     searchTerm={searchTerm}
     setSearchTerm={setSearchTerm}
     placeholder="Search boards..."
     icon={<CiSearch className="w-5 h-5" />}
    />

    {/* Analytics Cards */}
    {filteredBoards.length === 0 ? (
     <NoStateComponent
      title={searchTerm ? "No boards found" : "No boards yet"}
      description={
       searchTerm
        ? "Try adjusting your search terms to find what you're looking for."
        : "Get started by creating your first feedback board"
      }
      icon={<HiOutlineViewBoards className="w-6 h-6 text-base-content" />}
      buttonText="Create Your First Board"
      buttonLink="/dashboard/boards/new"
      showButton={!searchTerm}
     />
    ) : (
     <div className="space-y-4">
      {filteredBoards.map((board) => {
       const totalUpvotes = getTotalUpvotes(board);
       const requestCount = getRequestCount(board);
       const avgEngagement = getAvgEngagement(board);

       return (
        <AnalyticsBoardRow
         key={board.id}
         board={board}
         title={board.title}
         description={board.description || ""}
         updatedAt={board.updated_at.toString()}
         boardSlug={board.slug}
         totalUpvotes={totalUpvotes}
         requestCount={requestCount}
         avgEngagement={Number(avgEngagement)}
         visibility={board.is_public ? "Public" : "Private"}
         icon={<FiClipboard className="w-5 h-5" />}
         buttonText="View Analytics"
         buttonLink={`/dashboard/boards/${board.slug}/analytics`}
         buttonIcon={<LuEye />}
        />
       );
      })}
     </div>
    )}
   </div>
  </DashboardLayout>
 );
}

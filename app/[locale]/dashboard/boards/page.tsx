"use client";

import {useEffect, useState} from "react";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {BoardWithRequests} from "@/types";
import {HeaderComponent} from "@/components/HeaderComponent";
import {FaPlus} from "react-icons/fa6";
import {filterBoards, formatDate} from "@/utils/utility";
import {getBoards} from "@/frontend apis/apiClient";
import {NoStateComponent} from "@/components/NoState.component";
import {CiSearch} from "react-icons/ci";
import {HiOutlineViewBoards} from "react-icons/hi";
import {SearchBar} from "@/components/SearchBar.component";
import {ExpandedBoardRow} from "@/components/ExpandedBoardRow.component";

export default function BoardsPage() {
 const [boards, setBoards] = useState<BoardWithRequests[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");

 useEffect(() => {
  const fetchBoards = async () => {
   try {
    const result = await getBoards();
    setBoards(result.data || []);
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
     title="Your Boards"
     description="Manage your feedback boards and track their performance"
     buttonText="Create Board"
     buttonLink="/dashboard/boards/new"
     buttonIcon={<FaPlus className="w-4 h-4 mr-2" />}
     showButton={true}
    />

    {/* Search */}
    <SearchBar
     searchTerm={searchTerm}
     setSearchTerm={setSearchTerm}
     placeholder="Search boards..."
     icon={<CiSearch className="w-4 h-4" />}
    />

    {/* Boards Grid */}
    {filteredBoards.length === 0 ? (
     <NoStateComponent
      title={searchTerm ? "No boards found" : "No boards yet"}
      description={
       searchTerm
        ? "Try adjusting your search terms to find what you're looking for."
        : "Get started by creating your first feedback board to collect feature requests from your users."
      }
      icon={
       searchTerm ? (
        <CiSearch className="w-4 h-4" />
       ) : (
        <HiOutlineViewBoards className="w-4 h-4" />
       )
      }
      buttonText={
       searchTerm ? "Create Your First Board" : "Create Your First Board"
      }
      buttonLink="/dashboard/boards/new"
      showButton={true}
     />
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredBoards.map((board) => (
       <ExpandedBoardRow
        key={board.id}
        title={board.title}
        description={board.description || ""}
        visibility={board.is_public ? "Public" : "Private"}
        upvotes={String(
         board.feature_requests?.reduce(
          (total, req) => total + req.upvote_count,
          0
         ) || 0
        )}
        requests={String(board.feature_requests?.length || 0)}
        updatedAt={formatDate(board.updated_at)}
        boardSlug={board.slug}
        showDropdown={true}
       />
      ))}
     </div>
    )}
   </div>
  </DashboardLayout>
 );
}

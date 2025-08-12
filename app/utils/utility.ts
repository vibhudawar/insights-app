import {BoardWithRequests} from "@/types";

export const formatDate = (date: string | Date) => {
 return new Date(date).toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
 });
};

export const filterBoards = (
 boards: BoardWithRequests[],
 searchTerm: string
) => {
 return boards.filter(
  (board) =>
   board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
   board.description?.toLowerCase().includes(searchTerm.toLowerCase())
 );
};

export const getTotalUpvotes = (board: BoardWithRequests) => {
 return (
  board.feature_requests?.reduce((total, req) => total + req.upvote_count, 0) ||
  0
 );
};

export const getRequestCount = (board: BoardWithRequests) => {
 return board.feature_requests?.length || 0;
};

export const getAvgEngagement = (board: BoardWithRequests) => {
 return getRequestCount(board) > 0
  ? (getTotalUpvotes(board) / getRequestCount(board)).toFixed(1)
  : "0";
};

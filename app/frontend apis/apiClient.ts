import {CreateBoardFormData, UpdateBoardFormData, RequestStatus} from "@/types";

// =============================================================================
// DASHBOARD APIs
// =============================================================================

export const getDashboardStats = async () => {
 const response = await fetch("/api/dashboard/stats");
 if (!response.ok) {
  throw new Error("Failed to fetch dashboard stats");
 }
 return response.json();
};

// =============================================================================
// BOARD APIs
// =============================================================================

export const getBoards = async (limit?: number) => {
 const limitParam = limit ? `?limit=${limit}` : "";
 const response = await fetch(`/api/boards${limitParam}`);
 if (!response.ok) {
  throw new Error(`Failed to fetch boards: ${response.statusText}`);
 }
 return response.json();
};

export const getBoard = async (slug: string) => {
 const response = await fetch(`/api/boards/slug/${slug}`);
 if (!response.ok) {
  throw new Error("Failed to fetch board");
 }
 return response.json();
};

export const createBoard = async (boardDetails: CreateBoardFormData) => {
 const response = await fetch("/api/boards", {
  method: "POST",
  headers: {
   "Content-Type": "application/json",
  },
  body: JSON.stringify(boardDetails),
 });
 return response.json();
};

export const updateBoardDetails = async (
 slug: string,
 boardData: UpdateBoardFormData
) => {
 const response = await fetch(`/api/boards/${slug}/board`, {
  method: "PUT",
  headers: {
   "Content-Type": "application/json",
  },
  body: JSON.stringify(boardData),
 });
 if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || "Failed to update board");
 }
 return response.json();
};

export const deleteBoardWithConfirmation = async (slug: string) => {
 const response = await fetch(`/api/boards/${slug}/board`, {
  method: "DELETE",
 });
 if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || "Failed to delete board");
 }
 return response;
};

// =============================================================================
// FEATURE REQUEST APIs
// =============================================================================

export const getFeatureRequests = async ({
 slug,
 selectedStatus,
 searchTerm,
 sortBy,
 bypassCache = false,
}: {
 slug: string;
 selectedStatus: string;
 searchTerm: string;
 sortBy: string;
 bypassCache: boolean;
}) => {
 const params = new URLSearchParams();
 if (selectedStatus !== "ALL") params.append("status", selectedStatus);
 if (searchTerm) params.append("search", searchTerm);
 params.append("sortBy", sortBy);

 const fetchOptions: RequestInit = {};
 if (bypassCache) {
  fetchOptions.cache = "no-store";
  fetchOptions.headers = {
   "Cache-Control": "no-cache",
   Pragma: "no-cache",
  };
 }
 const response = await fetch(
  `/api/boards/${slug}/requests?${params}`,
  fetchOptions
 );
 if (!response.ok) {
  throw new Error(`Failed to fetch feature requests: ${response.statusText}`);
 }
 return response.json();
};

export const saveFeatureRequest = async ({
 payload,
 slug,
}: {
 payload: {
  title: string;
  description: string;
 };
 slug: string;
}) => {
 const response = await fetch(`/api/boards/${slug}/requests`, {
  method: "POST",
  body: JSON.stringify(payload),
 });
 return response.json();
};

export const updateFeatureRequest = async (
 requestId: string,
 data: {
  title?: string;
  description?: string | null;
  status?: RequestStatus;
 }
) => {
 const response = await fetch(`/api/feature-requests/${requestId}`, {
  method: "PUT",
  headers: {
   "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
 });
 return response.json();
};

export const upvoteFeatureRequest = async ({
 requestId,
 userId,
}: {
 requestId: string;
 userId: string;
}) => {
 const response = await fetch(`/api/feature-requests/${requestId}/upvote`, {
  method: "POST",
  body: JSON.stringify({userId}),
 });
 return response.json();
};

export const deleteFeatureRequest = async ({
 requestId,
}: {
 requestId: string;
}) => {
 const response = await fetch(`/api/feature-requests/${requestId}`, {
  method: "DELETE",
 });
 return response;
};

export const updateFeatureStatus = async (
 requestId: string,
 status: string
) => {
 const response = await fetch(`/api/feature-requests/${requestId}/status`, {
  method: "PUT",
  body: JSON.stringify({status}),
 });
 return response;
};

// =============================================================================
// COMMENT APIs
// =============================================================================

export const getComments = async (requestId: string) => {
 const response = await fetch(`/api/feature-requests/${requestId}/comments`);
 if (!response.ok) {
  throw new Error("Failed to fetch comments");
 }
 return response.json();
};

export const postComment = async (
 requestId: string,
 content: string,
 parentCommentId?: string
) => {
 const response = await fetch(`/api/feature-requests/${requestId}/comments`, {
  method: "POST",
  body: JSON.stringify({content, parentCommentId}),
 });
 if (!response.ok) {
  throw new Error("Failed to post comment");
 }
 return response.json();
};

export const deleteComment = async (requestId: string, commentId: string) => {
 const response = await fetch(
  `/api/feature-requests/${requestId}/comments/${commentId}`,
  {
   method: "DELETE",
  }
 );
 if (!response.ok) {
  throw new Error("Failed to delete comment");
 }
 return response;
};

// =============================================================================
// ANALYTICS APIs
// =============================================================================

export const getBoardAnalytics = async (slug: string) => {
 const response = await fetch(`/api/boards/${slug}/analytics`);
 if (!response.ok) {
  throw new Error("Failed to fetch analytics");
 }
 return response.json();
};

// =============================================================================
// USER APIs
// =============================================================================

export const updateUserSettings = async (settings: Record<string, unknown>) => {
 const response = await fetch("/api/user/settings", {
  method: "PUT",
  headers: {
   "Content-Type": "application/json",
  },
  body: JSON.stringify(settings),
 });
 if (!response.ok) {
  throw new Error("Failed to update settings");
 }
 return response.json();
};

export const updateUserProfile = async (profile: Record<string, unknown>) => {
 const response = await fetch("/api/user/profile", {
  method: "PUT",
  headers: {
   "Content-Type": "application/json",
  },
  body: JSON.stringify(profile),
 });
 if (!response.ok) {
  throw new Error("Failed to update profile");
 }
 return response.json();
};

export const deleteUserAccount = async () => {
 const response = await fetch("/api/user/delete", {
  method: "DELETE",
 });
 if (!response.ok) {
  throw new Error("Failed to delete account");
 }
 return response.json();
};

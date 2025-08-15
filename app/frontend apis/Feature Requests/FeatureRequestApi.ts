/**
 * @deprecated This file is deprecated. All API functions have been moved to @/frontend apis/apiClient.ts
 * Please import from @/frontend apis/apiClient instead.
 * This file is kept for reference and will be removed in a future update.
 */

/*
// Feature Status API
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

// Comments API
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
*/

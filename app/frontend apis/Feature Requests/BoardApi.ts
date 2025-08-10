import {FeatureRequestWithDetails} from "@/types";

export const getBoard = async (slug: string) => {
 const response = await fetch(`/api/boards/slug/${slug}`);
 if (!response.ok) {
  throw new Error("Failed to fetch board");
 }
 return response.json();
};

// list feature requests
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
  throw new Error("Failed to fetch feature requests");
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

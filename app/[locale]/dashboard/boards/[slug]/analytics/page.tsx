"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {getBoardAnalytics} from "@/frontend apis/apiClient";

interface BoardAnalytics {
 total_requests: number;
 total_upvotes: number;
 total_comments: number;
 status_breakdown: {
  NEW: number;
  IN_PROGRESS: number;
  SHIPPED: number;
  CANCELLED: number;
 };
 recent_activity: {
  date: string;
  requests_count: number;
  upvotes_count: number;
 }[];
 top_requests: {
  id: string;
  title: string;
  upvote_count: number;
  comment_count: number;
  status: string;
  created_at: string;
 }[];
 board_info: {
  title: string;
  description: string;
  created_at: string;
  is_public: boolean;
 };
}

export default function BoardAnalyticsPage() {
 const params = useParams();
 const slug = params.slug as string;

 const [analytics, setAnalytics] = useState<BoardAnalytics | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState("");

 useEffect(() => {
  const fetchAnalytics = async () => {
   try {
    const data = await getBoardAnalytics(slug as string);
    setAnalytics(data.data);
   } catch (err) {
    setError("Failed to load analytics data");
   } finally {
    setIsLoading(false);
   }
  };

  if (slug) {
   fetchAnalytics();
  }
 }, [slug]);

 const getStatusBadge = (status: string) => {
  const statusColors = {
   NEW: "badge-info",
   IN_PROGRESS: "badge-warning",
   SHIPPED: "badge-success",
   CANCELLED: "badge-error",
  };
  const statusLabels = {
   NEW: "New",
   IN_PROGRESS: "In Progress",
   SHIPPED: "Shipped",
   CANCELLED: "Cancelled",
  };
  return (
   <div
    className={`badge badge-sm ${
     statusColors[status as keyof typeof statusColors] || "badge-ghost"
    }`}
   >
    {statusLabels[status as keyof typeof statusLabels] || status}
   </div>
  );
 };

 const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
   year: "numeric",
   month: "short",
   day: "numeric",
  });
 };

 if (isLoading) {
  return (
   <DashboardLayout>
    <div className="flex items-center justify-center min-h-screen">
     <span className="loading loading-spinner loading-lg"></span>
    </div>
   </DashboardLayout>
  );
 }

 if (error || !analytics) {
  return (
   <DashboardLayout>
    <div className="flex items-center justify-center min-h-screen">
     <div className="text-center">
      <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-6">
       <svg
        className="w-10 h-10 text-base-content/50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
       >
        <path
         strokeLinecap="round"
         strokeLinejoin="round"
         strokeWidth={2}
         d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
       </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">Analytics Not Available</h1>
      <p className="text-base-content/70 mb-4">
       {error || "Unable to load analytics data for this board."}
      </p>
      <Link href="/dashboard" className="btn btn-primary">
       Back to Dashboard
      </Link>
     </div>
    </div>
   </DashboardLayout>
  );
 }

 return (
  <DashboardLayout>
   <div className="container mx-auto px-4 py-8">
    <div className="max-w-7xl mx-auto">
     {/* Header */}
     <div className="flex items-center justify-between mb-8">
      <div>
       <h1 className="text-3xl font-bold text-base-content mb-2">
        Analytics: {analytics.board_info.title}
       </h1>
       <div className="breadcrumbs text-sm">
        <ul>
         <li>
          <Link href="/dashboard">Dashboard</Link>
         </li>
         <li>
          <Link href="/dashboard/boards">Boards</Link>
         </li>
         <li>Analytics</li>
        </ul>
       </div>
      </div>
      <div className="flex gap-2">
       <Link
        href={`/dashboard/boards/${slug}/edit`}
        className="btn btn-outline btn-sm"
       >
        Edit Board
       </Link>
       <Link
        href={`/b/${slug}`}
        className="btn btn-primary btn-sm"
        target="_blank"
       >
        View Public Board
        <svg
         className="w-4 h-4 ml-1"
         fill="none"
         stroke="currentColor"
         viewBox="0 0 24 24"
        >
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
         />
        </svg>
       </Link>
      </div>
     </div>

     {/* Overview Stats */}
     <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-8">
      <div className="stat">
       <div className="stat-figure text-primary">
        <svg
         className="w-8 h-8"
         fill="none"
         stroke="currentColor"
         viewBox="0 0 24 24"
        >
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
         />
        </svg>
       </div>
       <div className="stat-title">Total Requests</div>
       <div className="stat-value text-primary">{analytics.total_requests}</div>
       <div className="stat-desc">All feature requests</div>
      </div>

      <div className="stat">
       <div className="stat-figure text-secondary">
        <svg
         className="w-8 h-8"
         fill="none"
         stroke="currentColor"
         viewBox="0 0 24 24"
        >
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
         />
        </svg>
       </div>
       <div className="stat-title">Total Upvotes</div>
       <div className="stat-value text-secondary">
        {analytics.total_upvotes}
       </div>
       <div className="stat-desc">Community engagement</div>
      </div>

      <div className="stat">
       <div className="stat-figure text-accent">
        <svg
         className="w-8 h-8"
         fill="none"
         stroke="currentColor"
         viewBox="0 0 24 24"
        >
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
         />
        </svg>
       </div>
       <div className="stat-title">Total Comments</div>
       <div className="stat-value text-accent">{analytics.total_comments}</div>
       <div className="stat-desc">User discussions</div>
      </div>

      <div className="stat">
       <div className="stat-figure text-info">
        <svg
         className="w-8 h-8"
         fill="none"
         stroke="currentColor"
         viewBox="0 0 24 24"
        >
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
         />
        </svg>
       </div>
       <div className="stat-title">Avg. Engagement</div>
       <div className="stat-value text-info">
        {analytics.total_requests > 0
         ? (
            (analytics.total_upvotes + analytics.total_comments) /
            analytics.total_requests
           ).toFixed(1)
         : "0"}
       </div>
       <div className="stat-desc">Per request</div>
      </div>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Status Breakdown */}
      <div className="card bg-base-100 shadow">
       <div className="card-body">
        <h2 className="card-title mb-4">Request Status Breakdown</h2>
        <div className="space-y-3">
         {Object.entries(analytics.status_breakdown).map(([status, count]) => {
          const percentage =
           analytics.total_requests > 0
            ? ((count / analytics.total_requests) * 100).toFixed(1)
            : "0";

          return (
           <div key={status} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
             {getStatusBadge(status)}
             <span className="text-sm font-medium">{count} requests</span>
            </div>
            <div className="text-sm text-base-content/70">{percentage}%</div>
           </div>
          );
         })}
        </div>

        {/* Visual Progress Bars */}
        <div className="space-y-2 mt-4">
         {Object.entries(analytics.status_breakdown).map(([status, count]) => {
          const percentage =
           analytics.total_requests > 0
            ? (count / analytics.total_requests) * 100
            : 0;

          const progressColors = {
           NEW: "progress-info",
           IN_PROGRESS: "progress-warning",
           SHIPPED: "progress-success",
           CANCELLED: "progress-error",
          };

          return (
           <div key={status}>
            <progress
             className={`progress ${
              progressColors[status as keyof typeof progressColors]
             } w-full`}
             value={percentage}
             max="100"
            ></progress>
           </div>
          );
         })}
        </div>
       </div>
      </div>

      {/* Board Information */}
      <div className="card bg-base-100 shadow">
       <div className="card-body">
        <h2 className="card-title mb-4">Board Information</h2>
        <div className="space-y-4">
         <div>
          <div className="text-sm text-base-content/70 mb-1">Board Name</div>
          <div className="font-medium">{analytics.board_info.title}</div>
         </div>

         {analytics.board_info.description && (
          <div>
           <div className="text-sm text-base-content/70 mb-1">Description</div>
           <div className="text-sm">{analytics.board_info.description}</div>
          </div>
         )}

         <div>
          <div className="text-sm text-base-content/70 mb-1">Created</div>
          <div className="font-medium">
           {formatDate(analytics.board_info.created_at)}
          </div>
         </div>

         <div>
          <div className="text-sm text-base-content/70 mb-1">Status</div>
          <div className="flex items-center gap-2">
           <div
            className={`badge ${
             analytics.board_info.is_public ? "badge-success" : "badge-warning"
            }`}
           >
            {analytics.board_info.is_public ? "Public" : "Private"}
           </div>
          </div>
         </div>
        </div>
       </div>
      </div>
     </div>

     {/* Top Requests */}
     {analytics.top_requests.length > 0 && (
      <div className="card bg-base-100 shadow mb-8">
       <div className="card-body">
        <h2 className="card-title mb-4">Top Feature Requests</h2>
        <div className="overflow-x-auto">
         <table className="table table-zebra">
          <thead>
           <tr>
            <th>Request</th>
            <th>Status</th>
            <th>Upvotes</th>
            <th>Comments</th>
            <th>Created</th>
           </tr>
          </thead>
          <tbody>
           {analytics.top_requests.map((request) => (
            <tr key={request.id}>
             <td>
              <div className="font-medium max-w-md truncate">
               {request.title}
              </div>
             </td>
             <td>{getStatusBadge(request.status)}</td>
             <td>
              <div className="flex items-center gap-1">
               <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
               >
                <path
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 strokeWidth={2}
                 d="M5 15l7-7 7 7"
                />
               </svg>
               {request.upvote_count}
              </div>
             </td>
             <td>
              <div className="flex items-center gap-1">
               <svg
                className="w-4 h-4 text-base-content/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
               >
                <path
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 strokeWidth={2}
                 d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
               </svg>
               {request.comment_count}
              </div>
             </td>
             <td className="text-sm text-base-content/70">
              {formatDate(request.created_at)}
             </td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       </div>
      </div>
     )}

     {/* Recent Activity */}
     {analytics.recent_activity.length > 0 && (
      <div className="card bg-base-100 shadow">
       <div className="card-body">
        <h2 className="card-title mb-4">Recent Activity (Last 30 Days)</h2>
        <div className="space-y-3">
         {analytics.recent_activity.slice(0, 10).map((activity) => (
          <div
           key={activity.date}
           className="flex items-center justify-between py-2"
          >
           <div className="font-medium">{formatDate(activity.date)}</div>
           <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
             <svg
              className="w-4 h-4 text-info"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
             >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
             </svg>
             {activity.requests_count} requests
            </div>
            <div className="flex items-center gap-1">
             <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
             >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M5 15l7-7 7 7"
              />
             </svg>
             {activity.upvotes_count} upvotes
            </div>
           </div>
          </div>
         ))}
        </div>
       </div>
      </div>
     )}
    </div>
   </div>
  </DashboardLayout>
 );
}

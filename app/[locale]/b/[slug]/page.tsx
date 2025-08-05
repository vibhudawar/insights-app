"use client";

import {useEffect, useState, useCallback} from "react";
import {useParams} from "next/navigation";
import {useSession} from "next-auth/react";
import {Link} from "@/i18n/navigation";
import {useTranslations} from "next-intl";
import {
 BoardWithRequests,
 FeatureRequestWithDetails,
 RequestStatus,
} from "@/types";
import {FeatureRequestModal} from "@/components/FeatureRequestModal";
import {LanguageSwitcher} from "@/components/LanguageSwitcher";
import { FaChevronUp } from "react-icons/fa6";

// Status options will be translated dynamically in component

// Sort options will be translated dynamically in component

export default function PublicBoardPage() {
 const params = useParams();
 const slug = params.slug as string;
 const { data: session } = useSession();
 const t = useTranslations();

 const statusOptions = [
  {value: "ALL", label: t('publicBoard.status.all'), color: "badge-ghost"},
  {value: "NEW", label: t('publicBoard.status.new'), color: "badge-info"},
  {value: "IN_PROGRESS", label: t('publicBoard.status.inProgress'), color: "badge-warning"},
  {value: "SHIPPED", label: t('publicBoard.status.shipped'), color: "badge-success"},
  {value: "CANCELLED", label: t('publicBoard.status.cancelled'), color: "badge-error"},
 ];

 const sortOptions = [
  {value: "upvotes", label: t('publicBoard.sort.mostUpvoted')},
  {value: "newest", label: t('publicBoard.sort.newest')},
  {value: "oldest", label: t('publicBoard.sort.oldest')},
 ];

 const [board, setBoard] = useState<BoardWithRequests | null>(null);
 const [featureRequests, setFeatureRequests] = useState<
  FeatureRequestWithDetails[]
 >([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState("");

 // Filters
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedStatus, setSelectedStatus] = useState("ALL");
 const [sortBy, setSortBy] = useState("upvotes");

 // Form state
 const [showSubmitForm, setShowSubmitForm] = useState(false);
 const [submitForm, setSubmitForm] = useState({
  title: "",
  description: "",
  submitterName: "",
  submitterEmail: "",
 });
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitError, setSubmitError] = useState("");

 // User identifier for upvoting (stored in localStorage)
 const [userIdentifier, setUserIdentifier] = useState("");

 // Modal state
 const [selectedRequest, setSelectedRequest] =
  useState<FeatureRequestWithDetails | null>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);

 useEffect(() => {
  // Get or create user identifier for upvoting
  let identifier = localStorage.getItem("insights_user_id");
  if (!identifier) {
   identifier = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
   localStorage.setItem("insights_user_id", identifier);
  }
  setUserIdentifier(identifier);
 }, []);

 useEffect(() => {
  const fetchBoardData = async () => {
   try {
    // Fetch board info
    const boardResponse = await fetch(`/api/boards/slug/${slug}`);
    if (!boardResponse.ok) {
     throw new Error("Board not found");
    }
    const boardData = await boardResponse.json();
    setBoard(boardData.data);
   } catch {
    setError("Board not found or is private");
   } finally {
    setIsLoading(false);
   }
  };

  if (slug) {
   fetchBoardData();
  }
 }, [slug]);

 const fetchFeatureRequests = useCallback(async () => {
  try {
   const params = new URLSearchParams();
   if (selectedStatus !== "ALL") params.append("status", selectedStatus);
   if (searchTerm) params.append("search", searchTerm);
   params.append("sortBy", sortBy);

   const response = await fetch(`/api/boards/${slug}/requests?${params}`);
   if (response.ok) {
    const data = await response.json();
    setFeatureRequests(data.data || []);
   }
  } catch (error) {
   console.error("Error fetching feature requests:", error);
  }
 }, [slug, selectedStatus, searchTerm, sortBy]);

 useEffect(() => {
  if (board) {
   fetchFeatureRequests();
  }
 }, [selectedStatus, searchTerm, sortBy, board, fetchFeatureRequests]);

 const handleSubmitRequest = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSubmitError("");

  try {
   const response = await fetch(`/api/boards/${slug}/requests`, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     title: submitForm.title,
     description: submitForm.description,
     submitterName: submitForm.submitterName,
     submitterEmail: submitForm.submitterEmail,
    }),
   });

   const result = await response.json();

   if (result.success) {
    setSubmitForm({
     title: "",
     description: "",
     submitterName: "",
     submitterEmail: "",
    });
    setShowSubmitForm(false);
    fetchFeatureRequests(); // Refresh the list
   } else {
    setSubmitError(result.error || "Failed to submit request");
   }
  } catch {
   setSubmitError("An error occurred. Please try again.");
  } finally {
   setIsSubmitting(false);
  }
 };

 const handleUpvote = async (requestId: string) => {
  if (!userIdentifier) return;

  try {
   const response = await fetch(`/api/feature-requests/${requestId}/upvote`, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     userIdentifier,
    }),
   });

   if (response.ok) {
    fetchFeatureRequests(); // Refresh to show updated counts
   }
  } catch (error) {
   console.error("Error toggling upvote:", error);
  }
 };

 const handleRequestClick = (request: FeatureRequestWithDetails) => {
  setSelectedRequest(request);
  setIsModalOpen(true);
 };

 const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedRequest(null);
 };

 const handleStatusUpdate = (requestId: string, newStatus: string) => {
  // Update the local state to reflect the change immediately
  setFeatureRequests(prev => 
   prev.map(req => 
    req.id === requestId ? { ...req, status: newStatus as RequestStatus } : req
   )
  );
  
  // Update the selected request if it's the one being updated
  if (selectedRequest && selectedRequest.id === requestId) {
   setSelectedRequest({ ...selectedRequest, status: newStatus as RequestStatus });
  }
 };

 const getStatusBadge = (status: RequestStatus) => {
  const statusOption = statusOptions.find((opt) => opt.value === status);
  return (
   <div className={`badge badge-sm ${statusOption?.color || "badge-ghost"}`}>
    {statusOption?.label || status}
   </div>
  );
 };

 const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
   year: "numeric",
   month: "short",
   day: "numeric",
  });
 };

 const getBoardThemeStyles = () => {
  if (!board?.theme_config) return {};

  try {
   const themeConfig =
    typeof board.theme_config === "string"
     ? JSON.parse(board.theme_config)
     : board.theme_config;

   return {
    primaryColor: themeConfig.primaryColor || "",
    backgroundColor: themeConfig.backgroundColor || "",
    textColor: themeConfig.textColor || "",
   };
  } catch {
   return {};
  }
 };

 if (isLoading) {
  return (
   <div className="min-h-screen flex items-center justify-center">
    <span className="loading loading-spinner loading-lg"></span>
   </div>
  );
 }

 if (error || !board) {
  return (
   <div className="min-h-screen flex items-center justify-center bg-base-100">
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
        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.462-.881-6.065-2.33M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
       />
      </svg>
     </div>
     <h1 className="text-2xl font-bold mb-2">{t('publicBoard.boardNotFound')}</h1>
     <p className="text-base-content/70 mb-4">
      {t('publicBoard.boardNotFoundMessage')}
     </p>
     <Link href="/" className="btn btn-primary">
      {t('publicBoard.goHome')}
     </Link>
    </div>
   </div>
  );
 }

 const themeStyles = getBoardThemeStyles();

 return (
  <div
   className="min-h-screen bg-base-100"
   style={{backgroundColor: themeStyles.backgroundColor}}
  >
   {/* Header */}
   <div
    className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-300"
    style={{
     backgroundColor: themeStyles.primaryColor
      ? `${themeStyles.primaryColor}15`
      : undefined,
     borderColor: themeStyles.primaryColor
      ? `${themeStyles.primaryColor}30`
      : undefined,
    }}
   >
    <div className="container mx-auto px-4 py-8">
     <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
       <h1
        className="text-4xl font-bold text-base-content"
        style={{color: themeStyles.textColor}}
       >
        {board.title}
       </h1>
       <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <div
         className="badge badge-sm badge-primary"
         style={{
          backgroundColor: themeStyles.primaryColor,
          borderColor: themeStyles.primaryColor,
         }}
        >
         {t('board.publicBoard')}
        </div>
       </div>
      </div>
      {board.description && (
       <p
        className="text-lg text-base-content/80 mb-6"
        style={{
         color: themeStyles.textColor
          ? `${themeStyles.textColor}CC`
          : undefined,
        }}
       >
        {board.description}
       </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
       <button
        onClick={() => setShowSubmitForm(true)}
        className="btn btn-primary"
        style={{
         backgroundColor: themeStyles.primaryColor,
         borderColor: themeStyles.primaryColor,
        }}
       >
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
        {t('publicBoard.submitRequest')}
       </button>
       <div className="stats shadow-sm bg-base-100">
        <div className="stat py-2 px-4">
         <div className="stat-value text-sm">{featureRequests.length}</div>
         <div className="stat-desc">{t('publicBoard.totalRequests')}</div>
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Filters */}
   <div className="container mx-auto px-4 py-6">
    <div className="max-w-4xl mx-auto">
     <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="form-control flex-1">
       <div className="input-group">
        <input
         type="text"
         placeholder={t('publicBoard.searchRequests')}
         className="input input-bordered flex-1"
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="btn btn-square btn-ghost">
         <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
         >
          <path
           strokeLinecap="round"
           strokeLinejoin="round"
           strokeWidth={2}
           d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
         </svg>
        </span>
       </div>
      </div>

      {/* Status Filter */}
      <select
       className="select select-bordered"
       value={selectedStatus}
       onChange={(e) => setSelectedStatus(e.target.value)}
      >
       {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
         {option.label}
        </option>
       ))}
      </select>

      {/* Sort */}
      <select
       className="select select-bordered"
       value={sortBy}
       onChange={(e) => setSortBy(e.target.value)}
      >
       {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
         {option.label}
        </option>
       ))}
      </select>
     </div>

     {/* Feature Requests List */}
     {featureRequests.length === 0 ? (
      <div className="text-center py-16">
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
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
         />
        </svg>
       </div>
       <h3 className="text-xl font-semibold text-base-content mb-2">
        {t('publicBoard.noRequestsYet')}
       </h3>
       <p className="text-base-content/70 mb-6">
        {t('publicBoard.beTheFirst')}
       </p>
       <button
        onClick={() => setShowSubmitForm(true)}
        className="btn btn-primary"
       >
        {t('publicBoard.submitFirstRequest')}
       </button>
      </div>
     ) : (
      <div className="space-y-4">
       {featureRequests.map((request) => (
        <div
         key={request.id}
         className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => handleRequestClick(request)}
        >
         <div className="card-body">
          <div className="flex items-start gap-4">
           {/* Upvote Section */}
           <div className="flex flex-col items-center min-w-0">
            <button
             onClick={(e) => {
              e.stopPropagation();
              handleUpvote(request.id);
             }}
             className="btn btn-ghost btn-sm flex flex-col items-center p-2 hover:bg-primary/10"
            >
             <FaChevronUp className="w-5 h-5 mb-1" />
             <span className="text-xs font-bold">{request.upvote_count}</span>
            </button>
           </div>

           {/* Content */}
           <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
             <h3 className="text-lg font-semibold text-base-content">
              {request.title}
             </h3>
             {request.status !== "NEW" && getStatusBadge(request.status)}
            </div>

            {request.description && (
             <p className="text-base-content/80 mb-3 line-clamp-3">
              {request.description}
             </p>
            )}

            <div className="flex items-center gap-4 text-sm text-base-content/60">
             <span>
              {request.submitter_name ? `By ${request.submitter_name}` : t('publicBoard.byAnonymous')} •{" "}
              {formatDate(request.created_at)}
             </span>
             {request.comment_count > 0 && (
              <span className="flex items-center gap-1">
               <svg
                className="w-4 h-4"
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
               {request.comment_count} {t('publicBoard.comments')}
              </span>
             )}
            </div>
           </div>
          </div>
         </div>
        </div>
       ))}
      </div>
     )}
    </div>
   </div>

   {/* Submit Request Modal */}
   {showSubmitForm && (
    <div className="modal modal-open">
     <div className="modal-box max-w-2xl">
      <div className="flex items-center justify-between mb-6">
       <h3 className="font-bold text-lg">{t('publicBoard.submitFeatureRequest')}</h3>
       <button
        onClick={() => setShowSubmitForm(false)}
        className="btn btn-sm btn-circle btn-ghost"
       >
        ✕
       </button>
      </div>

      {submitError && (
       <div className="alert alert-error mb-4">
        <svg
         xmlns="http://www.w3.org/2000/svg"
         className="stroke-current shrink-0 h-6 w-6"
         fill="none"
         viewBox="0 0 24 24"
        >
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
         />
        </svg>
        <span>{submitError}</span>
       </div>
      )}

      <form onSubmit={handleSubmitRequest}>
       <div className="form-control mb-4">
        <label className="label">
         <span className="label-text font-medium">{t('publicBoard.featureTitle')} *</span>
        </label>
        <input
         type="text"
         placeholder={t('publicBoard.featureTitlePlaceholder')}
         className="input input-bordered"
         value={submitForm.title}
         onChange={(e) =>
          setSubmitForm((prev) => ({...prev, title: e.target.value}))
         }
         required
        />
       </div>

       <div className="form-control mb-4">
        <label className="label">
         <span className="label-text font-medium">{t('board.description')}</span>
        </label>
        <textarea
         placeholder={t('publicBoard.descriptionPlaceholder')}
         className="textarea textarea-bordered h-24"
         value={submitForm.description}
         onChange={(e) =>
          setSubmitForm((prev) => ({...prev, description: e.target.value}))
         }
        />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="form-control">
         <label className="label">
          <span className="label-text font-medium">{t('publicBoard.yourName')}</span>
         </label>
         <input
          type="text"
          placeholder={t('publicBoard.yourNamePlaceholder')}
          className="input input-bordered"
          value={submitForm.submitterName}
          onChange={(e) =>
           setSubmitForm((prev) => ({...prev, submitterName: e.target.value}))
          }
         />
        </div>

        <div className="form-control">
         <label className="label">
          <span className="label-text font-medium">{t('publicBoard.yourEmail')} *</span>
         </label>
         <input
          type="email"
          placeholder={t('publicBoard.yourEmailPlaceholder')}
          className="input input-bordered"
          value={submitForm.submitterEmail}
          onChange={(e) =>
           setSubmitForm((prev) => ({...prev, submitterEmail: e.target.value}))
          }
          required
         />
        </div>
       </div>

       <div className="modal-action">
        <button
         type="button"
         onClick={() => setShowSubmitForm(false)}
         className="btn btn-ghost"
        >
         {t('publicBoard.cancel')}
        </button>
        <button
         type="submit"
         className="btn btn-primary"
         disabled={
          isSubmitting || !submitForm.title || !submitForm.submitterEmail
         }
        >
         {isSubmitting ? (
          <>
           <span className="loading loading-spinner loading-sm"></span>
           {t('publicBoard.submitting')}
          </>
         ) : (
          t('publicBoard.submitRequest')
         )}
        </button>
       </div>
      </form>
     </div>
    </div>
   )}

   {/* Feature Request Detail Modal */}
   {selectedRequest && (
    <FeatureRequestModal
     request={selectedRequest}
     isOpen={isModalOpen}
     onClose={handleCloseModal}
     onUpvote={handleUpvote}
     userIdentifier={userIdentifier}
     isAdmin={(session?.user as { id?: string })?.id === board?.creator_id}
     onStatusUpdate={handleStatusUpdate}
    />
   )}
  </div>
 );
}

"use client";

import {useEffect, useState, useCallback} from "react";
import {useParams} from "next/navigation";
import {signIn, signOut} from "next-auth/react";
import {Link} from "@/i18n/navigation";
import {useTranslations} from "next-intl";
import {
 BoardWithRequests,
 FeatureRequestWithDetails,
 RequestStatus,
} from "@/types";
import {FeatureRequestModal} from "@/components/FeatureRequestModal";
import {FeatureRequestCard} from "@/components/FeatureRequestCard";
import {EditFeatureRequestModal} from "@/components/EditFeatureRequestModal";
import {LanguageSwitcher} from "@/components/LanguageSwitcher";
import {AuthModal} from "@/components/AuthModal";
import {useAuthAction} from "@/hooks/useAuthAction";
import {
 FaUser,
 FaRightToBracket,
 FaArrowRightFromBracket,
} from "react-icons/fa6";
import {toast} from "@/utils/toast";
import {useCurrentUser} from "@/hooks/useCurrentUser";
import Image from "next/image";
import {VscError} from "react-icons/vsc";
import {HiOutlineBell} from "react-icons/hi";
import {MdErrorOutline} from "react-icons/md";
import {
 deleteFeatureRequest,
 getBoard,
 getFeatureRequests,
 saveFeatureRequest,
 upvoteFeatureRequest,
} from "@/frontend apis/Feature Requests/BoardApi";

export default function PublicBoardPage() {
 const params = useParams();
 const slug = params.slug as string;
 const user = useCurrentUser();
 const userId = user?.id;

 const t = useTranslations();

 const statusOptions = [
  {value: "ALL", label: t("publicBoard.status.all"), color: "badge-ghost"},
  {value: "NEW", label: t("publicBoard.status.new"), color: "badge-info"},
  {
   value: "IN_PROGRESS",
   label: t("publicBoard.status.inProgress"),
   color: "badge-warning",
  },
  {
   value: "SHIPPED",
   label: t("publicBoard.status.shipped"),
   color: "badge-success",
  },
  {
   value: "CANCELLED",
   label: t("publicBoard.status.cancelled"),
   color: "badge-error",
  },
 ];

 const sortOptions = [
  {value: "upvotes", label: t("publicBoard.sort.mostUpvoted")},
  {value: "newest", label: t("publicBoard.sort.newest")},
  {value: "oldest", label: t("publicBoard.sort.oldest")},
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
 });
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitError, setSubmitError] = useState("");

 // User identifier for upvoting (stored in localStorage)setUserIdentifier] = useState("");

 // Add this new state to track which requests are upvoted by current user
 const [upvotedRequests, setUpvotedRequests] = useState<Set<string>>(new Set());
 const [upvoteCount, setUpvoteCount] = useState<number>(0);

 // Modal state
 const [selectedRequest, setSelectedRequest] =
  useState<FeatureRequestWithDetails | null>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);

 // Authentication state
 const [showAuthModal, setShowAuthModal] = useState(false);
 const {executeWithAuth} = useAuthAction({
  requireAuthMessage: t("auth.signInToSubmitMessage"),
 });

 // Edit feature request state
 const [editingRequest, setEditingRequest] =
  useState<FeatureRequestWithDetails | null>(null);

 useEffect(() => {
  const fetchBoardData = async () => {
   try {
    const boardResponse = await getBoard(slug);
    setBoard(boardResponse.data);
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

 const fetchFeatureRequests = useCallback(
  async (bypassCache = false) => {
   try {
    const response: FeatureRequestWithDetails[] = await getFeatureRequests({
     slug,
     selectedStatus,
     searchTerm,
     sortBy,
     bypassCache,
    });

    setFeatureRequests(response.data || []);

    // Update upvoted requests set based on session user ID
    if (userId) {
     const upvotedSet = new Set<string>();
     response.data?.forEach((request: FeatureRequestWithDetails) => {
      const hasUpvoted = request.upvotes?.some(
       (upvote: {user_id: string}) => upvote.user_id === userId
      );
      if (hasUpvoted) {
       upvotedSet.add(request.id);
      }
     });
     setUpvotedRequests(upvotedSet);
    }
   } catch (error) {
    console.error("Error fetching feature requests:", error);
   }
  },
  [slug, selectedStatus, searchTerm, sortBy, userId]
 );

 useEffect(() => {
  if (board) {
   fetchFeatureRequests();
  }
 }, [selectedStatus, searchTerm, sortBy, board, fetchFeatureRequests]);

 const handleSubmitRequest = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSubmitError("");

  // Store form data before clearing
  const requestData = {
   title: submitForm.title,
   description: submitForm.description,
  };

  // Optimistic update - immediately add to UI
  const optimisticRequest: FeatureRequestWithDetails = {
   id: `temp-${Date.now()}`,
   board_id: board?.id || "",
   submitter_id: userId || null,
   submitter_email: user?.email || null,
   submitter_name: user?.name || null,
   title: requestData.title,
   description: requestData.description,
   status: "NEW" as const,
   upvote_count: 0,
   comment_count: 0,
   created_at: new Date(),
   updated_at: new Date(),
   upvotes: [],
   board: board!,
   comments: [],
  };

  // Add optimistic request to the list
  setFeatureRequests((prev) => [optimisticRequest, ...prev]);
  setSubmitForm({
   title: "",
   description: "",
  });
  setShowSubmitForm(false);

  try {
   const response = await saveFeatureRequest({
    payload: requestData,
    slug,
   });

   if (response.success) {
    // Replace optimistic request with real data
    fetchFeatureRequests(true); // Refresh the list with cache bypass
    toast.success("Feature request submitted successfully!");
   } else {
    // Remove optimistic request on error and restore form
    setFeatureRequests((prev) =>
     prev.filter((req) => req.id !== optimisticRequest.id)
    );
    setSubmitForm(requestData); // Restore form data
    setSubmitError(response.error || "Failed to submit request");
    setShowSubmitForm(true); // Reopen form to let user retry
   }
  } catch {
   // Remove optimistic request on network error and restore form
   setFeatureRequests((prev) =>
    prev.filter((req) => req.id !== optimisticRequest.id)
   );
   setSubmitForm(requestData); // Restore form data
   setSubmitError("An error occurred. Please try again.");
   setShowSubmitForm(true); // Reopen form to let user retry
  } finally {
   setIsSubmitting(false);
  }
 };

 const handleUpvote = async (requestId: string) => {
  if (!userId) return;

  try {
   const result = await upvoteFeatureRequest({
    requestId,
    userId,
   });

   // Update local upvoted state immediately
   setUpvotedRequests((prev) => {
    const newSet = new Set(prev);
    if (result.data.upvoted) {
     newSet.add(requestId);
     setUpvoteCount(result.data.upvote_count);
    } else {
     newSet.delete(requestId);
     setUpvoteCount(result.data.upvote_count);
    }
    return newSet;
   });

   fetchFeatureRequests(true);
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
  setFeatureRequests((prev) =>
   prev.map((req) =>
    req.id === requestId ? {...req, status: newStatus as RequestStatus} : req
   )
  );

  // Update the selected request if it's the one being updated
  if (selectedRequest && selectedRequest.id === requestId) {
   setSelectedRequest({...selectedRequest, status: newStatus as RequestStatus});
  }
 };

 // Authentication handlers
 const handleSignIn = () => {
  signIn("google");
 };

 const handleSignOut = () => {
  signOut();
 };

 const handleEditRequest = (request: FeatureRequestWithDetails) => {
  setEditingRequest(request);
 };

 const handleDeleteRequest = async (requestId: string) => {
  if (
   !window.confirm(
    "Are you sure you want to delete this feature request? This action cannot be undone."
   )
  ) {
   return;
  }

  try {
   const response = await deleteFeatureRequest({requestId});

   if (response.ok) {
    fetchFeatureRequests(true); // Refresh the list
    toast.success("Feature request deleted successfully");
   } else {
    const errorData = await response.json();
    toast.error(errorData.error || "Failed to delete feature request");
   }
  } catch (error) {
   console.error("Error deleting feature request:", error);
   toast.error("An error occurred while deleting the feature request");
  }
 };

 const handleCloseEditRequest = () => {
  setEditingRequest(null);
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
      <MdErrorOutline className="w-10 h-10 text-base-content/50" />
     </div>
     <h1 className="text-2xl font-bold mb-2">
      {t("publicBoard.boardNotFound")}
     </h1>
     <p className="text-base-content/70 mb-4">
      {t("publicBoard.boardNotFoundMessage")}
     </p>
     <Link href="/" className="btn btn-primary">
      {t("publicBoard.goHome")}
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

        {/* Authentication Button */}
        {user ? (
         <div className="dropdown dropdown-end">
          <div
           tabIndex={0}
           role="button"
           className="btn btn-circle btn-sm btn-outline"
          >
           <FaUser className="w-4 h-4" />
          </div>
          <ul
           tabIndex={0}
           className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
           <li className="menu-title">
            <span>{user?.name || t("auth.user")}</span>
           </li>
           <li>
            <a onClick={handleSignOut}>
             <FaArrowRightFromBracket className="w-4 h-4" />
             {t("auth.signOut")}
            </a>
           </li>
          </ul>
         </div>
        ) : (
         <button onClick={handleSignIn} className="btn btn-sm btn-outline">
          <FaRightToBracket className="w-4 h-4" />
          {t("auth.signIn")}
         </button>
        )}

        <div
         className="badge badge-sm badge-primary"
         style={{
          backgroundColor: themeStyles.primaryColor,
          borderColor: themeStyles.primaryColor,
         }}
        >
         {t("board.publicBoard")}
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
        onClick={() => executeWithAuth(() => setShowSubmitForm(true))}
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
        {t("publicBoard.submitRequest")}
       </button>
       <div className="stats shadow-sm bg-base-100">
        <div className="stat py-2 px-4">
         <div className="stat-value text-sm">{featureRequests.length}</div>
         <div className="stat-desc">{t("publicBoard.totalRequests")}</div>
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
         placeholder={t("publicBoard.searchRequests")}
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
        <HiOutlineBell className="w-10 h-10 text-base-content/50" />
       </div>
       <h3 className="text-xl font-semibold text-base-content mb-2">
        {t("publicBoard.noRequestsYet")}
       </h3>
       <p className="text-base-content/70 mb-6">
        {t("publicBoard.beTheFirst")}
       </p>
       <button
        onClick={() => setShowSubmitForm(true)}
        className="btn btn-primary"
       >
        {t("publicBoard.submitFirstRequest")}
       </button>
      </div>
     ) : (
      <div className="space-y-4">
       {featureRequests.map((request) => (
        <FeatureRequestCard
         key={request.id}
         request={request}
         boardCreatorId={board?.creator_id}
         onUpvote={handleUpvote}
         onEdit={handleEditRequest}
         onDelete={handleDeleteRequest}
         onClick={handleRequestClick}
         userUpvotes={upvotedRequests}
         isClickable={true}
        />
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
       <h3 className="font-bold text-lg">
        {t("publicBoard.submitFeatureRequest")}
       </h3>
       <button
        onClick={() => setShowSubmitForm(false)}
        className="btn btn-sm btn-circle btn-ghost"
       >
        ✕
       </button>
      </div>

      {submitError && (
       <div className="alert alert-error mb-4">
        <VscError />
        <span>{submitError}</span>
       </div>
      )}

      <form onSubmit={handleSubmitRequest}>
       <div className="form-control mb-4">
        <label className="label">
         <span className="label-text font-medium">
          {t("publicBoard.featureTitle")} *
         </span>
        </label>
        <input
         type="text"
         placeholder={t("publicBoard.featureTitlePlaceholder")}
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
         <span className="label-text font-medium">
          {t("board.description")}
         </span>
        </label>
        <textarea
         placeholder={t("publicBoard.descriptionPlaceholder")}
         className="textarea textarea-bordered h-24"
         value={submitForm.description}
         onChange={(e) =>
          setSubmitForm((prev) => ({...prev, description: e.target.value}))
         }
        />
       </div>

       {/* Show user info */}
       {user && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-base-100 rounded-lg">
         <div className="avatar">
          <div className="w-8 h-8 rounded-full">
           <Image
            src={
             user?.image ||
             `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user?.name || "User"
             )}&background=random`
            }
            alt="Profile"
            width={32}
            height={32}
           />
          </div>
         </div>
         <div>
          <p className="font-medium text-sm">{user?.name}</p>
          <p className="text-xs text-base-content/60">{user?.email}</p>
         </div>
        </div>
       )}

       <div className="modal-action">
        <button
         type="button"
         onClick={() => setShowSubmitForm(false)}
         className="btn btn-ghost"
        >
         {t("publicBoard.cancel")}
        </button>
        <button
         type="submit"
         className="btn btn-primary"
         disabled={isSubmitting || !submitForm.title}
        >
         {isSubmitting ? (
          <>
           <span className="loading loading-spinner loading-sm"></span>
           {t("publicBoard.submitting")}
          </>
         ) : (
          t("publicBoard.submitRequest")
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
     isAdmin={userId === board?.creator_id}
     onStatusUpdate={handleStatusUpdate}
    />
   )}

   {/* Authentication Modal */}
   <AuthModal
    isOpen={showAuthModal}
    onClose={() => setShowAuthModal(false)}
    title={t("auth.signInToSubmit")}
    message={t("auth.signInToSubmitMessage")}
   />

   {/* Edit Feature Request Modal */}
   <EditFeatureRequestModal
    isOpen={!!editingRequest}
    onClose={handleCloseEditRequest}
    request={editingRequest}
    onRequestUpdated={() => fetchFeatureRequests(true)}
   />
  </div>
 );
}

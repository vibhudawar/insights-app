"use client";

import {useState, useEffect, useCallback} from "react";
import {FeatureRequestWithDetails, CommentWithReplies} from "@/types";
import {useAuthAction} from "@/hooks/useAuthAction";
import {toast} from "@/utils/toast";
import {EditCommentModal} from "./EditCommentModal";
import Image from "next/image";
import {useCurrentUser} from "@/hooks/useCurrentUser";
import {Comment} from "@prisma/client";
import {formatDate} from "@/utils/utility";
import {StatusBadge} from "@/components/StatusBadge";
import {FaRegCheckCircle} from "react-icons/fa";
import {
 deleteComment,
 getComments,
 postComment,
 updateFeatureStatus,
} from "@/frontend apis/apiClient";

interface FeatureRequestModalProps {
 request: FeatureRequestWithDetails;
 isOpen: boolean;
 onClose: () => void;
 isAdmin?: boolean;
 onStatusUpdate?: (requestId: string, newStatus: string) => void;
}

export function FeatureRequestModal({
 request,
 isOpen,
 onClose,
 isAdmin = false,
 onStatusUpdate,
}: FeatureRequestModalProps) {
 const user = useCurrentUser();
 const [comments, setComments] = useState<CommentWithReplies[]>([]);
 const [isLoadingComments, setIsLoadingComments] = useState(false);
 const [showCommentForm, setShowCommentForm] = useState(false);
 const [replyToComment, setReplyToComment] = useState<string | null>(null);
 const [commentForm, setCommentForm] = useState({
  content: "",
  parentCommentId: undefined as string | undefined,
 });
 const [isSubmittingComment, setIsSubmittingComment] = useState(false);
 const [commentError, setCommentError] = useState("");
 const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
 const [selectedStatus, setSelectedStatus] = useState<string>(request.status);
 const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
 const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
  null
 );
 const [editingComment, setEditingComment] =
  useState<CommentWithReplies | null>(null);
 const {executeWithAuth} = useAuthAction({
  requireAuthMessage: "Please sign in to add a comment.",
 });

 // Helper function to check if user can modify a comment
 const canModifyComment = (comment: Comment) => {
  const userId = (user as {id?: string})?.id;
  const isCommentAuthor = userId === comment.author_id;
  const isBoardOwner = userId === request.board?.creator_id;
  return isCommentAuthor || isBoardOwner;
 };

 const fetchComments = useCallback(async () => {
  if (!request.id) return;

  setIsLoadingComments(true);
  try {
   const response = await getComments(request.id);
   setComments(response.data || []);
  } catch (error) {
   console.error("Error fetching comments:", error);
  } finally {
   setIsLoadingComments(false);
  }
 }, [request.id]);

 useEffect(() => {
  if (isOpen && request.id) {
   fetchComments();
  }
 }, [isOpen, request.id, fetchComments]);

 const handleSubmitComment = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!request.id) return;

  setIsSubmittingComment(true);
  setCommentError("");

  try {
   const response = await postComment(
    request.id,
    commentForm.content,
    replyToComment || undefined
   );

   if (response.success) {
    setCommentForm({
     content: "",
     parentCommentId: undefined,
    });
    setShowCommentForm(false);
    setReplyToComment(null);
    fetchComments();
    toast.success("Comment posted successfully!");
   } else {
    setCommentError(response.error || "Failed to submit comment");
   }
  } catch {
   setCommentError("An error occurred. Please try again.");
  } finally {
   setIsSubmittingComment(false);
  }
 };

 const handleReply = (commentId: string) => {
  if (!user) return;
  setReplyToComment(commentId);
  setShowCommentForm(true);
 };

 const handleEditComment = (commentId: string) => {
  if (!user) return;
  const comment = comments.find((c) => c.id === commentId);
  if (comment) {
   setEditingComment(comment);
   setEditingCommentId(commentId);
  }
 };

 const handleCloseEditComment = () => {
  setEditingComment(null);
  setEditingCommentId(null);
 };

 const handleDeleteComment = async (commentId: string) => {
  executeWithAuth(async () => {
   if (
    !window.confirm(
     "Are you sure you want to delete this comment? This action cannot be undone."
    )
   ) {
    return;
   }

   setDeletingCommentId(commentId);
   try {
    const response = await deleteComment(request.id, commentId);

    if (response.ok) {
     fetchComments();
     toast.success("Comment deleted successfully");
    } else {
     const errorData = await response.json();
     toast.error(errorData.error || "Failed to delete comment");
    }
   } catch {
    toast.error("An error occurred while deleting the comment");
   } finally {
    setDeletingCommentId(null);
   }
  });
 };

 const handleOpenCommentForm = () => {
  if (!user) return;
  setShowCommentForm(true);
 };

 const handleStatusUpdate = async () => {
  if (!onStatusUpdate || selectedStatus === request.status) return;

  setIsUpdatingStatus(true);
  try {
   const response = await updateFeatureStatus(request.id, selectedStatus);

   if (response.ok) {
    onStatusUpdate(request.id, selectedStatus);
   } else {
    const errorData = await response.json();
    alert(errorData.error || "Failed to update status");
    setSelectedStatus(request.status); // Reset to original status
   }
  } catch {
   alert("An error occurred. Please try again.");
   setSelectedStatus(request.status); // Reset to original status
  } finally {
   setIsUpdatingStatus(false);
  }
 };

 if (!isOpen) return null;

 return (
  <div className="modal modal-open">
   <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
    <div className="flex items-start justify-between mb-6">
     <div className="flex-1 pr-4">
      <div className="flex items-start gap-4 mb-4">
       <h3 className="font-bold text-xl flex-1">{request.title}</h3>
       {request.status !== "NEW" && StatusBadge(request.status)}
      </div>
      <p className="text-sm text-base-content/70 mb-4">
       Submitted by {request.submitter_name || "Anonymous"} •{" "}
       {formatDate(request.created_at)}
      </p>
     </div>
     <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
      ✕
     </button>
    </div>

    {/* Request Description */}
    {request.description && (
     <div className="mb-6">
      <div className="bg-base-200 rounded-lg p-4">
       <p className="whitespace-pre-wrap">{request.description}</p>
      </div>
     </div>
    )}

    {/* Admin Status Update */}
    {isAdmin && (
     <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
       <FaRegCheckCircle />
       Admin: Update Status
      </h4>
      <div className="flex items-center gap-3">
       <select
        className="select select-bordered select-sm"
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
       >
        <option value="NEW">New</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="SHIPPED">Shipped</option>
        <option value="CANCELLED">Cancelled</option>
       </select>
       <button
        onClick={handleStatusUpdate}
        className="btn btn-sm btn-primary"
        disabled={isUpdatingStatus || selectedStatus === request.status}
       >
        {isUpdatingStatus ? (
         <>
          <span className="loading loading-spinner loading-xs"></span>
          Updating...
         </>
        ) : (
         "Update Status"
        )}
       </button>
      </div>
     </div>
    )}

    {/* Upvote Section */}
    <div className="flex items-center gap-4 mb-6">
     <div className="text-sm text-base-content/70">
      {request.comment_count} comments
     </div>
    </div>

    {/* Comments Section */}
    <div className="border-t border-base-300 pt-6">
     <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold text-lg">Comments</h4>
      <button
       onClick={handleOpenCommentForm}
       className="btn btn-sm btn-primary"
      >
       Add Comment
      </button>
     </div>

     {/* Comment Form */}
     {showCommentForm && (
      <div className="mb-6 p-4 bg-base-200 rounded-lg">
       <div className="flex items-center justify-between mb-4">
        <h5 className="font-medium">
         {replyToComment ? "Reply to comment" : "Add a comment"}
        </h5>
        <button
         onClick={() => {
          setShowCommentForm(false);
          setReplyToComment(null);
         }}
         className="btn btn-sm btn-ghost"
        >
         Cancel
        </button>
       </div>

       {commentError && (
        <div className="alert alert-error mb-4">
         <span>{commentError}</span>
        </div>
       )}

       <form onSubmit={handleSubmitComment}>
        {/* Show user info */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-base-100 rounded-lg">
         <div className="avatar">
          <div className="w-8 h-8 rounded-full">
           <Image
            src={user?.image || ""}
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

        <div className="form-control mb-4">
         <textarea
          placeholder="Write your comment..."
          className="textarea textarea-bordered h-24"
          value={commentForm.content}
          onChange={(e) =>
           setCommentForm((prev) => ({...prev, content: e.target.value}))
          }
          required
         />
        </div>

        <button
         type="submit"
         className="btn btn-primary btn-sm"
         disabled={isSubmittingComment || !commentForm.content.trim()}
        >
         {isSubmittingComment ? (
          <>
           <span className="loading loading-spinner loading-sm"></span>
           Posting...
          </>
         ) : (
          "Post Comment"
         )}
        </button>
       </form>
      </div>
     )}

     {/* Comments List */}
     {isLoadingComments ? (
      <div className="flex justify-center py-8">
       <span className="loading loading-spinner loading-md"></span>
      </div>
     ) : comments.length === 0 ? (
      <div className="text-center py-8 text-base-content/70">
       <p>No comments yet. Be the first to comment!</p>
      </div>
     ) : (
      <div className="space-y-4">
       {comments.map((comment) => (
        <div key={comment.id} className="comment-thread">
         {/* Main Comment */}
         <div className="flex gap-3 p-4 bg-base-50 rounded-lg">
          <div className="avatar placeholder">
           <div className="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center">
            <span className="text-sm">
             {comment.author_name?.charAt(0).toUpperCase() || "A"}
            </span>
           </div>
          </div>
          <div className="flex-1">
           <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
             <span className="font-medium text-sm">{comment.author_name}</span>
             <span className="text-xs text-base-content/60">
              {formatDate(comment.created_at)}
             </span>
             {comment.is_edited && (
              <span className="text-xs text-base-content/50 italic">
               (edited)
              </span>
             )}
            </div>
            {canModifyComment(comment) && (
             <div className="flex items-center gap-1">
              <button
               onClick={() => handleEditComment(comment.id)}
               className="btn btn-soft btn-primary btn-xs"
               disabled={deletingCommentId === comment.id}
              >
               Update
              </button>
              <button
               onClick={() => handleDeleteComment(comment.id)}
               className="btn btn-soft btn-error btn-xs hover:text-white"
               disabled={deletingCommentId === comment.id}
              >
               {deletingCommentId === comment.id ? (
                <span className="loading loading-spinner loading-xs"></span>
               ) : (
                "Delete"
               )}
              </button>
             </div>
            )}
           </div>
           <p className="text-sm whitespace-pre-wrap mb-2">{comment.content}</p>
           <div className="flex items-center gap-2">
            <button
             onClick={() => handleReply(comment.id)}
             className="text-xs text-primary hover:underline"
            >
             Reply
            </button>
           </div>
          </div>
         </div>

         {/* Replies */}
         {comment.replies && comment.replies.length > 0 && (
          <div className="ml-8 mt-2 space-y-2">
           {comment.replies.map(
            (reply: {
             id: string;
             content: string;
             author_name: string;
             created_at: Date;
            }) => (
             <div
              key={reply.id}
              className="flex gap-3 p-3 bg-base-100 rounded-lg"
             >
              <div className="avatar placeholder">
               <div className="bg-neutral text-neutral-content rounded-full w-6 h-6 flex items-center justify-center">
                <span className="text-xs">
                 {reply.author_name?.charAt(0).toUpperCase() || "A"}
                </span>
               </div>
              </div>
              <div className="flex-1">
               <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-xs">{reply.author_name}</span>
                <span className="text-xs text-base-content/60">
                 {formatDate(reply.created_at)}
                </span>
               </div>
               <p className="text-xs whitespace-pre-wrap">{reply.content}</p>
              </div>
             </div>
            )
           )}
          </div>
         )}
        </div>
       ))}
      </div>
     )}
    </div>
   </div>

   {/* Edit Comment Modal */}
   <EditCommentModal
    isOpen={!!editingComment}
    onClose={handleCloseEditComment}
    comment={editingComment}
    featureRequestId={request.id}
    onCommentUpdated={fetchComments}
   />
  </div>
 );
}

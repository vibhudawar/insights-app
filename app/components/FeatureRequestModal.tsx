"use client";

import {useState, useEffect, useCallback} from "react";
import {
 FeatureRequestWithDetails,
 CommentWithReplies,
 CreateCommentFormData,
} from "@/types";

interface FeatureRequestModalProps {
 request: FeatureRequestWithDetails;
 isOpen: boolean;
 onClose: () => void;
 onUpvote: (requestId: string) => void;
 userIdentifier: string;
}

export function FeatureRequestModal({
 request,
 isOpen,
 onClose,
 onUpvote,
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 userIdentifier, // Used by parent component for upvoting
}: FeatureRequestModalProps) {
 const [comments, setComments] = useState<CommentWithReplies[]>([]);
 const [isLoadingComments, setIsLoadingComments] = useState(false);
 const [showCommentForm, setShowCommentForm] = useState(false);
 const [replyToComment, setReplyToComment] = useState<string | null>(null);
 const [commentForm, setCommentForm] = useState<CreateCommentFormData>({
  content: "",
  authorName: "",
  authorEmail: "",
  parentCommentId: undefined,
 });
 const [isSubmittingComment, setIsSubmittingComment] = useState(false);
 const [commentError, setCommentError] = useState("");

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
    className={`badge ${
     statusColors[status as keyof typeof statusColors] || "badge-ghost"
    }`}
   >
    {statusLabels[status as keyof typeof statusLabels] || status}
   </div>
  );
 };

 const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
   year: "numeric",
   month: "short",
   day: "numeric",
   hour: "2-digit",
   minute: "2-digit",
  });
 };

 const fetchComments = useCallback(async () => {
  if (!request.id) return;

  setIsLoadingComments(true);
  try {
   const response = await fetch(`/api/feature-requests/${request.id}/comments`);
   if (response.ok) {
    const data = await response.json();
    setComments(data.data || []);
   }
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
   const response = await fetch(
    `/api/feature-requests/${request.id}/comments`,
    {
     method: "POST",
     headers: {
      "Content-Type": "application/json",
     },
     body: JSON.stringify({
      ...commentForm,
      parentCommentId: replyToComment,
     }),
    }
   );

   const result = await response.json();

   if (result.success) {
    setCommentForm({
     content: "",
     authorName: "",
     authorEmail: "",
     parentCommentId: undefined,
    });
    setShowCommentForm(false);
    setReplyToComment(null);
    fetchComments(); // Refresh comments
   } else {
    setCommentError(result.error || "Failed to submit comment");
   }
  } catch {
   setCommentError("An error occurred. Please try again.");
  } finally {
   setIsSubmittingComment(false);
  }
 };

 const handleReply = (commentId: string) => {
  setReplyToComment(commentId);
  setShowCommentForm(true);
 };

 if (!isOpen) return null;

 return (
  <div className="modal modal-open">
   <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
    <div className="flex items-start justify-between mb-6">
     <div className="flex-1 pr-4">
      <div className="flex items-start gap-4 mb-4">
       <h3 className="font-bold text-xl flex-1">{request.title}</h3>
       {request.status !== "NEW" && getStatusBadge(request.status)}
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

    {/* Upvote Section */}
    <div className="flex items-center gap-4 mb-6">
     <button
      onClick={() => onUpvote(request.id)}
      className="btn btn-outline flex items-center gap-2"
     >
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
        d="M5 15l7-7 7 7"
       />
      </svg>
      Upvote ({request.upvote_count})
     </button>
     <div className="text-sm text-base-content/70">
      {request.comment_count} comments
     </div>
    </div>

    {/* Comments Section */}
    <div className="border-t border-base-300 pt-6">
     <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold text-lg">Comments</h4>
      <button
       onClick={() => setShowCommentForm(true)}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
         <div className="form-control">
          <input
           type="text"
           placeholder="Your name"
           className="input input-bordered input-sm"
           value={commentForm.authorName}
           onChange={(e) =>
            setCommentForm((prev) => ({...prev, authorName: e.target.value}))
           }
           required
          />
         </div>
         <div className="form-control">
          <input
           type="email"
           placeholder="Your email"
           className="input input-bordered input-sm"
           value={commentForm.authorEmail}
           onChange={(e) =>
            setCommentForm((prev) => ({...prev, authorEmail: e.target.value}))
           }
           required
          />
         </div>
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
           <div className="bg-neutral text-neutral-content rounded-full w-8">
            <span className="text-xs">
             {comment.author_name?.charAt(0).toUpperCase() || "A"}
            </span>
           </div>
          </div>
          <div className="flex-1">
           <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">{comment.author_name}</span>
            <span className="text-xs text-base-content/60">
             {formatDate(comment.created_at)}
            </span>
           </div>
           <p className="text-sm whitespace-pre-wrap mb-2">{comment.content}</p>
           <button
            onClick={() => handleReply(comment.id)}
            className="text-xs text-primary hover:underline"
           >
            Reply
           </button>
          </div>
         </div>

         {/* Replies */}
         {comment.replies && comment.replies.length > 0 && (
          <div className="ml-8 mt-2 space-y-2">
           {comment.replies.map((reply: any) => (
            <div
             key={reply.id}
             className="flex gap-3 p-3 bg-base-100 rounded-lg border-l-2 border-primary/20"
            >
             <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-6">
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
           ))}
          </div>
         )}
        </div>
       ))}
      </div>
     )}
    </div>
   </div>
  </div>
 );
}

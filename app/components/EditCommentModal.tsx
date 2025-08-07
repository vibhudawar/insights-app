"use client";

import {useState, useEffect} from "react";
import {toast} from "@/utils/toast";
import {CommentWithReplies} from "@/types";

interface EditCommentModalProps {
 isOpen: boolean;
 onClose: () => void;
 comment: CommentWithReplies | null;
 featureRequestId: string;
 onCommentUpdated: () => void;
}

export function EditCommentModal({
 isOpen,
 onClose,
 comment,
 featureRequestId,
 onCommentUpdated,
}: EditCommentModalProps) {
 const [content, setContent] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState("");

 useEffect(() => {
  if (comment) {
   setContent(comment.content);
  }
 }, [comment]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!comment || !content.trim()) return;

  setIsSubmitting(true);
  setError("");

  try {
   const response = await fetch(
    `/api/feature-requests/${featureRequestId}/comments/${comment.id}`,
    {
     method: "PUT",
     headers: {
      "Content-Type": "application/json",
     },
     body: JSON.stringify({
      content: content.trim(),
     }),
    }
   );

   const result = await response.json();

   if (result.success) {
    toast.success("Comment updated successfully");
    onCommentUpdated();
    onClose();
   } else {
    setError(result.error || "Failed to update comment");
   }
  } catch (err) {
   console.error("Error updating comment:", err);
   setError("An error occurred. Please try again.");
  } finally {
   setIsSubmitting(false);
  }
 };

 const handleClose = () => {
  setContent(comment?.content || "");
  setError("");
  onClose();
 };

 if (!isOpen || !comment) return null;

 return (
  <div className="modal modal-open">
   <div className="modal-box">
    <div className="flex items-center justify-between mb-4">
     <h3 className="font-bold text-lg">Edit Comment</h3>
     <button onClick={handleClose} className="btn btn-sm btn-circle btn-ghost">
      ✕
     </button>
    </div>

    {error && (
     <div className="alert alert-error mb-4">
      <span>{error}</span>
     </div>
    )}

    <form onSubmit={handleSubmit}>
     <div className="form-control mb-4">
      <label className="label">
       <span className="label-text font-medium">Comment</span>
      </label>
      <textarea
       placeholder="Write your comment..."
       className="textarea textarea-bordered h-24"
       value={content}
       onChange={(e) => setContent(e.target.value)}
       required
      />
     </div>

     <div className="modal-action">
      <button
       type="button"
       onClick={handleClose}
       className="btn btn-ghost"
       disabled={isSubmitting}
      >
       Cancel
      </button>
      <button
       type="submit"
       className="btn btn-primary"
       disabled={isSubmitting || !content.trim()}
      >
       {isSubmitting ? (
        <>
         <span className="loading loading-spinner loading-sm"></span>
         Updating...
        </>
       ) : (
        "Update Comment"
       )}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}

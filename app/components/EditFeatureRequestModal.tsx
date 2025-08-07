"use client";

import {useState, useEffect} from "react";
import {useSession} from "next-auth/react";
import {toast} from "@/utils/toast";
import {FeatureRequestWithDetails, RequestStatus} from "@/types";

interface EditFeatureRequestModalProps {
 isOpen: boolean;
 onClose: () => void;
 request: FeatureRequestWithDetails | null;
 onRequestUpdated: () => void;
}

export function EditFeatureRequestModal({
 isOpen,
 onClose,
 request,
 onRequestUpdated,
}: EditFeatureRequestModalProps) {
 const {data: session} = useSession();
 const [title, setTitle] = useState("");
 const [description, setDescription] = useState("");
 const [status, setStatus] = useState<RequestStatus>("NEW");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState("");

 // Check if user is board owner (can modify status)
 const isBoardOwner =
  (session?.user as {id?: string})?.id === request?.board?.creator_id;

 useEffect(() => {
  if (request) {
   setTitle(request.title);
   setDescription(request.description || "");
   setStatus(request.status);
  }
 }, [request]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!request || !title.trim()) return;

  setIsSubmitting(true);
  setError("");

  try {
   const response = await fetch(`/api/feature-requests/${request.id}`, {
    method: "PUT",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     title: title.trim(),
     description: description.trim() || null,
     status: isBoardOwner ? status : undefined, // Only include status if user is board owner
    }),
   });

   const result = await response.json();

   if (result.success) {
    toast.success("Feature request updated successfully");
    onRequestUpdated();
    onClose();
   } else {
    setError(result.error || "Failed to update feature request");
   }
  } catch (err) {
   console.error("Error updating feature request:", err);
   setError("An error occurred. Please try again.");
  } finally {
   setIsSubmitting(false);
  }
 };

 const handleClose = () => {
  if (request) {
   setTitle(request.title);
   setDescription(request.description || "");
   setStatus(request.status);
  }
  setError("");
  onClose();
 };

 if (!isOpen || !request) return null;

 const statusOptions = [
  {value: "NEW", label: "New"},
  {value: "IN_PROGRESS", label: "In Progress"},
  {value: "SHIPPED", label: "Shipped"},
  {value: "CANCELLED", label: "Cancelled"},
 ];

 return (
  <div className="modal modal-open">
   <div className="modal-box max-w-2xl">
    <div className="flex items-center justify-between mb-6">
     <h3 className="font-bold text-lg">Edit Feature Request</h3>
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
       <span className="label-text font-medium">Title *</span>
      </label>
      <input
       type="text"
       placeholder="Feature title..."
       className="input input-bordered"
       value={title}
       onChange={(e) => setTitle(e.target.value)}
       required
      />
     </div>

     <div className="form-control mb-4">
      <label className="label">
       <span className="label-text font-medium">Description</span>
      </label>
      <textarea
       placeholder="Describe your feature request..."
       className="textarea textarea-bordered h-24"
       value={description}
       onChange={(e) => setDescription(e.target.value)}
      />
     </div>

     {isBoardOwner && (
      <div className="form-control mb-6">
       <label className="label">
        <span className="label-text font-medium">Status</span>
       </label>
       <select
        className="select select-bordered"
        value={status}
        onChange={(e) => setStatus(e.target.value as RequestStatus)}
       >
        {statusOptions.map((option) => (
         <option key={option.value} value={option.value}>
          {option.label}
         </option>
        ))}
       </select>
       <div className="label">
        <span className="label-text-alt">
         Only board owners can change status
        </span>
       </div>
      </div>
     )}

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
       disabled={isSubmitting || !title.trim()}
      >
       {isSubmitting ? (
        <>
         <span className="loading loading-spinner loading-sm"></span>
         Updating...
        </>
       ) : (
        "Update Feature Request"
       )}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}

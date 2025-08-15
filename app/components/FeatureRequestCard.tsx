"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {FaChevronUp, FaComment, FaCrown} from "react-icons/fa";
import {FeatureRequestWithDetails} from "@/types";
import {useCurrentUser} from "@/hooks/useCurrentUser";
import {formatDate} from "@/utils/utility";

interface FeatureRequestCardProps {
 request: FeatureRequestWithDetails;
 boardCreatorId?: string;
 onUpvote: (requestId: string) => void;
 onEdit?: (request: FeatureRequestWithDetails) => void;
 onDelete?: (requestId: string) => void;
 onClick?: (request: FeatureRequestWithDetails) => void;
 userUpvotes: Set<string>;
 isClickable?: boolean;
}

export function FeatureRequestCard({
 request,
 boardCreatorId,
 onUpvote,
 onEdit,
 onDelete,
 onClick,
 userUpvotes,
 isClickable = true,
}: FeatureRequestCardProps) {
 const t = useTranslations();
 const [isDeleting, setIsDeleting] = useState(false);
 const user = useCurrentUser();
 const userId = (user as {id?: string})?.id;
 const requestStatus = request.status;

 const isOwnRequest = userId === request.submitter_id;
 const isBoardOwner = userId === boardCreatorId;
 const canModify = isOwnRequest || isBoardOwner;
 const hasUpvoted = userUpvotes.has(request.id);

 const statusMap = {
  NEW: {key: "new", color: "badge-info"},
  IN_PROGRESS: {key: "inProgress", color: "badge-warning"},
  SHIPPED: {key: "shipped", color: "badge-success"},
  CANCELLED: {key: "cancelled", color: "badge-error"},
 } as const;

 const currentStatus = statusMap[requestStatus];

 const handleUpvoteClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  onUpvote(request.id);
 };

 const handleEditClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  onEdit?.(request);
 };

 const handleDeleteClick = async (e: React.MouseEvent) => {
  e.stopPropagation();

  const confirmMessage =
   isBoardOwner && !isOwnRequest
    ? t("moderation.confirmDeleteRequest", {title: request.title})
    : t("request.confirmDelete", {title: request.title});

  if (!window.confirm(confirmMessage)) {
   return;
  }

  try {
   setIsDeleting(true);
   onDelete?.(request.id);
  } finally {
   setIsDeleting(false);
  }
 };

 const handleCardClick = () => {
  if (isClickable) {
   onClick?.(request);
  }
 };

 return (
  <div
   className={`card bg-base-100 shadow-sm hover:shadow-md transition-all ${
    isClickable ? "cursor-pointer" : ""
   } ${isDeleting ? "opacity-50" : ""}`}
   onClick={handleCardClick}
  >
   <div className="card-body">
    <div className="flex items-start gap-4">
     {/* Upvote Section */}
     <div className="flex flex-col items-center min-w-0">
      <div
       onClick={handleUpvoteClick}
       className={`card card-xs border transition-all cursor-pointer w-16 h-16 ${
        hasUpvoted
         ? "bg-primary border-primary text-primary-content hover:bg-primary/90"
         : "bg-base-100 border-base-300 hover:border-primary hover:shadow-md"
       }`}
      >
       <div className="card-body p-2 flex flex-col items-center justify-center gap-1">
        <FaChevronUp
         className={`w-4 h-4 ${
          hasUpvoted ? "text-primary-content" : "text-base-content/70"
         }`}
        />
        <span
         className={`text-sm font-bold ${
          hasUpvoted ? "text-primary-content" : "text-base-content"
         }`}
        >
         {request.upvote_count}
        </span>
       </div>
      </div>
     </div>

     {/* Content */}
     <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between mb-2">
       <div className="flex-1">
        <h3 className="text-lg font-semibold text-base-content mb-1">
         {request.title}
        </h3>

        {/* Status and ownership indicators */}
        <div className="flex items-center gap-2 mb-2">
         {currentStatus && (
          <div className={`badge badge-sm ${currentStatus.color}`}>
           {t(`publicBoard.status.${currentStatus.key}`)}
          </div>
         )}

         {(request as FeatureRequestWithDetails & {is_edited?: boolean})
          .is_edited && (
          <div className="badge badge-sm badge-ghost">
           <span className="text-xs">{t("request.edited")}</span>
          </div>
         )}
        </div>
       </div>

       {/* Action buttons */}
       {canModify && (
        <div className="flex items-center gap-1 ml-2">
         {isBoardOwner && !isOwnRequest && (
          <div className="tooltip" data-tip={t("moderation.boardOwnerActions")}>
           <FaCrown className="w-3 h-3 text-warning" />
          </div>
         )}

         <button
          onClick={handleEditClick}
          className="btn btn-soft btn-primary btn-sm"
          disabled={isDeleting}
         >
          UPDATE
         </button>

         <button
          onClick={handleDeleteClick}
          className="btn btn-soft btn-error btn-sm"
          disabled={isDeleting}
         >
          DELETE
         </button>
        </div>
       )}
      </div>

      {request.description && (
       <p className="text-base-content/80 mb-3 line-clamp-3">
        {request.description}
       </p>
      )}

      <div className="flex items-center justify-between text-sm text-base-content/60">
       <div className="flex items-center gap-4">
        <span>
         {request.submitter_name
          ? `${t("common.by")} ${request.submitter_name}`
          : t("common.byAnonymous")}{" "}
         • {formatDate(request.created_at)}
        </span>

        {request.comment_count > 0 && (
         <span className="flex items-center gap-1">
          <FaComment className="w-3 h-3" />
          {request.comment_count} {t("common.comments")}
         </span>
        )}
       </div>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}

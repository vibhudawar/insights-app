"use client";

export function StatusBadge(status: string) {
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
}

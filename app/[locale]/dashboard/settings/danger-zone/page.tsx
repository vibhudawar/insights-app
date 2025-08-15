"use client";

import {useState} from "react";
import {signOut} from "next-auth/react";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {HeaderComponent} from "@/components/HeaderComponent";
import {MdDangerous} from "react-icons/md";
import {toast} from "@/utils/toast";
import {deleteUserAccount} from "@/frontend apis/apiClient";

export default function DangerZonePage() {
 const [isLoading, setIsLoading] = useState(false);

 const handleDeleteAccount = async () => {
  if (
   !window.confirm(
    "Are you sure you want to delete your account? This action cannot be undone."
   )
  ) {
   return;
  }

  setIsLoading(true);
  try {
   await deleteUserAccount();
   await signOut({callbackUrl: "/"});
  } catch {
   toast.error("Failed to delete account. Please try again.");
  } finally {
   setIsLoading(false);
  }
 };

 return (
  <DashboardLayout>
   <div className="space-y-6">
    {/* Header */}
    <HeaderComponent
     title="Danger Zone"
     description="Irreversible and destructive actions"
     buttonText="Delete Account"
     buttonIcon={<MdDangerous />}
     buttonLink={"/dashboard/settings/danger-zone"}
     showButton={false}
    />

    <div className="card bg-base-100 shadow border-error">
     <div className="card-body">
      <h2 className="card-title text-error mb-6">Danger Zone</h2>

      <div className="space-y-6">
       <div className="alert alert-warning">
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
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
         />
        </svg>
        <div>
         <h3 className="font-bold">Warning</h3>
         <div className="text-xs">
          These actions are permanent and cannot be undone.
         </div>
        </div>
       </div>

       <div className="card bg-error/10 border border-error/20">
        <div className="card-body">
         <h3 className="card-title text-error">Delete Account</h3>
         <p className="text-sm mb-4">
          Permanently delete your account and all associated data. This
          includes:
         </p>
         <ul className="text-sm space-y-1 mb-4 list-disc list-inside">
          <li>All your boards and feature requests</li>
          <li>User profile and settings</li>
          <li>Comments and interactions</li>
          <li>Analytics and usage data</li>
         </ul>
         <div className="card-actions">
          <button
           onClick={handleDeleteAccount}
           className="btn btn-error"
           disabled={isLoading}
          >
           {isLoading ? (
            <>
             <span className="loading loading-spinner loading-sm"></span>
             Deleting...
            </>
           ) : (
            "Delete Account"
           )}
          </button>
         </div>
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>
  </DashboardLayout>
 );
}

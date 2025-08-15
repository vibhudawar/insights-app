"use client";

import {useState, useEffect} from "react";
import {useSession} from "next-auth/react";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {HeaderComponent} from "@/components/HeaderComponent";
import {FaSave} from "react-icons/fa";
import {toast} from "@/utils/toast";
import {Link} from "@/i18n/navigation";
import {updateUserSettings} from "@/frontend apis/apiClient";

export default function AccountPage() {
 const {data: session} = useSession();
 const [isSaving, setIsSaving] = useState(false);

 // Account settings
 const [accountSettings, setAccountSettings] = useState({
  accountTier: "FREE" as "FREE" | "PRO" | "ENTERPRISE",
  emailNotifications: true,
  marketingEmails: false,
 });

 useEffect(() => {
  const userWithTier = session?.user as {
   account_tier?: "FREE" | "PRO" | "ENTERPRISE";
  };
  if (userWithTier?.account_tier) {
   setAccountSettings((prev) => ({
    ...prev,
    accountTier: userWithTier.account_tier as "FREE" | "PRO" | "ENTERPRISE",
   }));
  }
 }, [session]);

 const handleAccountSettingsSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSaving(true);

  try {
   await updateUserSettings(accountSettings);
   toast.success("Settings updated successfully!");
  } catch {
   toast.error("Failed to update settings. Please try again.");
  } finally {
   setIsSaving(false);
  }
 };

 return (
  <DashboardLayout>
   <div className="space-y-6">
    {/* Header */}
    <HeaderComponent
     title="Account Settings"
     description="Manage your account preferences and subscription"
     buttonText="Save Settings"
     buttonIcon={<FaSave />}
     buttonLink={"/dashboard/settings/account"}
     showButton={false}
    />

    <div className="card bg-base-100 shadow">
     <div className="card-body">
      <h2 className="card-title mb-6">Account Settings</h2>

      <form onSubmit={handleAccountSettingsSubmit}>
       <div className="space-y-6">
        {/* Account Tier */}
        <div>
         <h3 className="font-semibold mb-3">Current Plan</h3>
         <div className="stats shadow">
          <div className="stat">
           <div className="stat-title">Account Tier</div>
           <div className="stat-value text-primary">
            {accountSettings.accountTier}
           </div>
           <div className="stat-desc">
            {accountSettings.accountTier === "FREE" &&
             "5 boards, 100 requests per board"}
            {accountSettings.accountTier === "PRO" &&
             "Unlimited boards and requests"}
            {accountSettings.accountTier === "ENTERPRISE" &&
             "Custom solutions available"}
           </div>
          </div>
         </div>
         {accountSettings.accountTier === "FREE" && (
          <Link
           href="/dashboard/settings/billing"
           className="btn btn-primary btn-sm mt-3"
          >
           Upgrade Plan
          </Link>
         )}
        </div>

        <div className="divider"></div>

        {/* Notification Preferences */}
        <div>
         <h3 className="font-semibold mb-4">Notification Preferences</h3>
         <div className="space-y-4">
          <div className="form-control">
           <label className="label cursor-pointer justify-start gap-4">
            <input
             type="checkbox"
             className="checkbox"
             checked={accountSettings.emailNotifications}
             onChange={(e) =>
              setAccountSettings((prev) => ({
               ...prev,
               emailNotifications: e.target.checked,
              }))
             }
            />
            <div>
             <div className="label-text font-medium">Email Notifications</div>
             <div className="label-text-alt">
              Receive emails about new feature requests and updates
             </div>
            </div>
           </label>
          </div>

          <div className="form-control">
           <label className="label cursor-pointer justify-start gap-4">
            <input
             type="checkbox"
             className="checkbox"
             checked={accountSettings.marketingEmails}
             onChange={(e) =>
              setAccountSettings((prev) => ({
               ...prev,
               marketingEmails: e.target.checked,
              }))
             }
            />
            <div>
             <div className="label-text font-medium">Marketing Emails</div>
             <div className="label-text-alt">
              Receive updates about new features and tips
             </div>
            </div>
           </label>
          </div>
         </div>
        </div>
       </div>

       <div className="card-actions justify-end mt-6">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
         {isSaving ? (
          <>
           <span className="loading loading-spinner loading-sm"></span>
           Saving...
          </>
         ) : (
          "Save Settings"
         )}
        </button>
       </div>
      </form>
     </div>
    </div>
   </div>
  </DashboardLayout>
 );
}

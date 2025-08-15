"use client";

import {useState, useEffect} from "react";
import {useSession} from "next-auth/react";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {HeaderComponent} from "@/components/HeaderComponent";
import {FaCreditCard} from "react-icons/fa";

export default function BillingPage() {
 const {data: session} = useSession();
 // Account settings for billing
 const [accountSettings, setAccountSettings] = useState({
  accountTier: "FREE" as "FREE" | "PRO" | "ENTERPRISE",
 });

 useEffect(() => {
  if (session?.user?.account_tier) {
   setAccountSettings((prev) => ({
    ...prev,
    accountTier: session.user.account_tier as "FREE" | "PRO" | "ENTERPRISE",
   }));
  }
 }, [session]);

 return (
  <DashboardLayout>
   <div className="space-y-6">
    {/* Header */}
    <HeaderComponent
     title="Billing & Subscription"
     description="Manage your subscription plan and billing information"
     buttonText="Manage Billing"
     buttonIcon={<FaCreditCard />}
     buttonLink={"/dashboard/settings/billing"}
     showButton={false}
    />

    <div className="card bg-base-100 shadow">
     <div className="card-body">
      <h2 className="card-title mb-6">Billing & Subscription</h2>

      {/* Current Plan */}
      <div className="stats shadow mb-6">
       <div className="stat">
        <div className="stat-figure text-primary">
         <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
         >
          <path
           strokeLinecap="round"
           strokeLinejoin="round"
           strokeWidth={2}
           d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
         </svg>
        </div>
        <div className="stat-title">Current Plan</div>
        <div className="stat-value">{accountSettings.accountTier}</div>
        <div className="stat-desc">
         {accountSettings.accountTier === "FREE"
          ? "Free Forever"
          : "Monthly billing"}
        </div>
       </div>
      </div>

      {/* Upgrade Options */}
      {accountSettings.accountTier === "FREE" && (
       <div>
        <h3 className="font-semibold mb-4">Upgrade Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="card bg-base-200 shadow">
          <div className="card-body">
           <h4 className="card-title text-lg">Pro Plan</h4>
           <div className="text-3xl font-bold text-primary mb-2">
            $9<span className="text-base font-normal">/mo</span>
           </div>
           <ul className="space-y-2 text-sm mb-4">
            <li className="flex items-center gap-2">
             <svg
              className="w-4 h-4 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
             >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M5 13l4 4L19 7"
              />
             </svg>
             Unlimited boards
            </li>
            <li className="flex items-center gap-2">
             <svg
              className="w-4 h-4 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
             >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M5 13l4 4L19 7"
              />
             </svg>
             Unlimited requests
            </li>
            <li className="flex items-center gap-2">
             <svg
              className="w-4 h-4 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
             >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M5 13l4 4L19 7"
              />
             </svg>
             Custom domains
            </li>
            <li className="flex items-center gap-2">
             <svg
              className="w-4 h-4 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
             >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M5 13l4 4L19 7"
              />
             </svg>
             Advanced analytics
            </li>
           </ul>
           <button className="btn btn-primary">Upgrade to Pro</button>
          </div>
         </div>

         <div className="card bg-base-200 shadow">
          <div className="card-body">
           <h4 className="card-title text-lg">Enterprise</h4>
           <div className="text-3xl font-bold text-primary mb-2">Custom</div>
           <ul className="space-y-2 text-sm mb-4">
            <li className="flex items-center gap-2">
             <svg
              className="w-4 h-4 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
             >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M5 13l4 4L19 7"
              />
             </svg>
             Everything in Pro
            </li>
            <li className="flex items-center gap-2">
             <svg
              className="w-4 h-4 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
             >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M5 13l4 4L19 7"
              />
             </svg>
             SSO integration
            </li>
            <li className="flex items-center gap-2">
             <svg
              className="w-4 h-4 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
             >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M5 13l4 4L19 7"
              />
             </svg>
             Priority support
            </li>
            <li className="flex items-center gap-2">
             <svg
              className="w-4 h-4 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
             >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M5 13l4 4L19 7"
              />
             </svg>
             Custom integrations
            </li>
           </ul>
           <button className="btn btn-outline">Contact Sales</button>
          </div>
         </div>
        </div>
       </div>
      )}

      {/* Billing History */}
      <div className="mt-8">
       <h3 className="font-semibold mb-4">Billing History</h3>
       <div className="text-center py-8 text-base-content/70">
        <svg
         className="w-12 h-12 mx-auto mb-4 opacity-50"
         fill="none"
         stroke="currentColor"
         viewBox="0 0 24 24"
        >
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
         />
        </svg>
        <p>No billing history available</p>
        <p className="text-sm">You&apos;re currently on the free plan</p>
       </div>
      </div>
     </div>
    </div>
   </div>
  </DashboardLayout>
 );
}
"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    username: "",
    country: "",
  });

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    accountTier: "FREE" as "FREE" | "PRO" | "ENTERPRISE",
    emailNotifications: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (session?.user) {
      const user = session.user as { 
        name?: string | null; 
        email?: string | null; 
        username?: string | null; 
        country?: string | null; 
      };
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        country: user.country || "",
      });
    }
  }, [session]);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        await update({
          ...session,
          user: {
            ...session?.user,
            ...updatedUser.data,
          },
        });
        showMessage("Profile updated successfully!", "success");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      showMessage("Failed to update profile. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAccountSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountSettings),
      });

      if (response.ok) {
        showMessage("Settings updated successfully!", "success");
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      showMessage("Failed to update settings. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      showMessage("Failed to delete account. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-base-content mb-2">Settings</h1>
            <div className="breadcrumbs text-sm">
              <ul>
                <li><a href="/dashboard">Dashboard</a></li>
                <li>Settings</li>
              </ul>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`alert ${messageType === "success" ? "alert-success" : "alert-error"} mb-6`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                {messageType === "success" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span>{message}</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64">
              <div className="card bg-base-100 shadow">
                <div className="card-body p-0">
                  <ul className="menu menu-vertical">
                    <li>
                      <button
                        onClick={() => setActiveTab("profile")}
                        className={`${activeTab === "profile" ? "active" : ""}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("account")}
                        className={`${activeTab === "account" ? "active" : ""}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Account
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("billing")}
                        className={`${activeTab === "billing" ? "active" : ""}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Billing
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("danger")}
                        className={`${activeTab === "danger" ? "active text-error" : ""}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Danger Zone
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="card bg-base-100 shadow">
                  <div className="card-body">
                    <h2 className="card-title mb-6">Profile Information</h2>
                    
                    <form onSubmit={handleProfileSubmit}>
                      {/* Avatar Section */}
                      <div className="flex items-center gap-6 mb-6">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-20">
                            <span className="text-2xl">
                              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Profile Picture</h3>
                          <input type="file" className="file-input file-input-bordered file-input-sm" accept="image/*" />
                          <p className="text-sm text-base-content/70 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <fieldset className="fieldset">
                          <label className="label">
                            <span className="label-text font-medium">Full Name *</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                            placeholder="Enter your full name"
                          />
                        </fieldset>

                        <fieldset className="fieldset">
                          <label className="label">
                            <span className="label-text font-medium">Email Address *</span>
                          </label>
                          <input
                            type="email"
                            className="input input-bordered"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                            placeholder="Enter your email"
                          />
                        </fieldset>

                        <fieldset className="fieldset">
                          <label className="label">
                            <span className="label-text font-medium">Username</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Choose a username"
                            pattern="[A-Za-z][A-Za-z0-9\\-]*"
                            minLength={3}
                            maxLength={30}
                            title="Only letters, numbers or dash"
                          />
                          <label className="label">
                            <span className="label-text-alt">3-30 characters, letters/numbers/dash only</span>
                          </label>
                        </fieldset>

                        <fieldset className="fieldset">
                          <label className="label">
                            <span className="label-text font-medium">Country</span>
                          </label>
                          <select
                            className="select select-bordered"
                            value={profileForm.country}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
                          >
                            <option value="">Select Country</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="AU">Australia</option>
                            <option value="IN">India</option>
                            <option value="JP">Japan</option>
                            <option value="BR">Brazil</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </fieldset>
                      </div>

                      <div className="card-actions justify-end mt-6">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === "account" && (
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
                              <div className="stat-value text-primary">{accountSettings.accountTier}</div>
                              <div className="stat-desc">
                                {accountSettings.accountTier === "FREE" && "5 boards, 100 requests per board"}
                                {accountSettings.accountTier === "PRO" && "Unlimited boards and requests"}
                                {accountSettings.accountTier === "ENTERPRISE" && "Custom solutions available"}
                              </div>
                            </div>
                          </div>
                          {accountSettings.accountTier === "FREE" && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm mt-3"
                              onClick={() => setActiveTab("billing")}
                            >
                              Upgrade Plan
                            </button>
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
                                  onChange={(e) => setAccountSettings(prev => ({ 
                                    ...prev, 
                                    emailNotifications: e.target.checked 
                                  }))}
                                />
                                <div>
                                  <div className="label-text font-medium">Email Notifications</div>
                                  <div className="label-text-alt">Receive emails about new feature requests and updates</div>
                                </div>
                              </label>
                            </div>

                            <div className="form-control">
                              <label className="label cursor-pointer justify-start gap-4">
                                <input
                                  type="checkbox"
                                  className="checkbox"
                                  checked={accountSettings.marketingEmails}
                                  onChange={(e) => setAccountSettings(prev => ({ 
                                    ...prev, 
                                    marketingEmails: e.target.checked 
                                  }))}
                                />
                                <div>
                                  <div className="label-text font-medium">Marketing Emails</div>
                                  <div className="label-text-alt">Receive updates about new features and tips</div>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card-actions justify-end mt-6">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSaving}
                        >
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
              )}

              {/* Billing Tab */}
              {activeTab === "billing" && (
                <div className="card bg-base-100 shadow">
                  <div className="card-body">
                    <h2 className="card-title mb-6">Billing & Subscription</h2>
                    
                    {/* Current Plan */}
                    <div className="stats shadow mb-6">
                      <div className="stat">
                        <div className="stat-figure text-primary">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="stat-title">Current Plan</div>
                        <div className="stat-value">{accountSettings.accountTier}</div>
                        <div className="stat-desc">
                          {accountSettings.accountTier === "FREE" ? "Free Forever" : "Monthly billing"}
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
                              <div className="text-3xl font-bold text-primary mb-2">$9<span className="text-base font-normal">/mo</span></div>
                              <ul className="space-y-2 text-sm mb-4">
                                <li className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Unlimited boards
                                </li>
                                <li className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Unlimited requests
                                </li>
                                <li className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Custom domains
                                </li>
                                <li className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Everything in Pro
                                </li>
                                <li className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  SSO integration
                                </li>
                                <li className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Priority support
                                </li>
                                <li className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>No billing history available</p>
                        <p className="text-sm">You&apos;re currently on the free plan</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === "danger" && (
                <div className="card bg-base-100 shadow border-error">
                  <div className="card-body">
                    <h2 className="card-title text-error mb-6">Danger Zone</h2>
                    
                    <div className="space-y-6">
                      <div className="alert alert-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                          <h3 className="font-bold">Warning</h3>
                          <div className="text-xs">These actions are permanent and cannot be undone.</div>
                        </div>
                      </div>

                      <div className="card bg-error/10 border border-error/20">
                        <div className="card-body">
                          <h3 className="card-title text-error">Delete Account</h3>
                          <p className="text-sm mb-4">
                            Permanently delete your account and all associated data. This includes:
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
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
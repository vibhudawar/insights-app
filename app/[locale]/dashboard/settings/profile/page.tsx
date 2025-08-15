"use client";

import {useState, useEffect} from "react";
import {useSession} from "next-auth/react";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import Image from "next/image";
import {HeaderComponent} from "@/components/HeaderComponent";
import {FaSave} from "react-icons/fa";
import {toast} from "@/utils/toast";

export default function ProfilePage() {
 const {data: session, update} = useSession();
 const [isSaving, setIsSaving] = useState(false);

 // Profile form state
 const [profileForm, setProfileForm] = useState({
  name: "",
  email: "",
  username: "",
  country: "",
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
    toast.success("Profile updated successfully!");
   } else {
    throw new Error("Failed to update profile");
   }
  } catch {
   toast.error("Failed to update profile. Please try again.");
  } finally {
   setIsSaving(false);
  }
 };

 return (
  <DashboardLayout>
   <div className="space-y-6">
    {/* Header */}
    <HeaderComponent
     title="Profile Settings"
     description="Manage your personal information and profile details"
     buttonText="Save Changes"
     buttonIcon={<FaSave />}
     buttonLink={"/dashboard/settings/profile"}
     showButton={false}
    />

    <div className="card bg-base-100 shadow">
     <div className="card-body">
      <h2 className="card-title mb-6">Profile Information</h2>

      <form onSubmit={handleProfileSubmit}>
       {/* Avatar Section */}
       <div className="flex items-center gap-6 mb-6">
        <div className="avatar placeholder">
         <div className="bg-neutral text-neutral-content rounded-full w-20">
          <span className="text-2xl">
           {session?.user?.image ? (
            <Image
             src={session.user.image}
             alt={session.user.name || "User"}
             width={80}
             height={80}
             className="rounded-full"
            />
           ) : (
            <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full rounded-full">
             {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
            </div>
           )}
          </span>
         </div>
        </div>
        <div>
         <h3 className="font-semibold mb-2">Profile Picture</h3>
         <input
          type="file"
          className="file-input file-input-bordered file-input-sm"
          accept="image/*"
         />
         <p className="text-sm text-base-content/70 mt-1">
          JPG, PNG or GIF. Max size 2MB.
         </p>
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
          onChange={(e) =>
           setProfileForm((prev) => ({...prev, name: e.target.value}))
          }
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
          onChange={(e) =>
           setProfileForm((prev) => ({...prev, email: e.target.value}))
          }
          required
          placeholder="Enter your email"
          // disabled={true}
          readOnly={true}
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
          onChange={(e) =>
           setProfileForm((prev) => ({...prev, username: e.target.value}))
          }
          placeholder="Choose a username"
          pattern="[A-Za-z][A-Za-z0-9\\-]*"
          minLength={3}
          maxLength={30}
          title="Only letters, numbers or dash"
         />
         <label className="label">
          <span className="label-text-alt">
           3-30 characters, letters/numbers/dash only
          </span>
         </label>
        </fieldset>

        <fieldset className="fieldset">
         <label className="label">
          <span className="label-text font-medium">Country</span>
         </label>
         <select
          className="select select-bordered"
          value={profileForm.country}
          onChange={(e) =>
           setProfileForm((prev) => ({...prev, country: e.target.value}))
          }
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
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
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
   </div>
  </DashboardLayout>
 );
}

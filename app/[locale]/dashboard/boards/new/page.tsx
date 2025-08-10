"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {CreateBoardFormData} from "@/types";
import {FaRegCopy} from "react-icons/fa";
import {toast} from "@/utils/toast";
import {APP_URL} from "@/constants";

export default function NewBoardPage() {
 const router = useRouter();
 const [formData, setFormData] = useState<CreateBoardFormData>({
  title: "",
  description: "",
  slug: "",
  themeConfig: {},
  isPublic: true,
 });
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");

 const generateSlug = (title: string) => {
  return title
   .toLowerCase()
   .replace(/[^a-z0-9\s-]/g, "")
   .replace(/\s+/g, "-")
   .replace(/-+/g, "-")
   .trim();
 };

 const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
 ) => {
  const {name, value, type} = e.target;

  if (type === "checkbox") {
   const checked = (e.target as HTMLInputElement).checked;
   setFormData((prev) => ({...prev, [name]: checked}));
  } else {
   setFormData((prev) => ({...prev, [name]: value}));

   // Auto-generate slug from title
   if (name === "title") {
    const slug = generateSlug(value);
    setFormData((prev) => ({...prev, slug}));
   }
  }
 };

 const copyToClipboard = async () => {
  const fullUrl = `${APP_URL}/b/${formData.slug}`;
  try {
   await navigator.clipboard.writeText(fullUrl);
   toast.success("URL copied to clipboard!");
  } catch (err) {
   // Fallback for older browsers
   const textArea = document.createElement("textarea");
   textArea.value = fullUrl;
   document.body.appendChild(textArea);
   textArea.select();
   document.execCommand("copy");
   document.body.removeChild(textArea);
   toast.success("URL copied to clipboard!");
  }
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
   const response = await fetch("/api/boards", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
   });

   const result = await response.json();

   if (result.success) {
    router.push(`/dashboard/boards/${result.data.slug}/edit`);
   } else {
    setError(result.error || "Failed to create board");
   }
  } catch {
   setError("An error occurred. Please try again.");
  } finally {
   setIsLoading(false);
  }
 };

 return (
  <DashboardLayout>
   <div className="max-w-2xl mx-auto">
    {/* Header */}
    <div className="mb-8">
     <div className="flex items-center gap-2 text-sm breadcrumbs">
      <Link href="/dashboard" className="link link-hover">
       Dashboard
      </Link>
      <span>/</span>
      <Link href="/dashboard/boards" className="link link-hover">
       Boards
      </Link>
      <span>/</span>
      <span>New Board</span>
     </div>
     <h1 className="text-3xl font-bold mt-4">Create New Board</h1>
     <p className="text-base-content/70 mt-2">
      Set up a new feedback board to start collecting feature requests from your
      users.
     </p>
    </div>

    {/* Form */}
    <div className="card bg-base-100 shadow-sm">
     <div className="card-body">
      {error && (
       <div className="alert alert-error mb-6">
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
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
         />
        </svg>
        <span>{error}</span>
       </div>
      )}

      <form onSubmit={handleSubmit}>
       {/* Board Title */}
       <div className="form-control mb-4">
        <label className="label">
         <span className="label-text font-medium">Board Title *</span>
        </label>
        <input
         type="text"
         name="title"
         placeholder="Enter your board title"
         className="input input-bordered w-full"
         value={formData.title}
         onChange={handleInputChange}
         required
        />
        <label className="label">
         <span className="label-text-alt">
          This will be displayed as the main title of your feedback board
         </span>
        </label>
       </div>

       {/* Board Description */}
       <div className="form-control mb-4">
        <label className="label">
         <span className="label-text font-medium">Description</span>
        </label>
        <textarea
         name="description"
         placeholder="Describe what this board is for..."
         className="textarea textarea-bordered h-24"
         value={formData.description}
         onChange={handleInputChange}
        />
        <label className="label">
         <span className="label-text-alt">
          Optional: Help users understand what kind of feedback you&apos;re
          looking for
         </span>
        </label>
       </div>

       {/* Board Slug */}
       <div className="form-control mb-4">
        <label className="label">
         <span className="label-text font-medium">Board URL *</span>
        </label>
        <div className="join w-full">
         <input
          type="text"
          name="slug"
          placeholder="board-url"
          className="input input-bordered join-item flex-1"
          value={`${APP_URL}/b/${formData.slug}`}
          readOnly={true}
          disabled={true}
         />
         <button
          type="button"
          className="btn btn-outline join-item"
          onClick={copyToClipboard}
          disabled={!formData.slug}
         >
          <FaRegCopy className="w-4 h-4" />
         </button>
        </div>
        <label className="label">
         <span className="label-text-alt">
          This will be your board&apos;s public URL. Only lowercase letters,
          numbers, and hyphens allowed.
         </span>
        </label>
       </div>

       {/* Board Visibility */}
       <div className="form-control mb-6">
        <label className="label cursor-pointer justify-start gap-3">
         <input
          type="checkbox"
          name="isPublic"
          className="checkbox checkbox-primary"
          checked={formData.isPublic}
          onChange={handleInputChange}
         />
         <div>
          <span className="label-text font-medium">Make board public</span>
          <div className="text-sm text-base-content/70">
           Public boards can be accessed by anyone with the URL. Private boards
           require authentication.
          </div>
         </div>
        </label>
       </div>

       {/* Form Actions */}
       <div className="flex gap-3 justify-end">
        <Link href="/dashboard" className="btn btn-ghost">
         Cancel
        </Link>
        <button
         type="submit"
         className="btn btn-primary"
         disabled={isLoading || !formData.title || !formData.slug}
        >
         {isLoading ? (
          <>
           <span className="loading loading-spinner loading-sm"></span>
           Creating...
          </>
         ) : (
          "Create Board"
         )}
        </button>
       </div>
      </form>
     </div>
    </div>

    {/* Preview */}
    {formData.title && (
     <div className="card bg-base-100 shadow-sm mt-6">
      <div className="card-body">
       <h3 className="card-title text-lg mb-4">Preview</h3>
       <div className="mockup-browser bg-base-300 border">
        <div className="mockup-browser-toolbar">
         <div className="input">
          https://insights.app/b/{formData.slug || "board-url"}
         </div>
        </div>
        <div className="bg-base-100 px-6 py-8">
         <h1 className="text-2xl font-bold mb-2">{formData.title}</h1>
         {formData.description && (
          <p className="text-base-content/70 mb-4">{formData.description}</p>
         )}
         <div className="text-sm text-base-content/50">
          {formData.isPublic ? "🌐 Public board" : "🔒 Private board"}
         </div>
        </div>
       </div>
      </div>
     </div>
    )}
   </div>
  </DashboardLayout>
 );
}

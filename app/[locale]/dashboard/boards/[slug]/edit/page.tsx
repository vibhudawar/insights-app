"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {Link} from "@/i18n/navigation";
import {useTranslations} from "next-intl";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import {LanguageSwitcher} from "@/components/LanguageSwitcher";
import {BoardWithRequests} from "@/types";
import {FaRegCopy} from "react-icons/fa";
import {RiDeleteBinLine} from "react-icons/ri";
import {toast} from "@/utils/toast";
import {APP_URL, daisyThemes} from "@/constants";
import {
 getBoard,
 updateBoardDetails,
 deleteBoardWithConfirmation,
} from "@/frontend apis/apiClient";

interface ThemeConfig {
 primaryColor: string;
 backgroundColor: string;
 textColor: string;
}

export default function EditBoardPage() {
 const params = useParams();
 const slug = params.slug as string;
 const t = useTranslations();

 const [board, setBoard] = useState<BoardWithRequests | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
 const [error, setError] = useState("");
 const [message, setMessage] = useState("");
 const [messageType, setMessageType] = useState<"success" | "error">("success");

 // Form state
 const [boardForm, setBoardForm] = useState({
  title: "",
  description: "",
  slug: "",
  isPublic: true,
 });

 // Theme state
 const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
  primaryColor: "#570df8",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
 });

 // Theme selection state
 const [selectedTheme, setSelectedTheme] = useState<string>("");
 const [showCustomTheme, setShowCustomTheme] = useState<boolean>(true);

 useEffect(() => {
  const fetchBoard = async () => {
   try {
    const data = await getBoard(slug);
    const boardData = data.data;

    if (boardData) {
     setBoard(boardData);

     setBoardForm({
      title: boardData.title,
      description: boardData.description || "",
      slug: boardData.slug,
      isPublic: boardData.is_public,
     });

     // Parse theme config
     if (boardData.theme_config) {
      try {
       const theme =
        typeof boardData.theme_config === "string"
         ? JSON.parse(boardData.theme_config)
         : boardData.theme_config;

       // Check if it's a DaisyUI preset theme or custom theme
       if (typeof theme === "string" && daisyThemes.includes(theme)) {
        setSelectedTheme(theme);
        setShowCustomTheme(false);
       } else if (
        theme.primaryColor ||
        theme.backgroundColor ||
        theme.textColor
       ) {
        // Custom theme config
        setThemeConfig({
         primaryColor: theme.primaryColor || "#570df8",
         backgroundColor: theme.backgroundColor || "#ffffff",
         textColor: theme.textColor || "#1f2937",
        });
        setSelectedTheme("");
        setShowCustomTheme(true);
       }
      } catch {
       // Use default theme if parsing fails
      }
     }
    } else {
     throw new Error("Board not found");
    }
   } catch (err) {
    setError("Failed to load board data");
   } finally {
    setIsLoading(false);
   }
  };

  if (slug) {
   fetchBoard();
  }
 }, [slug]);

 const showMessage = (text: string, type: "success" | "error") => {
  setMessage(text);
  setMessageType(type);
  setTimeout(() => setMessage(""), 5000);
 };

 const copyToClipboard = async () => {
  const fullUrl = `${APP_URL}/b/${boardForm.slug}`;
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
  setIsSaving(true);

  try {
   await updateBoardDetails(params.slug as string, {
    ...boardForm,
    themeConfig: selectedTheme
     ? {presetTheme: selectedTheme}
     : (themeConfig as unknown as Record<string, unknown>),
   });
   showMessage(t("board.boardUpdated"), "success");
  } catch (err) {
   showMessage(t("board.failedToUpdate"), "error");
  } finally {
   setIsSaving(false);
  }
 };

 const resetTheme = () => {
  setThemeConfig({
   primaryColor: "#570df8",
   backgroundColor: "#ffffff",
   textColor: "#1f2937",
  });
 };

 const handleDeleteBoard = async () => {
  if (!window.confirm(t("board.confirmDelete", {title: board?.title || ""}))) {
   return;
  }

  setIsDeleting(true);
  try {
   await deleteBoardWithConfirmation(params.slug as string);
   showMessage(t("board.boardDeleted"), "success");
   setTimeout(() => {
    window.location.href = "/dashboard/boards";
   }, 1500);
  } catch (err) {
   showMessage(t("board.failedToDelete"), "error");
  } finally {
   setIsDeleting(false);
  }
 };

 const previewTheme = {
  primaryColor: themeConfig.primaryColor,
  backgroundColor: themeConfig.backgroundColor,
  textColor: themeConfig.textColor,
 };

 if (isLoading) {
  return (
   <DashboardLayout>
    <div className="flex items-center justify-center min-h-screen">
     <span className="loading loading-spinner loading-lg"></span>
    </div>
   </DashboardLayout>
  );
 }

 if (error || !board) {
  return (
   <DashboardLayout>
    <div className="flex items-center justify-center min-h-screen">
     <div className="text-center">
      <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-6">
       <svg
        className="w-10 h-10 text-base-content/50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
       >
        <path
         strokeLinecap="round"
         strokeLinejoin="round"
         strokeWidth={2}
         d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
       </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">{t("board.boardNotFound")}</h1>
      <p className="text-base-content/70 mb-4">
       {error ||
        t("board.boardNotFoundMessage", {
         default:
          "The board you're looking for doesn't exist or you don't have permission to edit it.",
        })}
      </p>
      <Link href="/dashboard" className="btn btn-primary">
       {t("board.backToDashboard")}
      </Link>
     </div>
    </div>
   </DashboardLayout>
  );
 }

 return (
  <DashboardLayout>
   <div className="container mx-auto px-4 py-8">
    <div className="max-w-6xl mx-auto">
     {/* Header */}
     <div className="flex items-center justify-between mb-8">
      <div>
       <h1 className="text-3xl font-bold text-base-content mb-2">
        {t("board.editBoard")}: {board.title}
       </h1>
       <div className="breadcrumbs text-sm">
        <ul>
         <li>
          <Link href="/dashboard">{t("dashboard.title")}</Link>
         </li>
         <li>
          <Link href="/dashboard/boards">{t("dashboard.boards")}</Link>
         </li>
         <li>{t("board.editBoard")}</li>
        </ul>
       </div>
      </div>
      <div className="flex gap-2">
       <LanguageSwitcher />
       <Link
        href={`/dashboard/boards/${slug}/analytics`}
        className="btn btn-outline btn-sm"
       >
        {t("dashboard.analytics")}
       </Link>
       <Link
        href={`/b/${slug}`}
        className="btn btn-primary btn-sm"
        target="_blank"
       >
        {t("navigation.viewPublicBoard")}
        <svg
         className="w-4 h-4 ml-1"
         fill="none"
         stroke="currentColor"
         viewBox="0 0 24 24"
        >
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
         />
        </svg>
       </Link>
      </div>
     </div>

     {/* Message Alert */}
     {message && (
      <div
       className={`alert ${
        messageType === "success" ? "alert-success" : "alert-error"
       } mb-6`}
      >
       <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
       >
        {messageType === "success" ? (
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
         />
        ) : (
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
         />
        )}
       </svg>
       <span>{message}</span>
      </div>
     )}

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="space-y-6">
       {/* Basic Settings */}
       <div className="card bg-base-100 shadow">
        <div className="card-body">
         <h2 className="card-title mb-4">{t("board.basicSettings")}</h2>

         <form onSubmit={handleSubmit}>
          <div className="space-y-4">
           <fieldset className="fieldset">
            <label className="label">
             <span className="label-text font-medium">
              {t("board.title")} {t("form.required")}
             </span>
            </label>
            <input
             type="text"
             className="input input-bordered"
             value={boardForm.title}
             onChange={(e) =>
              setBoardForm((prev) => ({...prev, title: e.target.value}))
             }
             required
             placeholder={t("form.placeholder.boardTitle")}
            />
           </fieldset>

           <fieldset className="fieldset">
            <label className="label">
             <span className="label-text font-medium">
              {t("board.description")}
             </span>
            </label>
            <textarea
             className="textarea textarea-bordered h-24"
             value={boardForm.description}
             onChange={(e) =>
              setBoardForm((prev) => ({...prev, description: e.target.value}))
             }
             placeholder={t("form.placeholder.description")}
            />
           </fieldset>

           <fieldset className="fieldset">
            <label className="label">
             <span className="label-text font-medium">
              {t("board.boardUrl")}
             </span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
             <span className="text-base-content/70 text-sm">/b/</span>
             <input
              type="text"
              className="grow"
              value={boardForm.slug}
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and dashes"
              placeholder={t("form.placeholder.boardSlug")}
              readOnly
             />
             <button
              type="button"
              className="btn btn-soft btn-primary"
              onClick={copyToClipboard}
              disabled={!boardForm.slug}
             >
              <FaRegCopy className="w-4 h-4" />
             </button>
            </label>
            <label className="label">
             <span className="label-text-alt">{t("board.onlyLowercase")}</span>
            </label>
           </fieldset>

           {/* <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
             <input
              type="checkbox"
              className="checkbox"
              checked={boardForm.isPublic}
              onChange={(e) =>
               setBoardForm((prev) => ({...prev, isPublic: e.target.checked}))
              }
             />
             <div>
              <div className="label-text font-medium">
               {t("board.publicBoard")}
              </div>
              <div className="label-text-alt">
               {t("board.allowPublicSubmissions")}
              </div>
             </div>
            </label>
           </div> */}
          </div>
         </form>
        </div>
       </div>

       {/* Theme Selection */}
       <div className="card bg-base-100 shadow">
        <div className="card-body">
         <h2 className="card-title mb-4">{t("theme.customization")}</h2>

         <div className="flex flex-row gap-4 justify-center items-center mb-4">
          {/* DaisyUI Theme Dropdown */}
          <div className="flex-1">
           <label className="label">
            <span className="label-text font-medium">
             {t("theme.presetTheme")}
            </span>
           </label>
           <div className="dropdown w-full">
            <div
             tabIndex={0}
             role="button"
             className="btn btn-outline w-full justify-between"
            >
             {selectedTheme
              ? selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)
              : t("theme.presetTheme")}
             <svg
              width="12px"
              height="12px"
              className="inline-block h-2 w-2 fill-current opacity-60"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2048 2048"
             >
              <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
             </svg>
            </div>
            <ul
             tabIndex={0}
             className="dropdown-content bg-base-300 rounded-box z-[1] w-full max-h-60 overflow-y-auto p-2 shadow-2xl"
            >
             <li>
              <button
               type="button"
               className="btn btn-sm btn-ghost justify-start w-full text-left"
               onClick={() => {
                setSelectedTheme("");
                setShowCustomTheme(true);
                (document.activeElement as HTMLElement)?.blur();
               }}
              >
               {t("theme.select")}
              </button>
             </li>
             {daisyThemes.map((theme) => (
              <li key={theme}>
               <button
                type="button"
                className="btn btn-sm btn-ghost justify-start w-full text-left"
                onClick={() => {
                 setSelectedTheme(theme);
                 setShowCustomTheme(false);
                 (document.activeElement as HTMLElement)?.blur();
                }}
               >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
               </button>
              </li>
             ))}
            </ul>
           </div>
          </div>

          {/* Set Custom Theme Button */}
          <div className="flex-shrink-0">
           <label className="label">
            <span className="label-text font-medium opacity-0">Action</span>
           </label>
           <button
            type="button"
            className={`btn ${showCustomTheme ? "btn-primary" : "btn-outline"}`}
            onClick={() => {
             setShowCustomTheme(!showCustomTheme);
             if (!showCustomTheme) {
              setSelectedTheme("");
             }
            }}
           >
            {t("theme.setCustomTheme")}
           </button>
          </div>
         </div>
        </div>
       </div>

       {/* Theme Customization */}
       {showCustomTheme && (
        <div className="card bg-base-100 shadow">
         <div className="card-body">
          <div className="flex items-center justify-between mb-4">
           <h2 className="card-title">{t("theme.customization")}</h2>
           <div className="flex gap-2">
            <button
             type="button"
             onClick={resetTheme}
             className="btn btn-sm btn-ghost"
            >
             {t("theme.reset")}
            </button>
           </div>
          </div>

          <div className="space-y-4">
           <fieldset className="fieldset">
            <label className="label">
             <span className="label-text font-medium">
              {t("theme.primaryColor")}
             </span>
            </label>
            <div className="flex items-center gap-3">
             <input
              type="color"
              className="w-12 h-10 rounded border border-base-300"
              value={themeConfig.primaryColor}
              onChange={(e) =>
               setThemeConfig((prev) => ({
                ...prev,
                primaryColor: e.target.value,
               }))
              }
             />
             <input
              type="text"
              className="input input-bordered flex-1"
              value={themeConfig.primaryColor}
              onChange={(e) =>
               setThemeConfig((prev) => ({
                ...prev,
                primaryColor: e.target.value,
               }))
              }
              placeholder="#570df8"
             />
            </div>
           </fieldset>

           <fieldset className="fieldset">
            <label className="label">
             <span className="label-text font-medium">
              {t("theme.backgroundColor")}
             </span>
            </label>
            <div className="flex items-center gap-3">
             <input
              type="color"
              className="w-12 h-10 rounded border border-base-300"
              value={themeConfig.backgroundColor}
              onChange={(e) =>
               setThemeConfig((prev) => ({
                ...prev,
                backgroundColor: e.target.value,
               }))
              }
             />
             <input
              type="text"
              className="input input-bordered flex-1"
              value={themeConfig.backgroundColor}
              onChange={(e) =>
               setThemeConfig((prev) => ({
                ...prev,
                backgroundColor: e.target.value,
               }))
              }
              placeholder="#ffffff"
             />
            </div>
           </fieldset>

           <fieldset className="fieldset">
            <label className="label">
             <span className="label-text font-medium">
              {t("theme.textColor")}
             </span>
            </label>
            <div className="flex items-center gap-3">
             <input
              type="color"
              className="w-12 h-10 rounded border border-base-300"
              value={themeConfig.textColor}
              onChange={(e) =>
               setThemeConfig((prev) => ({...prev, textColor: e.target.value}))
              }
             />
             <input
              type="text"
              className="input input-bordered flex-1"
              value={themeConfig.textColor}
              onChange={(e) =>
               setThemeConfig((prev) => ({...prev, textColor: e.target.value}))
              }
              placeholder="#1f2937"
             />
            </div>
           </fieldset>
          </div>
         </div>
        </div>
       )}

       {/* Action Buttons */}
       <div className="space-y-3">
        <button
         onClick={handleSubmit}
         className="btn btn-primary w-full"
         disabled={isSaving || isDeleting}
        >
         {isSaving ? (
          <>
           <span className="loading loading-spinner loading-sm"></span>
           {t("board.savingChanges")}
          </>
         ) : (
          t("board.saveChanges")
         )}
        </button>

        {/* Danger Zone */}
        <div className="divider text-error">{t("dangerZone")}</div>
        <button
         onClick={handleDeleteBoard}
         className="btn btn-error btn-outline w-full"
         disabled={isSaving || isDeleting}
        >
         {isDeleting ? (
          <>
           <span className="loading loading-spinner loading-sm"></span>
           {t("board.deleting")}
          </>
         ) : (
          <>
           <RiDeleteBinLine className="w-4 h-4 mr-2" />
           {t("board.deleteBoard")}
          </>
         )}
        </button>
       </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
       <div className="card bg-base-100 shadow">
        <div className="card-body">
         <h2 className="card-title mb-4">{t("theme.livePreview")}</h2>

         {/* Preview Container */}
         <div
          className="border-2 border-dashed border-base-300 rounded-lg p-6 min-h-[400px]"
          data-theme={selectedTheme || undefined}
          style={
           selectedTheme
            ? {}
            : {
               backgroundColor: previewTheme.backgroundColor,
               color: previewTheme.textColor,
              }
          }
         >
          {/* Mock Board Header */}
          <div
           className={
            selectedTheme
             ? "rounded-lg p-6 mb-6 bg-base-200 border border-base-300"
             : "rounded-lg p-6 mb-6"
           }
           style={
            selectedTheme
             ? {}
             : {
                backgroundColor: `${previewTheme.primaryColor}15`,
                borderColor: `${previewTheme.primaryColor}30`,
                border: "1px solid",
               }
           }
          >
           <div className="flex items-center justify-between mb-4">
            <h1
             className={
              selectedTheme
               ? "text-2xl font-bold text-base-content"
               : "text-2xl font-bold"
             }
             style={selectedTheme ? {} : {color: previewTheme.textColor}}
            >
             {boardForm.title || t("board.title")}
            </h1>
            <div
             className={
              selectedTheme ? "badge badge-sm badge-primary" : "badge badge-sm"
             }
             style={
              selectedTheme
               ? {}
               : {
                  backgroundColor: previewTheme.primaryColor,
                  color: "white",
                  borderColor: previewTheme.primaryColor,
                 }
             }
            >
             {t("board.publicBoard")}
            </div>
           </div>
           {boardForm.description && (
            <p
             className={
              selectedTheme
               ? "text-lg opacity-80 text-base-content"
               : "text-lg opacity-80"
             }
             style={selectedTheme ? {} : {color: previewTheme.textColor}}
            >
             {boardForm.description}
            </p>
           )}
           <button
            className={
             selectedTheme ? "btn btn-sm btn-primary mt-4" : "btn btn-sm mt-4"
            }
            style={
             selectedTheme
              ? {}
              : {
                 backgroundColor: previewTheme.primaryColor,
                 borderColor: previewTheme.primaryColor,
                 color: "white",
                }
            }
           >
            Submit Request
           </button>
          </div>

          {/* Mock Feature Request */}
          <div
           className={
            selectedTheme
             ? "bg-base-100 rounded-lg p-4 shadow-sm"
             : "bg-white/50 rounded-lg p-4 shadow-sm"
           }
          >
           <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
             <button
              className={
               selectedTheme
                ? "btn btn-ghost btn-sm text-primary"
                : "btn btn-ghost btn-sm"
              }
              style={selectedTheme ? {} : {color: previewTheme.primaryColor}}
             >
              <svg
               className="w-4 h-4"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
              >
               <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
               />
              </svg>
             </button>
             <span
              className={
               selectedTheme
                ? "text-xs font-bold text-base-content"
                : "text-xs font-bold"
              }
             >
              42
             </span>
            </div>
            <div className="flex-1">
             <h3
              className={
               selectedTheme
                ? "font-semibold mb-1 text-base-content"
                : "font-semibold mb-1"
              }
              style={selectedTheme ? {} : {color: previewTheme.textColor}}
             >
              Sample Feature Request
             </h3>
             <p
              className={
               selectedTheme
                ? "text-sm opacity-70 mb-2 text-base-content"
                : "text-sm opacity-70 mb-2"
              }
              style={selectedTheme ? {} : {color: previewTheme.textColor}}
             >
              This is how a feature request would look with your{" "}
              {selectedTheme ? "selected" : "custom"} theme.
             </p>
             <div
              className={
               selectedTheme
                ? "text-xs opacity-60 text-base-content"
                : "text-xs opacity-60"
              }
              style={selectedTheme ? {} : {color: previewTheme.textColor}}
             >
              By User • 2 days ago
             </div>
            </div>
           </div>
          </div>
         </div>
        </div>
       </div>

       {/* Board Statistics */}
       <div className="stats stats-vertical shadow w-full">
        <div className="stat">
         <div className="stat-title">Total Requests</div>
         <div className="stat-value">{board.feature_requests?.length || 0}</div>
         <div className="stat-desc">Feature requests</div>
        </div>
        <div className="stat">
         <div className="stat-title">Board Status</div>
         <div
          className={`stat-value ${
           board.is_public ? "text-success" : "text-warning"
          }`}
         >
          {board.is_public ? "Public" : "Private"}
         </div>
         <div className="stat-desc">Visibility setting</div>
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>
  </DashboardLayout>
 );
}

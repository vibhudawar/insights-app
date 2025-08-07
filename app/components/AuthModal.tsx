"use client";

import {useState, useEffect} from "react";
import {signIn, getSession} from "next-auth/react";
import {FcGoogle} from "react-icons/fc";
import {useTranslations} from "next-intl";

interface AuthModalProps {
 isOpen: boolean;
 onClose: () => void;
 title?: string;
 message?: string;
 onSuccess?: () => void;
}

export function AuthModal({
 isOpen,
 onClose,
 title,
 message,
 onSuccess,
}: AuthModalProps) {
 const t = useTranslations();
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");

 // Reset state when modal opens/closes
 useEffect(() => {
  if (isOpen) {
   setIsLoading(false);
   setError("");
  }
 }, [isOpen]);

 const handleGoogleSignIn = async () => {
  try {
   setIsLoading(true);
   setError("");

   const result = await signIn("google", {
    redirect: false,
    callbackUrl: window.location.href,
   });

   if (result?.error) {
    setError("Failed to sign in. Please try again.");
   } else if (result?.ok) {
    // Wait for session to be established
    setTimeout(async () => {
     const session = await getSession();
     if (session) {
      onClose();
      onSuccess?.();
     }
    }, 1000);
   }
  } catch (error) {
   console.error("Sign in error:", error);
   setError("An error occurred during sign in.");
  } finally {
   setIsLoading(false);
  }
 };

 if (!isOpen) return null;

 return (
  <div className="modal modal-open">
   <div className="modal-box max-w-md">
    <div className="flex items-center justify-between mb-6">
     <h3 className="font-bold text-xl">{title || t("auth.signInRequired")}</h3>
     <button
      onClick={onClose}
      className="btn btn-sm btn-circle btn-ghost"
      disabled={isLoading}
     >
      ✕
     </button>
    </div>

    <div className="mb-6">
     <p className="text-base-content/80 mb-4">
      {message || t("auth.signInMessage")}
     </p>

     <div className="bg-base-200 rounded-lg p-4 mb-4">
      <h4 className="font-semibold mb-2 text-sm">{t("auth.whySignIn")}</h4>
      <ul className="text-sm text-base-content/70 space-y-1">
       <li>• {t("auth.benefit1")}</li>
       <li>• {t("auth.benefit2")}</li>
       <li>• {t("auth.benefit3")}</li>
      </ul>
     </div>
    </div>

    {error && (
     <div className="alert alert-error mb-4">
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

    <div className="space-y-3 mb-6">
     <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="btn btn-outline w-full flex items-center justify-center gap-3 h-12"
     >
      {isLoading ? (
       <span className="loading loading-spinner loading-sm"></span>
      ) : (
       <>
        <FcGoogle className="text-xl" />
        <span>{t("auth.continueWithGoogle")}</span>
       </>
      )}
     </button>
    </div>

    <div className="text-center">
     <p className="text-xs text-base-content/60">
      {t("auth.termsMessage")}{" "}
      <a href="#" className="link link-primary">
       {t("auth.privacyPolicy")}
      </a>
     </p>
    </div>

    <div className="modal-action">
     <button onClick={onClose} className="btn btn-ghost" disabled={isLoading}>
      {t("common.cancel")}
     </button>
    </div>
   </div>
  </div>
 );
}

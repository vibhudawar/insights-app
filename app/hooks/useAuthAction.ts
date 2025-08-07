"use client";

import {useState, useCallback} from "react";
import {useSession} from "next-auth/react";
import {toast} from "@/utils/toast";

interface UseAuthActionProps {
 onSuccess?: () => void;
 requireAuthMessage?: string;
 requireAuthTitle?: string;
}

export function useAuthAction({
 onSuccess,
 requireAuthMessage,
 requireAuthTitle,
}: UseAuthActionProps = {}) {
 const {data: session, status} = useSession();
 const [showAuthModal, setShowAuthModal] = useState(false);

 const executeWithAuth = useCallback(
  (action: () => void | Promise<void>) => {
   if (status === "loading") {
    return; // Wait for session to load
   }

   if (!session?.user) {
    toast.warning(
     requireAuthMessage || "Please sign in to continue with this action.",
     {
      position: "bottom",
      alignment: "end",
     }
    );
    setShowAuthModal(true);
    return;
   }

   // User is authenticated, execute the action
   const result = action();

   // If action returns a promise, handle success callback
   if (result instanceof Promise) {
    result
     .then(() => {
      onSuccess?.();
     })
     .catch((error) => {
      console.error("Action failed:", error);
     });
   } else {
    onSuccess?.();
   }
  },
  [session, status, onSuccess, requireAuthMessage]
 );

 const closeAuthModal = useCallback(() => {
  setShowAuthModal(false);
 }, []);

 const handleAuthSuccess = useCallback(() => {
  setShowAuthModal(false);
  onSuccess?.();
 }, [onSuccess]);

 return {
  isAuthenticated: !!session?.user,
  user: session?.user,
  executeWithAuth,
  showAuthModal,
  closeAuthModal,
  handleAuthSuccess,
  authModalProps: {
   title: requireAuthTitle,
   message: requireAuthMessage,
  },
 };
}

"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";

export default function SettingsPage() {
 const router = useRouter();

 useEffect(() => {
  // Redirect to profile page as default
  router.replace("/dashboard/settings/profile");
 }, [router]);

 return null; // This component will redirect immediately
}
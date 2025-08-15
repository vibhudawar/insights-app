"use client";

import {useSession} from "next-auth/react";
import {ReactNode} from "react";
import {Link} from "@/i18n/navigation";
import {SideBarComponent} from "@/components/SideBar.component";

interface DashboardLayoutProps {
 children: ReactNode;
}

export function DashboardLayout({children}: DashboardLayoutProps) {
 const {data: session, status} = useSession();

 if (status === "loading") {
  return (
   <div className="min-h-screen flex items-center justify-center">
    <span className="loading loading-spinner loading-lg"></span>
   </div>
  );
 }

 if (!session) {
  return (
   <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
     <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
     <p className="mb-4">You need to be signed in to access this page.</p>
     <Link href="/auth/signin" className="btn btn-primary">
      Sign In
     </Link>
    </div>
   </div>
  );
 }

 return <SideBarComponent>{children}</SideBarComponent>;
}

"use client";

import {useSession, signOut} from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {ReactNode} from "react";
import {NavItem} from "@/types";
import {RiDashboardLine, RiDashboardFill} from "react-icons/ri";
import { IoSettingsSharp, IoSettingsOutline } from "react-icons/io5";
import { HiOutlineChartBar, HiChartBar, HiViewBoards, HiOutlineViewBoards } from "react-icons/hi";

interface DashboardLayoutProps {
 children: ReactNode;
}

const navigation: NavItem[] = [
 {
  name: "Dashboard",
  href: "/dashboard",
  icon: ({className, isActive}) => 
   isActive ? (
    <RiDashboardFill className={className} />
   ) : (
    <RiDashboardLine className={className} />
   ),
 },
 {
  name: "Boards",
  href: "/dashboard/boards",
  icon: ({className, isActive}) => 
   isActive ? (
    <HiViewBoards className={className} />
   ) : (
    <HiOutlineViewBoards className={className} />
   ),
 },
 {
  name: "Analytics",
  href: "/dashboard/analytics",
  icon: ({className, isActive}) => 
   isActive ? (
    <HiChartBar className={className} />
   ) : (
    <HiOutlineChartBar className={className} />
   ),
 },
 {
  name: "Settings",
  href: "/dashboard/settings",
  icon: ({className, isActive}) => 
   isActive ? (
    <IoSettingsSharp className={className} />
   ) : (
    <IoSettingsOutline className={className} />
   ),
 },
];

export function DashboardLayout({children}: DashboardLayoutProps) {
 const {data: session, status} = useSession();
 const pathname = usePathname();

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

 const handleSignOut = () => {
  signOut({callbackUrl: "/"});
 };

 return (
  <div className="min-h-screen bg-base-100">
   {/* Desktop Sidebar */}
   <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-base-200 px-6 pb-4">
     <div className="flex h-16 shrink-0 items-center">
      <Link href="/dashboard" className="text-2xl font-bold">
       Insights
      </Link>
     </div>
     <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
       <li>
        <ul role="list" className="-mx-2 space-y-1">
         {navigation.map((item) => {
          const isCurrent = item.href === "/dashboard" 
           ? pathname === "/dashboard"
           : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
           <li key={item.name}>
            <Link
             href={item.href}
             className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
              isCurrent
               ? "bg-primary text-primary-content"
               : "text-base-content hover:bg-base-300"
             }`}
            >
             {item.icon && <item.icon className="h-6 w-6 shrink-0" isActive={isCurrent} />}
             {item.name}
            </Link>
           </li>
          );
         })}
        </ul>
       </li>
       <li className="mt-auto">
        <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6">
         <div className="avatar">
          <div className="w-8 h-8 rounded-full">
           {session.user?.image ? (
            <Image
             src={session.user.image}
             alt={session.user.name || "User"}
             width={32}
             height={32}
             className="rounded-full"
            />
           ) : (
            <div className="bg-primary text-primary-content flex items-center justify-center h-full w-full rounded-full">
             {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
            </div>
           )}
          </div>
         </div>
         <span className="sr-only">Your profile</span>
         <div className="flex-1">
          <div className="text-sm font-medium">
           {session.user?.name || "User"}
          </div>
          <div className="text-xs opacity-70">{session.user?.email}</div>
         </div>
         <div className="dropdown dropdown-top dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
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
             d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
            />
           </svg>
          </div>
          <ul
           tabIndex={0}
           className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
          >
           <li>
            <Link href="/dashboard/settings">Settings</Link>
           </li>
           <li>
            <button onClick={handleSignOut}>Sign out</button>
           </li>
          </ul>
         </div>
        </div>
       </li>
      </ul>
     </nav>
    </div>
   </div>

   {/* Mobile menu */}
   <div className="lg:hidden">
    <div className="navbar bg-base-200">
     <div className="navbar-start">
      <div className="dropdown">
       <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
        <svg
         className="w-5 h-5"
         fill="none"
         stroke="currentColor"
         viewBox="0 0 24 24"
        >
         <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
         />
        </svg>
       </div>
       <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
       >
        {navigation.map((item) => {
         const isCurrent = item.href === "/dashboard" 
          ? pathname === "/dashboard"
          : pathname === item.href || pathname.startsWith(item.href + "/");
         return (
          <li key={item.name}>
           <Link href={item.href} className="flex items-center gap-2">
            {item.icon && <item.icon className="h-4 w-4" isActive={isCurrent} />}
            {item.name}
           </Link>
          </li>
         );
        })}
        <div className="divider my-2"></div>
        <li>
         <Link href="/dashboard/settings">Settings</Link>
        </li>
        <li>
         <button onClick={handleSignOut}>Sign out</button>
        </li>
       </ul>
      </div>
     </div>
     <div className="navbar-center">
      <Link href="/dashboard" className="text-xl font-bold">
       Insights
      </Link>
     </div>
         <div className="navbar-end">
     <div className="avatar">
      <div className="w-8 h-8 rounded-full">
       {session.user?.image ? (
        <Image
         src={session.user.image}
         alt={session.user.name || "User"}
         width={32}
         height={32}
         className="rounded-full"
        />
       ) : (
        <div className="bg-primary text-primary-content flex items-center justify-center h-full w-full rounded-full">
         {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
        </div>
       )}
      </div>
     </div>
    </div>
    </div>
   </div>

   {/* Main content */}
   <main className="lg:pl-72">
    <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
   </main>
  </div>
 );
}

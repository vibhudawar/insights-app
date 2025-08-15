"use client";

import {useState, useEffect} from "react";
import {signOut} from "next-auth/react";
import Image from "next/image";
import {ReactNode} from "react";
import {NavItem} from "@/types";
import {RiDashboardLine, RiDashboardFill} from "react-icons/ri";
import {
 IoSettingsOutline,
 IoSettings,
 IoCardOutline,
 IoCard,
 IoBanOutline,
} from "react-icons/io5";
import {
 HiOutlineChartBar,
 HiChartBar,
 HiViewBoards,
 HiOutlineViewBoards,
} from "react-icons/hi";
import {Link, usePathname} from "@/i18n/navigation";
import {useCurrentUser} from "@/hooks/useCurrentUser";
import {BiUserCircle, BiSolidUserCircle} from "react-icons/bi";
import {MdOutlineDangerous, MdDangerous} from "react-icons/md";
import {FaChevronRight, FaChevronDown} from "react-icons/fa6";
import {IoMenu} from "react-icons/io5";
import {VscKebabVertical} from "react-icons/vsc";
import {PiSignOut} from "react-icons/pi";

interface SideBarProps {
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
  icon: ({className, isActive}) =>
   isActive ? (
    <IoSettings className={className} />
   ) : (
    <IoSettingsOutline className={className} />
   ),
  children: [
   {
    name: "Profile",
    href: "/dashboard/settings/profile",
    icon: ({className, isActive}) =>
     isActive ? (
      <BiSolidUserCircle className={className} />
     ) : (
      <BiUserCircle className={className} />
     ),
   },
   {
    name: "Account",
    href: "/dashboard/settings/account",
    icon: ({className, isActive}) =>
     isActive ? (
      <IoSettings className={className} />
     ) : (
      <IoSettingsOutline className={className} />
     ),
   },

   {
    name: "Billing",
    href: "/dashboard/settings/billing",
    icon: ({className, isActive}) =>
     isActive ? (
      <IoCard className={className} />
     ) : (
      <IoCardOutline className={className} />
     ),
   },

   {
    name: "Danger Zone",
    href: "/dashboard/settings/danger-zone",
    icon: ({className, isActive}) =>
     isActive ? (
      <MdDangerous className={className} />
     ) : (
      <MdOutlineDangerous className={className} />
     ),
   },
  ],
 },
];

export const SideBarComponent = ({children}: SideBarProps) => {
 const user = useCurrentUser();
 const pathname = usePathname();

 // Auto-expand settings if on settings page
 const isOnSettingsPage = pathname.startsWith("/dashboard/settings");
 const [settingsIsOpen, setSettingsIsOpen] = useState(isOnSettingsPage);

 // Watch pathname changes to auto-expand settings menu
 useEffect(() => {
  const isOnSettingsPage = pathname.startsWith("/dashboard/settings");
  setSettingsIsOpen(isOnSettingsPage);
 }, [pathname]);

 const handleSignOut = () => {
  signOut({callbackUrl: "/"});
 };

 const isCurrentPath = (href: string) => {
  return href === "/dashboard"
   ? pathname === "/dashboard"
   : pathname === href || pathname.startsWith(href + "/");
 };

 return (
  <div className="drawer lg:drawer-open">
   <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />

   {/* Main Content */}
   <div className="drawer-content flex flex-col">
    {/* Mobile Header */}
    <div className="navbar bg-base-200 lg:hidden">
     <div className="navbar-start">
      <label htmlFor="drawer-toggle" className="btn btn-square btn-ghost">
       <IoMenu className="w-6 h-6" />
      </label>
     </div>
     <div className="navbar-center">
      <Link href="/dashboard" className="text-xl font-bold">
       Insights
      </Link>
     </div>
     <div className="navbar-end">
      <UserAvatar user={user || {}} />
     </div>
    </div>

    {/* Page Content */}
    <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
   </div>

   {/* Drawer Side */}
   <div className="drawer-side">
    <label
     htmlFor="drawer-toggle"
     aria-label="close sidebar"
     className="drawer-overlay"
    ></label>

    <aside className="min-h-full w-80 bg-base-200 flex flex-col">
     {/* Logo/Brand */}
     <div className="flex h-16 shrink-0 items-center px-6">
      <Link href="/dashboard" className="text-2xl font-bold">
       Insights
      </Link>
     </div>

     {/* Navigation */}
     <nav className="flex-1 px-4 py-4">
      <NavigationItems
       navigation={navigation}
       pathname={pathname}
       isCurrentPath={isCurrentPath}
       settingsIsOpen={settingsIsOpen}
       setSettingsIsOpen={setSettingsIsOpen}
      />
     </nav>

     {/* User Profile Section */}
     {user && (
      <div className="p-4 border-t border-base-300">
       <UserProfileSection user={user} handleSignOut={handleSignOut} />
      </div>
     )}
    </aside>
   </div>
  </div>
 );
};

// Sub-components for better organization
const UserAvatar = ({
 user,
}: {
 user: {image?: string | null; name?: string | null; email?: string | null};
}) => (
 <div className="avatar">
  <div className="w-8 h-8 rounded-full">
   {user?.image ? (
    <Image
     src={user.image}
     alt={user.name || "User"}
     width={32}
     height={32}
     className="rounded-full"
    />
   ) : (
    <div className="bg-primary text-primary-content flex items-center justify-center h-full w-full rounded-full">
     {user?.name?.[0] || user?.email?.[0] || "U"}
    </div>
   )}
  </div>
 </div>
);

const NavigationItems = ({
 navigation,
 pathname,
 isCurrentPath,
 settingsIsOpen,
 setSettingsIsOpen,
}: {
 navigation: NavItem[];
 pathname: string;
 isCurrentPath: (href: string) => boolean;
 settingsIsOpen: boolean;
 setSettingsIsOpen: (value: boolean) => void;
}) => (
 <ul className="menu menu-lg w-full">
  {navigation.map((item) => {
   const isCurrent = item.href ? isCurrentPath(item.href) : false;
   const isSettingsItem = item.name === "Settings";

   return (
    <li key={item.name}>
     {item.href ? (
      <Link
       href={item.href}
       className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
        isCurrent ? "bg-primary text-primary-content" : "hover:bg-base-300"
       }`}
      >
       {item.icon && (
        <item.icon className="h-6 w-6 shrink-0" isActive={isCurrent} />
       )}
       <span className="font-medium">{item.name}</span>
      </Link>
     ) : (
      <button
       onClick={() => isSettingsItem && setSettingsIsOpen(!settingsIsOpen)}
       className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors w-full text-left hover:bg-base-300`}
      >
       {item.icon && (
        <item.icon className="h-6 w-6 shrink-0" isActive={false} />
       )}
       <span className="font-medium flex-1">{item.name}</span>
       {isSettingsItem &&
        (settingsIsOpen ? (
         <FaChevronDown className="h-4 w-4 shrink-0" />
        ) : (
         <FaChevronRight className="h-4 w-4 shrink-0" />
        ))}
      </button>
     )}
     {item.children && isSettingsItem && settingsIsOpen && (
      <ul className="menu menu-lg w-full">
       {item.children.map((child) => {
        const childIsCurrent = child.href ? isCurrentPath(child.href) : false;
        return (
         <li key={child.name}>
          <Link
           href={child.href!}
           className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
            childIsCurrent
             ? "bg-primary text-primary-content"
             : "hover:bg-base-300"
           }`}
          >
           {child.icon && (
            <child.icon
             className="h-6 w-6 shrink-0"
             isActive={childIsCurrent}
            />
           )}
           <span className="font-medium">{child.name}</span>
          </Link>
         </li>
        );
       })}
      </ul>
     )}
    </li>
   );
  })}
 </ul>
);

const UserProfileSection = ({
 user,
 handleSignOut,
}: {
 user: {image?: string | null; name?: string | null; email?: string | null};
 handleSignOut: () => void;
}) => (
 <div className="flex items-center gap-3">
  <UserAvatar user={user} />
  <div className="flex-1 min-w-0">
   <div className="text-sm font-medium truncate">{user.name || "User"}</div>
   <div className="text-xs opacity-70 truncate">{user.email}</div>
  </div>
  <div className="dropdown dropdown-top dropdown-end">
   <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
    <VscKebabVertical className="w-4 h-4" />
   </div>
   <ul
    tabIndex={0}
    className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg"
   >
    <li>
     <Link href="/dashboard/settings" className="flex items-center gap-2">
      <IoSettingsOutline className="h-4 w-4" />
      Settings
     </Link>
    </li>
    <div className="divider my-1"></div>
    <li>
     <button
      onClick={handleSignOut}
      className="flex items-center gap-2 text-error hover:bg-error hover:text-error-content"
     >
      <PiSignOut className="h-4 w-4" />
      Sign out
     </button>
    </li>
   </ul>
  </div>
 </div>
);

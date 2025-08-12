import Link from "next/link";
import {IoEarthOutline} from "react-icons/io5";
import {MdLockOutline} from "react-icons/md";

interface SmallStatsProps {
 stat: number;
 statName: string;
 icon: React.ReactNode;
}

interface DropdownMenuRowProps {
 icon: React.ReactNode;
 text: string;
 link: string;
}

interface BadgeProps {
 visibility: string;
}

interface AnalyticsStatsProps {
 icon: React.ReactNode;
 text: string;
 stat: number;
}

export const SmallStats = (props: SmallStatsProps) => {
 return (
  <div className="flex items-center gap-1.5 text-base-content/60">
   {props.icon}
   <span className="text-sm font-medium">{props.stat}</span>
   <span className="text-xs">{props.statName}</span>
  </div>
 );
};

export const DropdownMenuRow = (props: DropdownMenuRowProps) => {
 return (
  <Link href={props.link} target="_blank" className="flex items-center gap-2">
   {props.icon}
   {props.text}
  </Link>
 );
};

export const Badge = (props: BadgeProps) => {
 const getBadgeClass = (visibility: string) => {
  switch (visibility.toLowerCase()) {
   case "public":
    return "badge-success";
   case "private":
    return "badge-warning";
   default:
    return "badge-ghost";
  }
 };

 const getStatusIcon = (visibility: string) => {
  switch (visibility.toLowerCase()) {
   case "public":
    return <IoEarthOutline className="w-3 h-3 text-white" />;
   case "private":
    return <MdLockOutline className="w-3 h-3 text-white" />;
   default:
    return <IoEarthOutline className="w-3 h-3 text-white" />;
  }
 };

 return (
  <div className="flex items-center gap-2">
   <div
    className={`badge ${getBadgeClass(
     props.visibility
    )} badge-sm gap-1 font-bold text-white`}
   >
    {getStatusIcon(props.visibility)}
    {props.visibility}
   </div>
  </div>
 );
};

export const AnalyticsStats = (props: AnalyticsStatsProps) => {
 return (
  <div className="stat">
   <div className="stat-figure text-primary">{props.icon}</div>
   <div className="stat-title text-xs">{props.text}</div>
   <div className="stat-value text-lg">{props.stat}</div>
  </div>
 );
};

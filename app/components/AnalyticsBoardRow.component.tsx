import {BoardWithRequests} from "@/types";
import Link from "next/link";
import {formatDate} from "@/utils/utility";
import {Badge} from "@/components/utils/UtilityComponent.component";
import {AnalyticsStats} from "@/components/utils/UtilityComponent.component";
import {FiClipboard} from "react-icons/fi";
import {FaChevronUp} from "react-icons/fa";
import {FaArrowTrendUp} from "react-icons/fa6";

interface AnalyticsBoardRowProps {
 board: BoardWithRequests;
 title: string;
 description: string;
 updatedAt: string;
 boardSlug: string;
 totalUpvotes: number;
 requestCount: number;
 avgEngagement: number;
 visibility: string;
 icon: React.ReactNode;
 buttonText: string;
 buttonLink: string;
 buttonIcon: React.ReactNode;
}

export const AnalyticsBoardRow = (props: AnalyticsBoardRowProps) => {
 return (
  <div>
   <div className="card bg-base-100 shadow-sm">
    <div className="card-body">
     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Board Info */}
      <div className="flex-1">
       <div className="flex flex-col  gap-3 mb-2">
        <Badge visibility={props.visibility} />
        <h2 className="card-title text-lg">{props.title}</h2>
       </div>

       {props.description && (
        <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
         {props.description}
        </p>
       )}

       <div className="text-xs text-base-content/50">
        Updated {formatDate(props.updatedAt)} •
        <Link
         href={`/b/${props.boardSlug}`}
         target="_blank"
         className="btn btn-link btn-sm mb-1"
        >{`/b/${props.boardSlug}`}</Link>
       </div>
      </div>

      {/* Analytics Stats */}
      <div className="flex items-center justify-center">
       <div className="stats stats-horizontal shadow-sm">
        <AnalyticsStats
         icon={<FiClipboard />}
         text="Total Requests"
         stat={props.requestCount}
        />

        <AnalyticsStats
         icon={<FaChevronUp />}
         text="Total Upvotes"
         stat={props.totalUpvotes}
        />

        <AnalyticsStats
         icon={<FaArrowTrendUp />}
         text="Average Engagement"
         stat={props.avgEngagement}
        />
       </div>
      </div>

      <Link
       href={`/dashboard/boards/${props.boardSlug}/analytics`}
       className="btn btn-outline btn-sm"
      >
       {props.buttonIcon}
       {props.buttonText}
      </Link>
     </div>
    </div>
   </div>
  </div>
 );
};

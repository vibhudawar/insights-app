import {HiOutlineCalendar} from "react-icons/hi2";
import {IoClipboardOutline} from "react-icons/io5";
import {LuThumbsUp} from "react-icons/lu";
import {
 HiOutlineDotsVertical,
 HiOutlineEye,
 HiOutlinePencil,
 HiOutlineChartBar,
} from "react-icons/hi";
import {
 SmallStats,
 DropdownMenuRow,
} from "@/components/utils/UtilityComponent.component";
import Link from "next/link";
import {Badge} from "@/components/utils/UtilityComponent.component";

interface ExpandedBoardRowProps {
 title: string;
 description: string;
 visibility: string;
 upvotes: string;
 requests: string;
 updatedAt: string;
 boardSlug: string;
 showDropdown: boolean;
}

export const ExpandedBoardRow = (props: ExpandedBoardRowProps) => {
 return (
  <div className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-base-300 group">
   <div className="card-body p-6">
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
     <div className="flex items-center gap-2">
      <Badge visibility={props.visibility} />
     </div>

     {props.showDropdown && (
      <div className="dropdown dropdown-end">
       <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm btn-square group-hover:opacity-100 opacity-60 hover:opacity-100 transition-opacity"
       >
        <HiOutlineDotsVertical className="h-4 w-4 text-base-content" />
       </div>
       <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300"
       >
        {props.visibility === "Public" && (
         <li>
          <DropdownMenuRow
           icon={<HiOutlineEye className="h-4 w-4" />}
           text="View Public Board"
           link={`/b/${props.boardSlug}`}
          />
         </li>
        )}
        <li>
         <DropdownMenuRow
          icon={<HiOutlinePencil className="h-4 w-4" />}
          text="Edit Board"
          link={`/dashboard/boards/${props.boardSlug}/edit`}
         />
        </li>
        <li>
         <DropdownMenuRow
          icon={<HiOutlineChartBar className="h-4 w-4" />}
          text="View Analytics"
          link={`/dashboard/boards/${props.boardSlug}/analytics`}
         />
        </li>
       </ul>
      </div>
     )}
    </div>

    {/* Content */}
    <div className="mb-4">
     <h3 className="card-title text-lg mb-2 line-clamp-1">{props.title}</h3>
     <p className="text-base-content/70 text-sm line-clamp-2 leading-relaxed">
      {props.description}
     </p>
    </div>

    {/* Stats */}
    <div className="flex items-center gap-4 mb-4">
     <SmallStats
      stat={Number(props.requests)}
      statName="requests"
      icon={<IoClipboardOutline className="h-4 w-4" />}
     />
     <SmallStats
      stat={Number(props.upvotes)}
      statName="upvotes"
      icon={<LuThumbsUp className="h-4 w-4" />}
     />
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between pt-4 border-t border-base-300">
     <div className="flex items-center gap-1.5 text-base-content/60">
      <HiOutlineCalendar className="h-3.5 w-3.5" />
      <span className="text-xs">Updated {props.updatedAt}</span>
     </div>
     <Link
      href={`/b/${props.boardSlug}`}
      className="text-xs text-primary hover:underline font-semibold"
      target="_blank"
      rel="noopener noreferrer"
     >
      {`/b/${props.boardSlug}`}
     </Link>
    </div>
   </div>
  </div>
 );
};

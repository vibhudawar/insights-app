import {Link} from "@/i18n/navigation";

interface BoardRowProps {
 icon: string;
 title: string;
 visibility: string;
 metadata: string;
 showButton: boolean;
 buttonOneText: string;
 buttonOneLink: string;
 buttonTwoText: string;
 buttonTwoLink: string;
}

export const BoardRow = (props: BoardRowProps) => {
 return (
  <div className="flex items-center justify-between p-4 border border-base-300 rounded-lg hover:bg-base-50 transition-colors">
   <div className="flex-1">
    <div className="flex items-center gap-3">
     <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
      <span className="text-sm font-semibold text-primary">{props.icon}</span>
     </div>
     <div>
      <h3 className="font-medium text-base-content">{props.title}</h3>
      <p className="text-sm text-base-content/70">
       {props.metadata} • {props.visibility}
      </p>
     </div>
    </div>
   </div>
   {props.showButton && (
    <div className="flex items-center gap-2">
     <Link
      href={props.buttonOneLink}
      className="btn btn-sm btn-soft btn-primary"
      target="_blank"
     >
      {props.buttonOneText}
     </Link>
     <Link
      href={props.buttonTwoLink}
      className="btn btn-sm btn-soft btn-warning hover:text-white"
     >
      {props.buttonTwoText}
     </Link>
    </div>
   )}
  </div>
 );
};

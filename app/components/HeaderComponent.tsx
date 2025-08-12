import {Link} from "@/i18n/navigation";

interface HeaderComponentProps {
 title: string;
 description: string;
 buttonText: string;
 buttonIcon: React.ReactNode;
 showButton: boolean;
 buttonLink: string;
}

export const HeaderComponent = (props: HeaderComponentProps) => {
 return (
  <div className="border-b border-base-300 pb-5">
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-3xl font-bold leading-tight text-base-content">
      {props.title}
     </h1>
     <p className="mt-2 text-sm text-base-content/70">{props.description}</p>
    </div>
    {props.showButton && (
     <div className="flex gap-3">
      <Link href={props.buttonLink} className="btn btn-primary">
       {props.buttonIcon}
       {props.buttonText}
      </Link>
     </div>
    )}
   </div>
  </div>
 );
};

import {Link} from "@/i18n/navigation";

interface NoStateProps {
 title: string;
 description: string;
 icon: React.ReactNode;
 buttonText: string;
 buttonLink: string;
 showButton: boolean;
}

export const NoStateComponent = (props: NoStateProps) => {
 return (
  <div className="text-center py-12">
   <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
    {props.icon}
   </div>
   <h3 className="text-lg font-medium text-base-content mb-2">{props.title}</h3>
   <p className="text-base-content/70 mb-4">{props.description}</p>
   {props.showButton && (
    <Link href={props.buttonLink} className="btn btn-primary">
     {props.buttonText}
    </Link>
   )}
  </div>
 );
};

interface StatsCardProps {
 title: string;
 stat: number;
 icon: React.ReactNode;
 backgroundColor: string;
}

export const StatsCard = (props: StatsCardProps) => {
 return (
   <div className="card bg-base-100 shadow-sm">
    <div className="card-body">
     <div className="flex items-center">
      <div className="flex-1">
       <p className="text-sm font-medium text-base-content/70">{props.title}</p>
       <p className="text-2xl font-bold text-base-content">{props.stat}</p>
      </div>
      <div className={`w-12 h-12 bg-${props.backgroundColor}-100 rounded-lg flex items-center justify-center`}>
       {props.icon}
      </div>
     </div>
    </div>
   </div>
 );
};

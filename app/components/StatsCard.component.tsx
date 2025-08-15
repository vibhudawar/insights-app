interface StatsCardProps {
 title: string;
 stat: number;
 icon: React.ReactNode;
 backgroundColor: string;
}

const backgroundColorMap = {
 blue: "bg-blue-100",
 green: "bg-green-100",
 purple: "bg-purple-100",
 orange: "bg-orange-100",
 gray: "bg-gray-100",
} as const;

export const StatsCard = (props: StatsCardProps) => {
 const bgColorClass =
  backgroundColorMap[
   props.backgroundColor as keyof typeof backgroundColorMap
  ] || backgroundColorMap.gray;

 return (
  <div className="card bg-base-100 shadow-sm">
   <div className="card-body">
    <div className="flex items-center">
     <div className="flex-1">
      <p className="text-sm font-medium text-base-content/70">{props.title}</p>
      <p className="text-2xl font-bold text-base-content">{props.stat}</p>
     </div>
     <div
      className={`w-12 h-12 ${bgColorClass} rounded-lg flex items-center justify-center`}
     >
      {props.icon}
     </div>
    </div>
   </div>
  </div>
 );
};

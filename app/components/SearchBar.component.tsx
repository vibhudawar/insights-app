interface SearchBarProps {
 searchTerm: string;
 setSearchTerm: (value: string) => void;
 placeholder: string;
 icon: React.ReactNode;
}

export const SearchBar = (props: SearchBarProps) => {
 return (
  <div>
   <div className="form-control max-w-md">
    <div className="input-group">
     <input
      type="text"
      placeholder={props.placeholder}
      className="input input-bordered flex-1"
      value={props.searchTerm}
      onChange={(e) => props.setSearchTerm(e.target.value)}
     />
     <span className="btn btn-square btn-ghost">{props.icon}</span>
    </div>
   </div>
  </div>
 );
};

function Stat({label, value}){
    return (
    <div className="flex">
            <span className="text-sm text-base-content">
                {label}
            </span>
            <span className="text-sm font-bold text-base-content px-1">
              {value}
            </span>
    </div>
    );
}
export default Stat

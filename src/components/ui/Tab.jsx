function Tab({ isActive, onClick, text}){
    return (
    <button 
        onClick={onClick} 
        className={`${isActive? "bg-accent text-accent-content" : "bg-base-200 text-base-content"}  w-full truncate px-0.5 py-1.5`}
    >
        {text}
    </button>
    );
}
export default Tab

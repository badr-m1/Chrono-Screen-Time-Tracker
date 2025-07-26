function Tab({ isActive, onClick, text}){
    return (
    <button 
        onClick={onClick} 
        className={`${isActive? 'bg-accent-active' : 'bg-accent'} text-accent-text w-full truncate px-0.5 py-1.5`}
    >
        {text}
    </button>
    );
}
export default Tab

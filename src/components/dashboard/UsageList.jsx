import UsageListItem from "./UsageListItem";
import Button from "../ui/Button";

function UsageList({usageData, page, numOfPages, onNext,onLast, onPrevious, onFirst, displaySize, isAllTime}){
    if(!usageData) return 
    const displayedItems = usageData.records
    .slice(
        isAllTime ? 0 : displaySize * page,
        isAllTime ? undefined : displaySize * page + displaySize
    )
    
    const isLastPage = page == numOfPages
    const isFirstPage = page == 0

    const usageListItems = displayedItems
    .map((record) => <UsageListItem key={record.url} url={record.url} time={record.time} icon={record.icon} total={usageData.totalTime} />)
    
    const displayedTime = displayedItems.reduce((acc, x) => acc + x.time, 0)
    
    return (<>
        <ul className="flex-1 h-auto min-h-[100px] max-w-[350px] overflow-y-auto pr-2 rounded-sm border border-base-content/8">
          {usageListItems}
        </ul>


        <div className="m-1 flex min-h-10 items-center justify-center gap-3">
          <Button 
          onClick={onFirst}
          disabled={isFirstPage}
          invisible={isFirstPage}>
            {"«"}
          </Button>
          <Button 
            onClick={onPrevious}
            disabled={isFirstPage}
            invisible={isFirstPage}>
            {"<"}
          </Button>
          
          <span>Page {page+1} / {numOfPages + 1}</span>


          <Button 
            onClick={onNext}
            disabled={isLastPage}
            invisible={isLastPage}>
            {">"}
          </Button>
          <Button 
            onClick={onLast}
            disabled={isLastPage}
            invisible={isLastPage}>
            {"»"}
          </Button>
        </div>
    
    
    </>)
}

export default UsageList;
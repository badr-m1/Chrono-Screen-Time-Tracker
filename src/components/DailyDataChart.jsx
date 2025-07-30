function getShortFormDate(timestamp){
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const d = new Date(timestamp)
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function getWeekDay(timestamp){
  const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const d = new Date(timestamp)
  return weekdaysShort[d.getDay()]
}

function determineMaxValueAndDiv(val){
    const threshholds = [{maxValue:8 , div:1}, {maxValue:18 , div:2}, {maxValue:20 , div:4}]
    if (val > 8 && val % 2 !== 0) {
        val += 1;
    }

    for(const threshold of threshholds){
        if(val < threshold.maxValue){
            return [val, threshold.div]
        }
    }

    return [24, 5]
}

function DailyDataChart({dailyData, scope}){
    
    if(scope == 0) return;
    const entries = Object.entries(dailyData).map(entry => entry[1]).sort((a,b) => b.date - a.date)
    const values = entries.map(entry => entry.totalTime)
    const [maxValue, div] = determineMaxValueAndDiv( Math.ceil(Math.max(...values)  / (60*60*1000)) )
    const maxValueInMillis = maxValue * (60*60*1000)

    if(scope == 29){
        for(let i = 0; i < 30 - entries.length; i++ ){
            entries.push({date:0, totalTime:0})
        }
    }
    
    const cols = entries.map(entry => 
    <div className="flex-1 flex flex-col-reverse mx-0.5 items-end z-1 " > 
        <div 
        className={"w-full bg-accent flex flex-col-reverse rounded-t-sm "}
        style={{height: `${( (entry.totalTime/maxValueInMillis)*100).toFixed(0)}%`}}>
            {(scope == 6) && <span>{getWeekDay(entry.date)}</span>}
        </div> 

    </div>)
    const grid = Array((maxValue/ div ) + 1).fill(<div className="w-full h-[1px] bg-muted"> </div>)
    const n = grid.length
    const gridLables = grid.map((v,index) => <span className="font-extralight text-[12px]">{(n-(index+1)) * div}h</span>)
    
    return (
    <div className="flex w-full h-50 bg-background text-primary border-border border-1 mb-4 rounded-md overflow-hidden">
        <div className="flex flex-col justify-between border-border border-r-1">
            {gridLables}
        </div>
        <div className="relative flex w-full h-full">
            {cols}
            <div className="absolute flex flex-col justify-between h-full w-full z-0">
                {grid}
            </div>
        </div>
    </div>
    )
}

export default DailyDataChart
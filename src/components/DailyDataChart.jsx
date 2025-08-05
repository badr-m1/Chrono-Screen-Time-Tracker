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

function normalizeData(data, days){
    const dayInMs = 24*60*60*1000
    data = data.slice(0, days);
    const minDate = data[data.length-1].date
    const fill = Array(days-data.length)
    .fill({})
    .map((v,idx) => ({date: minDate - (dayInMs * (idx + 1)), totalTime:0 }))
    data = [...data,...fill]
    return data
}

function determineMaxValueAndDiv(val){
    const threshholds = [{maxValue:8 , div:1}, {maxValue:19 , div:2}, {maxValue:20 , div:4}]
    if (val % 2 !== 0) {
        val += 1;
    }

    for(const threshold of threshholds){
        if(val < threshold.maxValue){
            return [val, threshold.div]
        }
    }

    return [24, 4]
}

function DailyDataChart({dailyData, scope}){
    if(scope == 0 || scope == Infinity) return;

    const sorted = Object.entries(dailyData).map(entry => entry[1]).sort((a,b) => b.date - a.date)
    const entries = normalizeData(sorted, scope+1)

    const values = entries.map(entry => entry.totalTime)
    const [maxValue, div] = determineMaxValueAndDiv( Math.ceil(Math.max(...values)  / (60*60*1000)) )
    const maxValueInMillis = maxValue * (60*60*1000)

    
    const bars = entries.map((entry,idx) => 
    <div key={`bc${idx}`} className="flex-1 flex flex-col-reverse mx-0.5 items-end z-1 " > 
        <div 
        key={`b${idx}`}
        className={"w-full bg-accent flex flex-col-reverse rounded-t-sm "}
        style={{height: `${( (entry.totalTime/maxValueInMillis)*100).toFixed(0)}%`}}>
        </div> 

    </div>)
    
    const xAxisLables = entries.map((entry,idx) => {
        let label = ""
        if(scope == 6){
            label = getWeekDay(entry.date)
        }
        else if(idx%7 == 0){
            label = getShortFormDate(entry.date)
        }

        return (
        <div className="flex-1 flex relative justify-center mx-0.5 ">
            <span className="absolute text-base-content left-1/2 -translate-x-1/2 items-center text-center text-[10px] overflow-visible whitespace-nowrap flex flex-col">
            {label != "" && <div className="bg-base-content h-[5px] w-[2px]"></div>}
            {label}
            </span>
        </div>)   
    })
    
    const n = (maxValue/div) + 1

    const gridLineCol = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-base-content').trim();

    const gridLines = 
    <svg className="absolute inset-0 w-full h-full"
        shapeRendering="crispEdges">
        {Array(n).fill(null).map((_, idx) => (
        <rect
          x="0"
          y={`${Math.round((idx * 100) / (maxValue / div))}%`}
          width="100%"
          height="2" 
          fill={gridLineCol}
          shapeRendering="crispEdges"
        />
    ))}
    </svg>

    

    const yAxisLables = Array(n).fill(null).map((_,idx) => 
    <div className="flex relative justify-center items-center">
        <span key={`l${idx}`} className="absolute top-1/2 -translate-y-1/2 items-center text-[12px] text-base-content">{(n-(idx+1)) * div}h</span>
    </div>)


    return (
    <div className="flex w-full h-50 bg-base-100 text-base-content border-base-content border-0 mb-4 rounded-md overflow-hidden pt-2">
        <div className="flex flex-col justify-between h-[90%] w-[8%]">
            {yAxisLables}
        </div>
        <div className="flex flex-col w-full h-full">
            <div className="relative flex w-full border-base-content border-b-2 border-l-2  border-r-2 h-[90%]">
                {bars}
                <div className="absolute inset-0 flex flex-col justify-between z-0">
                    {gridLines}
                </div>
            </div>

            <div className="flex w-full h-[10%]">
                {xAxisLables}
            </div>

        </div>
    </div>
    )
}

export default DailyDataChart
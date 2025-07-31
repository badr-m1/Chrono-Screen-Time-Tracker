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
    if (val > 8 && val % 2 !== 0) {
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
    console.log("scope: ", scope+1)
    if(scope == 0 || scope == Infinity) return;

    const sorted = Object.entries(dailyData).map(entry => entry[1]).sort((a,b) => b.date - a.date)
    const entries = normalizeData(sorted, scope+1)
    console.log("scope: ", scope+1)
    console.log(entries.length)
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
            <span className="absolute left-1/2 -translate-x-1/2 items-center text-center text-[10px] overflow-visible whitespace-nowrap flex flex-col">
            {label != "" && <div className="bg-muted h-[5px] w-[2px]"></div>}
            {label}
            </span>
        </div>)   
    })

    const gridLines = Array((maxValue/div) + 1).fill(<></>)
    .map((v,idx) => 
    <div 
        key={`g${idx}`} 
        className="absolute left-0 right-0 h-[1px] bg-muted"
        style={{ top: `${(idx * 100) / (maxValue / div)}%` }}
        ></div>)

    const n = gridLines.length

    const yAxisLables = gridLines.map((v,idx) => <span key={`l${idx}`} className="font-extralight text-[12px]">{(n-(idx+1)) * div}h</span>)
    
    return (
    <div className="flex w-full h-50 bg-background text-primary border-border border-2 mb-4 rounded-md overflow-hidden">
        <div className="flex flex-col justify-between border-border border-r-1 h-[90%] w-[6%]">
            {yAxisLables}
        </div>
        <div className="flex flex-col w-full h-full">
            <div className="relative flex w-full h-[90%]">
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
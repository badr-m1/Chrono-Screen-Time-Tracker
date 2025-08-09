import {getDayTimestampLocal} from "../../public/utils.js";

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
    for(let i = 0; i < days; i++){
        const currDate = getDayTimestampLocal() - (dayInMs * i)
        if(i > data.length -1 || data[i].date != currDate){
            const inserted = {date:currDate, totalTime:0}
            data = [...data.slice(0, i), inserted , ...data.slice(i)]
        }
    }
    return data
}

function determineMaxValueAndDiv(val){
    const threshholds = [{maxValue:8 , div:1}, {maxValue:19 , div:2}, {maxValue:20 , div:4}]
    //4 is the minimum
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
    const chartHeight_px = 150
    const chartWidth_px = 300
    
    if(scope == 0 || scope == Infinity) return;

    const sorted = Object.entries(dailyData).map(entry => entry[1]).sort((a,b) => b.date - a.date)
    const entries = normalizeData(sorted, scope+1)

    const values = entries.map(entry => entry.totalTime)
    const [maxValue, div] = determineMaxValueAndDiv( Math.ceil(Math.max(...values)  / (60*60*1000)) )
    const maxValueInMillis = maxValue * (60*60*1000)
    
    const bars = entries.map((entry,idx) => 
    <div key={`bc${idx}`} className="flex-1 flex flex-col-reverse mx-0.5 items-end z-1" > 
        <div 
        key={`b${idx}`}
        className={"w-full bg-accent flex flex-col-reverse rounded-t-sm "}
        style={{height: `${ Math.round((entry.totalTime/maxValueInMillis)*100)}%`}}>
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

    const gridLines = Array.from({ length: n }, (_, idx) => {
        const yPos = Math.round((idx * chartHeight_px) / (n - 1));
        
        return (
        <div
            key={`grid-${idx}`}
            className="absolute w-full border-t"
            style={{
            top: `${yPos}px`,
            borderColor: gridLineCol,
            borderWidth: '1px'
            }}
        />
        );
    });

    

    const yAxisLables = Array(n).fill(null).map((_,idx) => 
    <div className="flex relative justify-center items-center">
        <span key={`l${idx}`} className="absolute top-1/2 -translate-y-1/2 items-center text-[12px] text-base-content">{(n-(idx+1)) * div}h</span>
    </div>)


    return (
    <div className="flex bg-base-100 text-base-content border-base-content border-1 mb-4 rounded-sm overflow-hidden pt-2" >
        <div className="flex flex-col justify-between w-5" style={{height: `${chartHeight_px}px`}}>
            {yAxisLables}
        </div>
        <div className="flex flex-col">
            <div className="relative flex border-base-content"
            style={{height: `${chartHeight_px}px`, width: `${chartWidth_px}px`}}
            >
                {bars}
                <div className="absolute inset-0 flex flex-col justify-between z-0">
                    {gridLines}
                </div>
            </div>

            <div className="flex h-5 w-full">
                {xAxisLables}
            </div>

        </div>
    </div>
    )
}

export default DailyDataChart
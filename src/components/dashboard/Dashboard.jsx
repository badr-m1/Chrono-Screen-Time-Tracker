import { formatTime, getCalendarDayDiff, getShortFormDate } from "../../../public/utils.js";
import { getUsageData, getStartDate, getwebsiteTotalUsageData } from "../../../public/usageDataService.js";
import { useState, useEffect } from "react"
import UsageListItem from "./UsageListItem.jsx";
import Tab from "../ui/Tab.jsx";
import DailyUsageChart from "./DailyUsageChart.jsx";
import Stat from "./Stat.jsx";
import Button from "../ui/Button.jsx";
import PeriodNavigator from "./PeriodNavigator.jsx"

const TIME_RANGES = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "All", days: Infinity},
]

const DISPLAY_INCREMENT = 5

function getSelectedPeriod(days, periodOffset) {
  if (days == Infinity){
    return {startDate: Date.now(), endDate: Date.now()}
  }
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  
  const today = Date.now();

  const endDate = new Date(today - days * periodOffset * MS_PER_DAY);
  const startDate = new Date(today - (days * (periodOffset + 1) - 1) * MS_PER_DAY);

  return { startDate, endDate }
}

function Dashboard() {

  const [timeRange, setTimeRange] = useState(TIME_RANGES[0])
  const [periodOffset, setPeriodOffset] = useState(0)
  const [daysActive, setDaysActive] = useState(0)
  const [usageData, setUsageData] = useState({records:[], totalTime: 0, dailyTotals:[], days:1})
  const [displayLimit, setDisplayLimit] = useState(DISPLAY_INCREMENT)

  const isOutOfSync = timeRange.days != usageData.days
  const isAllTime =  timeRange.label == "All"
  const isSingleDay = timeRange.label == "1D"

  function loadUsageData() {
    chrome.runtime.sendMessage({ type: "update_request"}, (response) => {
      if(response == "update_complete"){
        
        if(isAllTime){
          getwebsiteTotalUsageData(displayLimit).then( result =>{
            setUsageData(result)
          })
        }
        else{
          const {startDate, endDate }  = getSelectedPeriod(timeRange.days, periodOffset)
          getUsageData(displayLimit, startDate, endDate).then(result =>{
            setUsageData(result);
          })

        }
          
      }
    })
  }

  useEffect(() => {
    getStartDate().then( result =>{
      setDaysActive(getCalendarDayDiff(result, Date.now()) + 1)
    })
  }, [])

  useEffect(() => {
    setDisplayLimit(DISPLAY_INCREMENT)
    setPeriodOffset(0)
  }, [timeRange])

  useEffect(loadUsageData, [timeRange, displayLimit, periodOffset])

  const totalTime = usageData.totalTime

  let usageListItems = usageData.records.map((record) => <UsageListItem key={record.url} url={record.url} time={record.time} icon={record.icon} total={totalTime} />)
  
  const displayedTime = usageData.records.reduce((acc, x) => acc + x.time, 0)
  const otherTime = totalTime - displayedTime
  if (otherTime > 0) {
    usageListItems.push(<UsageListItem key={"other"} url={"other"} time={otherTime} icon={null} total={totalTime} />)
  }
  
  const timeRangeDays = (isAllTime) ? daysActive : Math.min(daysActive, timeRange.days)

  const dailyAverage = totalTime / timeRangeDays

  const tabs = TIME_RANGES.map((T) => 
  <Tab 
    onClick={() => {
      console.log("clicked", T.days);
      setTimeRange(T);
    }}
    isActive={timeRange.label === T.label} 
    text={T.label}
  />)
  
  const {startDate, endDate }  = getSelectedPeriod(timeRange.days, periodOffset)

  return (
      <div>
        <nav className=" bg-base-100 flex justify-around border-1 border-base-content overflow-hidden max-h-10 rounded-sm">
          {tabs}
        </nav>
        {(usageData.records.length == 0) ? (<h2>There are no screen time tracking data</h2>) :
        (<>

        <div className="flex justify-between m-1">
          <Stat label={"Total"} value={formatTime(totalTime)}/>
          {!isSingleDay && <Stat label={"Avg / Day"} value={formatTime(dailyAverage)}/>}
        </div>
        
        <PeriodNavigator 
          disabled={isAllTime || isOutOfSync}
          isSingleDay={isSingleDay} 
          startDate={startDate} 
          endDate={endDate} 
          onNext={() => setPeriodOffset(val => val + 1)}
          onPrevious={() => setPeriodOffset(val => val - 1)}
          canGoForward={periodOffset > 0}
        />

        <DailyUsageChart 
          dailyData={usageData.dailyTotals} 
          totalDays={usageData.days} 
          endDate={usageData.endDate} 
          disabled={isAllTime || isSingleDay || isOutOfSync}
        />

        <ul className>
          {usageListItems}

          {otherTime > 0 && 
          <Button onClick={() => setDisplayLimit((val) => val + DISPLAY_INCREMENT)}>
            Show More
          </Button>}

          {displayLimit > DISPLAY_INCREMENT &&
          <Button onClick={() => setDisplayLimit((val) => Math.min(val - DISPLAY_INCREMENT, DISPLAY_INCREMENT))}>
            Show Less
          </Button>
          }
        </ul>
        </>)}
      </div>
    );
}
export default Dashboard
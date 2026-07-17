import { formatTime, getCalendarDayDiff, getShortFormDate } from "../../background/utils.js";
import { getUsageData, getStartDate, getwebsiteTotalUsageData } from "../../background/usageDataService.js";
import { useState, useEffect } from "react"
import UsageListItem from "./UsageListItem.jsx";
import Tab from "./Tab.jsx";
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

const DISPLAY_LIMIT = 5

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
  const [usageData, setUsageData] = useState({records:[], recordsCount: 0, totalTime: 0, dailyTotals:[], days:1})
  const [page, setPage] = useState(0)

  const isOutOfSync = timeRange.days != usageData.days
  const isAllTime =  timeRange.label == "All"
  const isSingleDay = timeRange.label == "1D"

  function loadUsageData(pageChage = false) {
    chrome.runtime.sendMessage({ type: "update_request"}, (response) => {
      if(response == "update_complete"){
        
        if(isAllTime){
          getwebsiteTotalUsageData(DISPLAY_LIMIT, page).then( result =>{
            setUsageData(result)
          })
        }
        else if(!pageChage){
          const {startDate, endDate }  = getSelectedPeriod(timeRange.days, periodOffset)
          getUsageData(startDate, endDate).then(result =>{
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
    setPage(0)
    setPeriodOffset(0)
  }, [timeRange])

  useEffect(loadUsageData, [timeRange, periodOffset])
  useEffect(()=>{loadUsageData(true)}, [page])

  const totalTime = usageData.totalTime
  const NumOfPages = Math.ceil(usageData.recordsCount / 5)

  const usageListItems = usageData.records
  .slice(
    isAllTime ? 0 : DISPLAY_LIMIT * page,
    isAllTime ? undefined : DISPLAY_LIMIT * page + DISPLAY_LIMIT
  )
  .map((record) => <UsageListItem key={record.url} url={record.url} time={record.time} icon={record.icon} total={totalTime} />)
  
  const displayedTime = usageData.records.reduce((acc, x) => acc + x.time, 0)
  const otherTime = totalTime - displayedTime

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
  console.log("retrieved record's length: ", usageData.records)

  return (
      <div className="flex flex-col max-h-[500px]">
        <nav className="flex justify-around border-1 border-base-content/8 bg-surface rounded-sm">
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
          onNext={() => setPeriodOffset(val => val - 1)}
          canGoForward={periodOffset > 0}
          onPrevious={() => setPeriodOffset(val => val + 1)}
          canGoBack={getCalendarDayDiff(startDate, Date.now())+1 < daysActive}
        />

        <DailyUsageChart 
          dailyData={usageData.dailyTotals} 
          totalDays={usageData.days} 
          endDate={usageData.endDate} 
          disabled={isAllTime || isSingleDay || isOutOfSync}
        />

        <ul className="flex-1 h-auto min-h-[100px] max-w-[350px] overflow-y-auto pr-2 rounded-sm border border-gray-200 shadow-inner">
          {usageListItems}
        </ul>


        <div className="m-1 flex min-h-10 items-center justify-center gap-3">
          <Button onClick={() => setPage((val) => Math.max(val - 1, 0)) }>
            {"<"}
          </Button>
          <Button onClick={() => setPage((val) =>  Math.min(val + 1, NumOfPages))}>
            {">"}
          </Button>
        </div>

        </>)}
      </div>
    );
}
export default Dashboard
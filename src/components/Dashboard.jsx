import { formatTime, getCalendarDayDiff } from "../../public/utils.js";
import { getUsageData, getStartDate, getwebsiteTotalUsageData } from "../../public/usageDataService.js";
import { useState, useEffect } from "react"
import ListItem from "./ListItem.jsx";
import Tab from "./Tab.jsx";
import DailyDataChart from "./DailyDataChart.jsx";
import Stat from "./Stat.jsx";
function Dashboard() {
  const scopes = { Infinity:"All", 179:"6M",89:"3M", 29: "30D", 6: "7D", 0: "1D" }

  const [scope, setScope] = useState(0)
  const [daysActive, setDaysActive] = useState(0)
  const [usageData, setUsageData] = useState({records:[], totaTime: 0, dailyTotals:[]})
  const [displayLimit, setDisplayLimit] = useState(5)

  useEffect(() => {
    getStartDate().then( result =>{
      setDaysActive(getCalendarDayDiff(result, Date.now()) + 1)
    })
  }, [])

  useEffect(() => {
    setDisplayLimit(5)
  }, [scope])

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "update_request"}, (response) => {
      if(response == "update_complete"){

        if(scope == Infinity){

          getwebsiteTotalUsageData(displayLimit).then( result =>{
            setUsageData(result)
          })
        }
        else{

          const maxDate = Date.now() - (1000*60*60*24*scope)
          getUsageData(displayLimit, maxDate).then(result =>{
            setUsageData(result)
          })

        }
          
      }
    })

  }, [scope, displayLimit])

  
  
  const totalTime = usageData.totalTime
  let listItems = usageData.records.map((record) => <ListItem key={record.url} url={record.url} time={record.time} icon={record.icon} total={totalTime} />)
  
  const displayedTime = usageData.records.reduce((acc, x) => acc + x.time, 0)
  const otherTime = totalTime - displayedTime

  if (otherTime > 0) {
    listItems.push(<ListItem key={"other"} url={"other"} time={otherTime} icon={null} total={totalTime} />)
  }

  const scopeDays = (scope == Infinity) ? daysActive : Math.min(daysActive, scope)

  const dailyAverage = totalTime / scopeDays

  const tabs = Object.keys(scopes)
  .map((k) => <Tab onClick={() => { setScope(k) }}  isActive={scope == k} text={scopes[k]}/>)

  return (
      <div>
        <nav className=" bg-base-100 flex justify-around border-1 border-base-content overflow-hidden max-h-10 rounded-sm">
          {tabs}
        </nav>
        {(usageData.records.length == 0) ? (<h2>There are no screen time tracking data</h2>) :
        (<>

        <div className="flex justify-between m-1">
          <Stat label={"Total"} value={formatTime(totalTime)}/>
          {scope !=  0 && <Stat label={"Avg / Day"} value={formatTime(dailyAverage)}/>}
        </div>
        
        <DailyDataChart dailyData={usageData.dailyTotals} scope={Number(scope)}/>

        <ul className>
          {listItems}
          {otherTime > 0 && <button 
          className="w-fit rounded-md px-2 py-2 bg-accent text-accent-content hover:bg-accent-active" 
          onClick={() => setDisplayLimit((val) => val + 5)}>
            Show More
          </button>}
        </ul>
        </>)}
      </div>
    );
}
export default Dashboard
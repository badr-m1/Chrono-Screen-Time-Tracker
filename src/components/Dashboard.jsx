import { formatTime, getCalendarDayDiff } from "../../public/utils.js";
import { getUsageData, getStartDate, getAllTImeUsageData } from "../../public/usageDataService.js";
import { useState, useEffect } from "react"
import ListItem from "./ListItem.jsx";
import Tab from "./Tab.jsx";
import DailyDataChart from "./DailyDataChart.jsx";

function Dashboard(props) {
  const scopes = { Infinity:"all time", 29: "Last Month", 6: "Last Week", 0: "Today" }
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
    chrome.runtime.sendMessage({ type: "update_request", text: "Hello from content script" }, (response) => {
      if(response == "update_complete"){

        if(scope == Infinity){

          getAllTImeUsageData(displayLimit).then( result =>{
            console.log(result)
            setUsageData(result)
          })
        }
        else{

          const maxDate = Date.now() - (1000*60*60*24*scope)
          getUsageData(displayLimit, maxDate).then(result =>{
            console.log(result)
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


  const tabs = Object.keys(scopes).map((k) =>
    <Tab onClick={() => { setScope(k) }}  isActive={scope == k} text={scopes[k]}/>
  )

  return (
      <div>
        <h1 className="bg-background">Your screen time data</h1>

        <nav className=" bg-black flex justify-around border-1 border-primary overflow-hidden max-h-10 rounded-sm">
          {tabs}
        </nav>
        {(usageData.records.length == 0) ? (<h2>There are no screen time tracking data</h2>) :
        (<>
        <div className="flex justify-between h-5 m-0.5">
          <span>total : {formatTime(totalTime)}</span>
          {scope != 0 && <span>Daily average: {formatTime(dailyAverage)}</span>}
        </div>
        <DailyDataChart dailyData={usageData.dailyTotals} scope={scope}/>

        <ul className>
          {listItems}
          {otherTime > 0 && <button 
          className="w-fit rounded-md bg-background text-primary px-2 py-2 border-1 hover:bg-accent hover:text-accent-text " 
          onClick={() => setDisplayLimit((val) => val + 5)}>
            Show More
          </button>}
        </ul>
        </>)}
      </div>
    );
}
export default Dashboard
import { formatTime, getCalendarDayDiff, formatSize } from '../../public/utils.js';
import { getUsageData, clearUsageData, getStartDate } from '../../public/usageDataService.js';
import { useState, useEffect } from 'react'
import ListItem from './ListItem.jsx';

async function getStorageSize(){
  let estimate = await navigator.storage.estimate()
  return estimate
}

function DBDashboard(props) {
  const scopes = { Infinity:"all time", 29: "Last Month", 6: "Last Week", 0: "Today" }
  const [scope, setScope] = useState(0)
  const [daysActive, setDaysActive] = useState(0)
  const [usageData, setUsageData] = useState({records:[], totaTime: 0})
  const [displayLimit, setDisplayLimit] = useState(5)
  const [appStorageStats, setAppStorageStats] = useState({usage: 0, quota: 0})
  function clearData() {
    clearUsageData()
  }

  useEffect(() => {
    getStartDate().then( result =>{
      setDaysActive(getCalendarDayDiff(result, Date.now()) + 1)
    })

    getStorageSize().then(result => {
      console.log(result)
      setAppStorageStats(result)
    })
  }, [])

  useEffect(() => {
    setDisplayLimit(5)
  }, [scope])

  useEffect(() => {

    let maxDate = (scope!= Infinity) ? Date.now() - (1000*60*60*24*scope) : scope

    getUsageData(displayLimit, maxDate).then(result =>{
      result.records.map(r => {
        if(!r.icon) return 
        r.icon.arrayBuffer().then(buffer => {
          console.log(r.url)
          console.log(new Uint8Array(buffer)); // raw bytes
        });  
      })
      setUsageData(result)
    })

  }, [scope, displayLimit])

  
  
  const totalTime = usageData.totalTime
  let listItems = usageData.records.map((record) => <ListItem key={record.url} url={record.url} time={record.time} icon={record.icon} total={totalTime} />)
  
  const displayedTime = usageData.records.reduce((acc, x) => acc + x.time, 0)
  const otherTime = totalTime - displayedTime

  if (otherTime > 0) {
    listItems.push(<ListItem key={'other'} url={'other'} time={otherTime} icon={null} total={totalTime} />)
  }

  const scopeDays = (scope == Infinity) ? daysActive : Math.min(daysActive, scope)

  const dailyAverage = totalTime / scopeDays


  const tabs = Object.keys(scopes).map((k) =>
    <button 
    onClick={() => { setScope(k) }} 
    className={(scope == k) ? 'active-tab' : 'tab'}>{scopes[k]}
    </button>)

  return (
      <div className='ScreenTimeDashboard'>
        <h2>Your screen time data</h2>

        <nav className='navbar'>
          {tabs}
        </nav>
        {(usageData.records.length == 0) ? (<h2>There are no screen time tracking data</h2>) :
        (<>
        <div className='extra-stats'>
          <span>total : {formatTime(totalTime)}</span>
          {scope != 0 && <span>Daily average: {formatTime(dailyAverage)}</span>}
        </div>
        <ul className='list-container'>
          {listItems}
          {otherTime > 0 && <button className='show-more-btn' onClick={() => setDisplayLimit((val) => val + 5)}>Show More</button>}
        </ul>

        <button className="clear-data-btn" onClick={clearData}>Clear tracking data</button>
        </>)}

        <br></br>
        <span>Cached data: {formatSize(appStorageStats.usage)}</span>
      </div>
    );
}
export default DBDashboard
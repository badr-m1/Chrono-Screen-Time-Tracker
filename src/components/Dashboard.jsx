import { formatTime, getCalendarDayDiff, getObjectSize, formatSize } from '../../public/utils.js';
import { useState, useEffect } from 'react'
import ListItem from './ListItem.jsx';

function Dashboard(props) {
  const scopes = { "allTimeUsage": "All Time", 30: "Last Month", 7: "Last Week", 1: "Today" }
  const [scope, setScope] = useState(1)
  const [daysActive, setDaysActive] = useState(0)
  const [usageData, setUsageData] = useState({
    last30Days: [{}],
    allTimeUsage: {},
    timestamp: Date.now()
  })

  const [icons, setIcons] = useState({})
  const [displayLimit, setDisplayLimit] = useState(5)

  function clearData() {

    const now = Date.now();
    chrome.storage.local.set({
      usageData: {
        last30Days: [{}],
        allTimeUsage: {},
        timestamp: now
      }
    });

    chrome.storage.local.set({ urlIcons: {} })
    setIcons({});

    chrome.storage.local.set({ startTime: now });
    setUsageData({
      last30Days: [{}],
      allTimeUsage: {},
      timestamp: now
    })

  }

  useEffect(() => {
    chrome.storage.local.get("usageData", (result) => {
      if (result.usageData) {
        setUsageData(result.usageData)
      }
    });

    chrome.storage.local.get("startTime", (result) => {
      const now = Date.now();
      if (result.startTime !== undefined) {
        setDaysActive(getCalendarDayDiff(result.startTime, now) + 1);
      } else {
        console.log("daysActive not set");
        chrome.storage.local.set({ startTime: now });
        setDaysActive(1);
      }
    })

    chrome.storage.local.get("urlIcons", (result) => {
      if (result.urlIcons) {
        setIcons(result.urlIcons);
      }
    })

  }, [])

  console.log("days active " + daysActive)

  let scopeUsageData = {}

  if (scope == "allTimeUsage") {
    scopeUsageData = usageData["allTimeUsage"]
  }
  else {
    let scopeObjectsArray = usageData.last30Days.slice(0, scope);
    console.log(usageData.last30Days)
    scopeUsageData = scopeObjectsArray.reduce((acc, obj) => {
      for (const [key, value] of Object.entries(obj)) {
        acc[key] = (acc[key] || 0) + value;
      }
      return acc;
    }, {});

  }


  let entries = Object.entries(scopeUsageData)
    .sort((a, b) => b[1] - a[1])

  let listItems = []
  const total = entries.reduce((acc, x) => acc + x[1], 0)

  console.log(scopeUsageData)
  console.log(entries)


  listItems = entries
    .slice(0, displayLimit)
    .map(([url, time]) => <ListItem url={url} time={time} icon={icons[url]} total={total} />)

  let otherTime = entries.slice(displayLimit).reduce((acc, x) => acc + x[1], 0)

  if (otherTime > 0) {
    listItems.push(<ListItem url={'other'} time={otherTime} icon={null} total={total} />)
  }

  const scopeDays = (scope == "allTimeUsage") ? daysActive : Math.min(daysActive, scope)

  const dailyAverage = total / scopeDays


  const tabs = Object.keys(scopes).map((k) =>
    <button 
    onClick={() => { setScope(k) }} 
    className={(scope == k) ? 'active-tab' : 'tab'}>{scopes[k]}
    </button>)

  console.log("days active: " + daysActive)

  return (entries.length == 0) ? (<h2>There are no screen time tracking data</h2>) :
    (
      <div className='ScreenTimeDashboard'>
        <h2>Your screen time data</h2>

        <nav className='navbar'>
          {tabs}
        </nav>

        <div className='extra-stats'>
          <span>total : {formatTime(total)}</span>
          {scope != 1 && <span>Daily average: {formatTime(dailyAverage)}</span>}
        </div>
        <ul className='list-container'>
          {listItems}
          {otherTime > 0 && <button className='show-more-btn' onClick={() => setDisplayLimit((val) => val + 5)}>Show More</button>}
        </ul>

        <button className="clear-data-btn" onClick={clearData}>Clear tracking data</button>
        <br></br>
        <br></br>
        <span>Cached data: {formatSize(getObjectSize(icons) + getObjectSize(usageData))}</span>
      </div>
    );
}
export default Dashboard
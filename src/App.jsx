import { useState, useEffect } from 'react'
import './App.css'
import StaticBar from './components/staticBar';

//function formatTime(ms) {
//  const totalSeconds = Math.floor(ms / 1000);
//  const hours = Math.floor(totalSeconds / 3600);
//  const minutes = Math.floor((totalSeconds % 3600) / 60);
//  const seconds = totalSeconds % 60;
//
//  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//}
//
//function pad(num) {
//  return String(num).padStart(2, '0');
//}

function formatTime(ms) {
  const times = msToTimeUnits(ms)
  if(times.seconds < 60){
    return `${times.seconds}s`;
  }
  else if(times.minutes < 60){
    return `${times.minutes}m`;
  }
  else{
    return `${times.hours}h`;
  }
}

function msToTimeUnits(ms){
  const seconds = ms / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours/ 60;

  const Times = {
    seconds: seconds.toFixed(1),
    minutes: minutes.toFixed(1),
    hours: hours.toFixed(1),
    days: days.toFixed(1)
  }

  return Times
}


function App() {
  const scopes = {"allTimeUsage":"all time", "monthlyUsage":"monthly", "weeklyUsage":"weekly", "dailyUsage":"daily"}
  const [scope, setScope] = useState("dailyUsage")
  const [daysActive, setDaysActive] = useState(0)
  const [usageData, setUsageData] = useState({
    dailyUsage: {},
    weeklyUsage: {},
    monthlyUsage: {},
    allTimeUsage: {},
    timestamp: new Date()
  })

  function clearData(){
    let usageData = {}
    chrome.storage.local.set({usageData:{
      dailyUsage: {},
      weeklyUsage: {},
      monthlyUsage: {},
      allTimeUsage: {},
      timestamp: Date.now()
    }});

    setUsageData({
      dailyUsage: {},
      weeklyUsage: {},
      monthlyUsage: {},
      allTimeUsage: {},
      timestamp: Date.now()
    })
  }

  useEffect(() =>{
    chrome.storage.local.get("usageData" , (result) => {
      if(result.usageData){
        console.log(result.usageData)
        setUsageData(result.usageData)
      }
    });

    chrome.storage.local.get("startTime", (result) =>{
      if (result.startTime !== undefined) {
        setDaysActive( Math.ceil(msToTimeUnits(Date.now() - result.startTime).days) );
      } else {
        console.log("daysActive not set");
        const now = Date.now();
        chrome.storage.local.set({ startTime: now });
        setDaysActive(0);
      }
    })

  }, [])
  

  const urls = Object.keys(usageData[scope]);
  const times = Object.values(usageData[scope])

  let listItems = []
  times.sort((a, b) => b - a)
  const total = times.reduce((acc, x) => acc + x, 0)
  let othersum = total

  for(let i = 0; i < 5; i++){
    othersum -= times[i]
    let url = urls.filter(k => usageData[scope][k] === times[i]);
    listItems.push(
    <li className="list-item"> 
      <span>{url}</span> 
      <span>{(times[i]/total * 100 ).toFixed(1)}% - {formatTime(times[i])}
        </span>
    </li>
    );
  }

  if(othersum > 0){
    listItems.push(
    <li className="list-item"> 
      <span>other</span> 
      <span>{(othersum/total * 100 ).toFixed(1)}% - {formatTime(othersum)}
        </span>
    </li>);
  }

  const scopeDays = (scope == "weeklyUsage")? Math.min(daysActive, 7) : (scope == "monthlyUsage")? Math.min(daysActive, 30.4167) : daysActive
  const dailyAverage = total/scopeDays

  const tabs = Object.keys(scopes).map((k) => <button 
  onClick={() => {setScope(k)} } 
  className={(scope == k) ? 'active-tab' : 'tab'}
  >{scopes[k]}</button>)

  return (
    <>
      {(urls.length > 0) && <h2>Your Tracking Data</h2>}
      {(urls.length ==  0) && <h2>There are no tracking data</h2>}
      <nav className='navbar'>
        {(urls.length > 0) && tabs}
      </nav>
      
      <div>
        <span>total : {formatTime(total)}</span>
        <br>
        </br>
          {scope != "dailyUsage" && <span>Daily average: {formatTime(dailyAverage)}</span>}
      </div>
      <ul className='list-container'>
        {listItems}
      </ul>

      <button onClick={clearData}>Clear tracking data</button>
    </>
  )
}

export default App

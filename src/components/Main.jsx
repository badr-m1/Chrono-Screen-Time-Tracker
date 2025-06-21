import { useState, useEffect } from 'react'
import StaticBar from './staticBar';

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

function Main(props){

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
    const [displayLimit, setDisplayLimit] = useState(5)

    function clearData(){

        chrome.storage.local.set({usageData:{
          dailyUsage: {},
          weeklyUsage: {},
          monthlyUsage: {},
          allTimeUsage: {},
          timestamp: Date.now()
        }});

        const now = Date.now();
        chrome.storage.local.set({ startTime: now });
        setDaysActive(1);
  
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
          setDaysActive( Math.ceil(msToTimeUnits(Date.now() - result.startTime).days )+ 1 );
        } else {
          console.log("daysActive not set");
          const now = Date.now();
          chrome.storage.local.set({ startTime: now });
          setDaysActive(1);
        }
      })
  
    }, [])
    
  
    const urls = Object.keys(usageData[scope]);
    const times = Object.values(usageData[scope])
  
    let listItems = []
    times.sort((a, b) => b - a)
    const total = times.reduce((acc, x) => acc + x, 0)
    let othersum = total
  
    for(let i = 0; i < Math.min(displayLimit, urls.length); i++){
      othersum -= times[i]
      let url = urls.filter(k => usageData[scope][k] === times[i]);
      listItems.push(
      <li className="list-item">
        <div className='item-info'>
          <span>{url}</span> 
          <span>{(times[i]/total * 100 ).toFixed(1)}% - {formatTime(times[i])}        </span>
        </div>
        <StaticBar value={times[i]/total} color={"#c8c7cd"} />
      </li>
      );
    }
  
    if(othersum > 0){
      listItems.push(
      <li className="list-item"> 
        <div className='item-info'>
          <span>other</span> 
          <span>{(othersum/total * 100 ).toFixed(1)}% - {formatTime(othersum)}</span>
        </div>
        <StaticBar value={othersum/total} color={"#c8c7cd"} />
      </li>);
    }
  
    const scopeDays = (scope == "weeklyUsage")? Math.min(daysActive, 7) : (scope == "monthlyUsage")? Math.min(daysActive, 30.4167) : daysActive
    console.log(daysActive)
    const dailyAverage = total/scopeDays
  
    const tabs = Object.keys(scopes).map((k) => <button 
    onClick={() => {setScope(k)} } 
    className={(scope == k) ? 'active-tab' : 'tab'}
    >{scopes[k]}</button>)
    
    console.log("days active: " + daysActive)

    return (urls.length ==  0) ? (<h2>There are no screen time tracking data</h2>) : 
    (
    <div className='main'>
        <h2>Your screen time data</h2>

        <nav className='navbar'>
          {tabs}
        </nav>
        
        <div className='extra-stats'>
          <span>total : {formatTime(total)}</span>
            {scope != "dailyUsage" && <span>Daily average: {formatTime(dailyAverage)}</span>}
        </div>
        <ul className='list-container'>
          {listItems}
          {othersum>0 && <button className='show-more-btn' onClick={()=>setDisplayLimit((val) => val+5)}>Show More</button>}
        </ul>

        <button className="clear-data-btn" onClick={clearData}>Clear tracking data</button>
    </div>
    );
}
export default Main
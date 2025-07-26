import { useEffect, useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { formatSize } from '../../public/utils.js';
import { clearUsageData } from '../../public/usageDataService.js';

function clearData() {
    clearUsageData()
}

async function getStorageSize(){
  let estimate = await navigator.storage.estimate()
  return estimate
}

/*
TODO:
-clearing the data of specific domains
-a button that clears old unused data (Icons far down the list that are unlikely to be seen)
unsure:
-setting the interval time
-custom themes
-setting qoutas
-the ability to stop the extention form saving icons?
*/

function Settings(){
    const [appStorageStats, setAppStorageStats] = useState({usage: 0, quota: 0})



    useEffect(() =>{
        getStorageSize().then(result => {
          console.log(result)
          setAppStorageStats(result)
        })
    }, [])
    
    return (
      <div className="flex flex-col justify-center">
        <h1>Settings</h1>

        <ThemeSwitcher/>

        <span>Cached data: {formatSize(appStorageStats.usage)}</span>
        <button 
        className="w-fit rounded-md bg-background text-primary px-2 py-2 border-1 hover:bg-warning hover:text-accent-text m-2" 
        onClick={clearData}
        >
          Clear Data
        </button>
        
      </div>
    );
}
export default Settings
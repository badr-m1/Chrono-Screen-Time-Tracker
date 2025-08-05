import { useEffect, useState, useRef  } from "react";
import ThemeSwitcher from "./settingsComponents/ThemeSwitcher";
import SearchBar from "./settingsComponents/SearchBar.jsx";
import RestoreData from "./settingsComponents/RestoreData.jsx";
import BackupData from "./settingsComponents/BackupData.jsx";
import ClearData from "./settingsComponents/ClearData.jsx";
import { formatSize } from "../../public/utils.js";
import { deleteDomainUsageData, getSearchPredictions, clearAllUsageData, clearIconsCache } from "../../public/usageDataService.js";

async function getStorageSize(){
  let estimate = await navigator.storage.estimate()
  return estimate
}

/*
TODO:
-a button that clears old unused data (Icons far down the list that are unlikely to be seen)
-a backup data buttons that gives you a simple json file with all the data in the database
  -this can be used later for multi device sync 
-a checkbox for enabling and disabling saving icons
-a button for deleting all cached icons
unsure:
-setting the interval time
-custom themes
-setting qoutas
-the ability to stop the extention form saving icons?
*/

function Settings(){
    const [appStorageStats, setAppStorageStats] = useState({usage: 0, quota: 0})
    const [searchValue, setSearchValue] = useState("")
    
    useEffect(() =>{
        getStorageSize().then(result => {
          setAppStorageStats(result)
        })
    }, [])
    
    return (
      <div className="flex flex-col">
        

        <div className="border-t-1 border-base-content px-0.5 h-auto w-full gap-0.5 p-2">
        <h1 className="text-4xl font-bold text-base-content">Appearance</h1>
          <ThemeSwitcher/>
        </div>


        <div className="flex flex-col items-center border-t-1 border-base-content px-0.5 h-auto w-full gap-0.5 p-2">
        <h1 className="text-4xl font-bold text-base-content">Data management </h1>
          <div className="flex justify-between w-full">
            <span className="flex text-nowrap text-center items-center m-2">Clear data for a specific domain: </span>
            <SearchBar suggestionsCallBack={getSearchPredictions} onValueChange={setSearchValue} placeholder={"Domain name"}/>
          </div>

          <button 
            className="w-40 rounded-md px-2 py-2 bg-surface text-surface-content hover:bg-warning hover:text-warning-content hover:text-accent-text m-1" 
            onClick={() => deleteDomainUsageData(searchValue)}
            >
            Delete Domain Data
          </button>

          
          <h1 className="text-4xl font-bold text-base-content mt-2">Cached data: {formatSize(appStorageStats.usage)}</h1>

          <ClearData text={"Clear all usage data"} callback={clearAllUsageData}/>
          <ClearData text={"Clear all cached icons "} callback={clearIconsCache}/>
          <BackupData/>

          <RestoreData/>
        
        </div>
     
      </div>
    );
}
export default Settings
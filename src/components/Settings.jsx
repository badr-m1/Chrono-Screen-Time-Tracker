import { useEffect, useState, useRef  } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import SearchBar from "./SearchBar.jsx";
import RestoreDBData from "./RestoreDBData.jsx";
import BackupDBData from "./BackupDBData.jsx";
import { formatSize } from "../../public/utils.js";
import { clearAllUsageData, deleteDomainUsageData, getSearchPredictions, exportDBtoJSON, importDBfromData } from "../../public/usageDataService.js";

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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

        <div className="border-t-1 border-primary px-0.5 h-auto w-full gap-0.5 p-2">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Appearance</h1>
          <ThemeSwitcher/>
        </div>


        <div className="flex flex-col items-center border-t-1 border-primary px-0.5 h-auto w-full gap-0.5 p-2">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Data management </h1>
          <div className="flex justify-between w-full">
            <span className="flex">Clear data for a specific domain: </span>
            <SearchBar suggestionsCallBack={getSearchPredictions} onValueChange={setSearchValue} placeholder={"Domain name"}/>
          </div>

          <button 
            className="w-40 rounded-md bg-background text-primary px-2 py-2 border-1 hover:bg-warning hover:text-accent-text m-2" 
            onClick={() => deleteDomainUsageData(searchValue)}
            >
            Delete Domain Data
          </button>

          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">Cached data: {formatSize(appStorageStats.usage)}</h1>
          
          <button 
            className="w-40 rounded-md bg-background text-primary px-2 py-2 border-1 hover:bg-warning hover:text-accent-text m-1" 
            onClick={clearAllUsageData}
            >
            Clear all data

          </button>
          
          <BackupDBData/>

          <RestoreDBData/>
        
        </div>
     
      </div>
    );
}
export default Settings
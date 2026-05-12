import { useEffect, useState, useRef  } from "react";
import ThemeSwitcher from "./settingsComponents/ThemeSwitcher";
import SearchBar from "./settingsComponents/SearchBar.jsx";
import RestoreData from "./settingsComponents/RestoreData.jsx";
import BackupData from "./settingsComponents/BackupData.jsx";
import ClearData from "./settingsComponents/ClearData.jsx";
import { formatSize } from "../../public/utils.js";
import { deleteDomainUsageData, getSearchPredictions, clearAllUsageData, clearIconsCache } from "../../public/usageDataService.js";
import Button from "./Button.jsx";

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

      {/* Appearance */}
      <div className="border-t border-base-content/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
          Appearance
        </p>
        <ThemeSwitcher />
      </div>

      {/* Data Management */}
      <div className="border-t border-base-content/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
          Data management
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-base-content/60">Cached data</span>
          <span className="text-xs font-medium bg-warning/20 text-warning px-2 py-1 rounded-md">
            {formatSize(appStorageStats.usage)}
          </span>
        </div>

        <div className="flex gap-2 mb-4">
          <ClearData text="Clear usage data" callback={clearAllUsageData} />
          <ClearData text="Clear cached icons" callback={clearIconsCache} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2">
          Domain data
        </p>
        <div className="flex gap-2">
          <SearchBar
            suggestionsCallBack={getSearchPredictions}
            onValueChange={setSearchValue}
            placeholder="example.com"
          />
          <Button onClick={() => deleteDomainUsageData(searchValue)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="border-t border-base-content/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
          Backup & restore
        </p>
        <div className="flex gap-2">
          <BackupData />
          <RestoreData />
        </div>
      </div>

    </div>
    );
}
export default Settings
import { useEffect, useState, useRef  } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import SearchBar from "./SearchBar.jsx";
import RestoreData from "./RestoreData.jsx";
import BackupData from "./BackupData.jsx";
import ClearData from "./ClearData.jsx";
import { formatSize } from "../../background/utils.js";
import { deleteDomainUsageData, getSearchPredictions, clearAllUsageData, clearIconsCache } from "../../background/usageDataService.js";
import Button from "../ui/Button";

async function getStorageSize(){
  let estimate = await navigator.storage.estimate()
  return estimate
}

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

      <div className="border-t border-base-content/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-3">
          Appearance
        </p>
        <ThemeSwitcher />
      </div>

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
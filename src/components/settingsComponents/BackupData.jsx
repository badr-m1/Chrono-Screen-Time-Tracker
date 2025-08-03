import { exportDBtoJSON } from "../../../public/usageDataService.js";

function BackupData(){
    
    function downloadJSON(json, filename) {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
    }

    async function handleBackup(){
        const now = new Date();
        const isoString = now.toISOString(); 
        const fileNameTimestamp = isoString
        .replace(/T/, '_')     
        .replace(/\..+/, '')    
        .replace(/:/g, '.'); 

        exportDBtoJSON().then(json => downloadJSON(json, `screentime-data-backup_${fileNameTimestamp}.json`))
    }
    

    return(
    <>
        <button 
          className="w-40 rounded-md bg-background text-primary px-2 py-2 border-1 hover:bg-warning hover:text-accent-text m-1" 
          onClick={handleBackup}
          >
          Back up to file..
        </button>
    </>)
}
export default BackupData
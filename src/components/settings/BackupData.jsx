import { exportDBtoJSON } from "../../../public/usageDataService.js";
import Button from "../ui/Button"

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
        <Button 
          onClick={handleBackup}
          >
          Back up to file..
        </Button>
    </>)
}
export default BackupData
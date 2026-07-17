import { useRef, useEffect, useState } from "react"
import Message from "../dialogs/Message";
import Confirm from "../dialogs/Confirm";
import { importDBfromData } from "../../background/usageDataService.js";
import { z } from "zod"
import Button from "../ui/Button"

const DBDataSchema = z.object({
  websiteTotalUsage: z.array(z.any()), // adjust z.any() if you know item shape
  websiteDailyUsage: z.array(z.any()),
  dailyScreenTime: z.array(z.any()),
}).strict(); // no additional properties allowed

function validateDBData(input) {
 return DBDataSchema.safeParse(input).success;
}


function RestoreData(){
  const [msgVisibility, setMsgVisibility] = useState(false)
  const [msgText, setMsgText] = useState("")
  const handleMessage = (msg) =>{
    setMsgVisibility(true)
    setMsgText(msg)
  }
  const [confirmVisibility, setConfirmVisibility] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [onConfirm, setOnConfirm] = useState(() => {})

  const handleConfirm = (msg, onConfirm) =>{
    setConfirmVisibility(true)
    setConfirmText(msg)
    setOnConfirm(onConfirm)
  }
  const fileInputRef = useRef(null);
  

  const handleButtonClick = () => {
    fileInputRef.current.click(); 
  };
  
  const onChange = (e) =>{
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result
      const jsonData = JSON.parse(fileContent) 
      if(validateDBData(jsonData)){
        handleConfirm("All existing usage data will be overwritten are you sure?", () => () => importDBfromData(jsonData) )
      }
      else{
        handleMessage("invalid backup data")
      }
    }
    reader.readAsText(file)
  }

  return(
  <>
      {msgVisibility && <Message text={msgText} onClose={() => setMsgVisibility(false)}/>}
      {confirmVisibility && <Confirm text={confirmText} onClose={() => setConfirmVisibility(false)} onConfirm={onConfirm}/>}
      <Button onClick={handleButtonClick}>
          Restore from file..
        </Button>
        <input 
        type="file" 
        ref={fileInputRef}
        id="jsonFileInput" 
        accept=".json" 
        placeholder="Restore from file.."
        className="h-0 w-0 opacity-0 absolute" 
        onChange={onChange}
        />
  </>)
}
export default RestoreData
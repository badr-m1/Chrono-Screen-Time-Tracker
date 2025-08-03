import { useState } from "react"
import { clearAllUsageData } from "../../../public/usageDataService"
import Confirm from "../dialogs/Confirm"

function ClearData({text, callback}){
  const [confirmVisibility, setConfirmVisibility] = useState(false)


  return (
  <>
    {confirmVisibility && <Confirm text={"are you sure?"} onClose={() => setConfirmVisibility(false)} onConfirm={callback}/>}
    <button 
      className="w-40 rounded-md bg-background text-primary px-2 py-2 border-1 hover:bg-warning hover:text-accent-text m-1" 
      onClick={() => setConfirmVisibility(true)}
      >
        {text}
    </button>
  </>)
}

export default ClearData
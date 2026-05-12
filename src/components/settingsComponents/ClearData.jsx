import { useState } from "react"
import { clearAllUsageData } from "../../../public/usageDataService"
import Confirm from "../dialogs/Confirm"
import Button from "../Button.jsx"

function ClearData({text, callback}){
  const [confirmVisibility, setConfirmVisibility] = useState(false)


  return (
  <>
    {confirmVisibility && <Confirm text={"are you sure?"} onClose={() => setConfirmVisibility(false)} onConfirm={callback}/>}
    <Button 
      className="w-40 rounded-md px-2 py-2 bg-surface text-surface-content hover:bg-error hover:text-error-content hover:text-accent-text m-1" 
      onClick={() => setConfirmVisibility(true)}
      >
        {text}
    </Button>
  </>)
}

export default ClearData
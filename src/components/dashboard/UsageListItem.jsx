import ProgressBar from "./ProgressBar";
import { useState, useEffect } from "react"
import { formatTime } from "../../../public/utils";

const themeColors = [
  { background: "#FFFFFF", text: "#1A1A1A" },
  { background: "#F5F5F5", text: "#333333" },
  { background: "#E0E0E0", text: "#1A1A1A" },
  { background: "#4F46E5", text: "#FFFFFF" },
  { background: "#10B981", text: "#FFFFFF" },
  { background: "#F59E0B", text: "#1A1A1A" }, 
  { background: "#EF4444", text: "#FFFFFF" },
  { background: "#9CA3AF", text: "#FFFFFF" }
];

function generateDefaultIconDataUrl(letter = "?", color) {
    return <svg width="64" height="64" viewBox="0 0 64 64" className="h-4 w-4 align-text-bottom m-2">
      <rect width="100%" height="100%" fill={color.background} rx="8" />
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
            font-size="32" font-family="Arial, sans-serif" fill={color.text}>
        {letter}
      </text>
    </svg>
}

function UsageListItem({url, time, icon, total}){
    if(url == "") return null
    const letter = ((url.split(".").length > 2) ? url.split(".")[1][0] : url.split(".")[0][0])
    const color = themeColors[letter.charCodeAt(0) % themeColors.length]
    const [iconElement, setIconElement] = useState(generateDefaultIconDataUrl(letter, color)) 

    useEffect(() => {
        if(icon && icon instanceof Blob){
            let url = URL.createObjectURL(icon);
            setIconElement(<img src={url} className="h-4 w-4 align-text-bottom m-2" onError={() => setIconElement(generateDefaultIconDataUrl(letter, color))}></img>)
            return () => {
                URL.revokeObjectURL(url)
            }
        }
    }, [])


    return (
    <li className="flex border-t-1 border-base-content px-0.5 h-8 w-full gap-0.5">
        {iconElement}
        <div style={{width: "100%"}}>
            <div className="flex justify-between w-full">
                <span>{url}</span> 
                <span>{formatTime(time)}</span>
            </div>
            <ProgressBar value={time/total} />
        </div>
    </li>
    );
}

export default UsageListItem;
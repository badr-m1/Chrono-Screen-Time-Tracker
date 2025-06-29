import StaticBar from "./staticBar";
import { formatTime } from "../../public/utils";

const lightThemeColors = [
  { background: "#FFFFFF", text: "#1A1A1A" },
  { background: "#F5F5F5", text: "#333333" },
  { background: "#E0E0E0", text: "#1A1A1A" },
  { background: "#4F46E5", text: "#FFFFFF" },
  { background: "#10B981", text: "#FFFFFF" },
  { background: "#F59E0B", text: "#1A1A1A" }, 
  { background: "#EF4444", text: "#FFFFFF" },
  { background: "#9CA3AF", text: "#FFFFFF" }
];

const darkThemeColors = [
  { background: "#1F2937", text: "#F9FAFB" },
  { background: "#111827", text: "#D1D5DB" },
  { background: "#374151", text: "#E5E7EB" },
  { background: "#6366F1", text: "#FFFFFF" }, 
  { background: "#22C55E", text: "#FFFFFF" }, 
  { background: "#FACC15", text: "#1A1A1A" }, 
  { background: "#DC2626", text: "#FFFFFF" }, 
  { background: "#6B7280", text: "#FFFFFF" }
];

function generateDefaultIconDataUrl(letter = '?', color) {
    return <svg width="64" height="64" viewBox="0 0 64 64" className="icon">
      <rect width="100%" height="100%" fill={color.background} rx="8" />
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
            font-size="32" font-family="Arial, sans-serif" fill={color.text}>
        {letter}
      </text>
    </svg>
}

function ListItem({url, time, icon, total}){
    if(url == '') return null
    let IconElement = null 
    if(!icon){
        let letter = ((url.split('.').length > 2) ? url.split('.')[1][0] : url.split('.')[0][0])
        let color = lightThemeColors[letter.charCodeAt(0) % lightThemeColors.length]
        IconElement = generateDefaultIconDataUrl(letter, color)
    }
    else{
        IconElement = <img src={icon} className="icon"></img>
    }

    return (
    <li className="list-item">
        {IconElement}
        <div style={{width: '100%'}}>
            <div className='item-info'>
                <span>{url}</span> 
                <span>{(time/total * 100 ).toFixed(1)}% - {formatTime(time)}</span>
            </div>
            <StaticBar value={time/total} color={"#c8c7cd"} />
        </div>
    </li>
    );
}

export default ListItem;
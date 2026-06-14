
export function formatTime(ms) {
  const minutes = ms / (1000 * 60)
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
  
export function msToTimeUnits(ms){
  const seconds = ms / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  const Times = {
    seconds: seconds.toFixed(1),
    minutes: minutes.toFixed(1),
    hours: hours.toFixed(1),
    days: days.toFixed(1)
  }

  return Times
}

export function getCalendarDayDiff(t1, t2){
  const d1 = new Date(t1);
  const d2 = new Date(t2);

  const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());

  const msInDay = 1000 * 60 * 60 * 24;
  return Math.abs((date2 - date1) / msInDay);
}

export function formatSize(byteSize){
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (byteSize >= 1024 && i < units.length - 1) {
    byteSize /= 1024;
    i++;
  }
  return `${byteSize.toFixed(2)} ${units[i]}`;
}

export function getDayTimestampLocal(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function getShortFormDate(timestamp){
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const d = new Date(timestamp)
  return `${months[d.getMonth()]} ${d.getDate()}`
}

export function getWeekDay(timestamp){
  const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const d = new Date(timestamp)
  return weekdaysShort[d.getDay()]
}
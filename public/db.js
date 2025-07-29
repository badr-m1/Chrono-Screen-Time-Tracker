import Dexie from "./libs/dexie.mjs";


const db = new Dexie('UsageDataDB');

db.version(1).stores({
  allTimeUsage: `&url, time`,
  dailyUsage: `&[url+date], url, date, time`,
  usageTotals: '&date, totalTime', //date == "__allTime__" denotes the all time total otherwise it denote the total for that specific day
  faviconCache: `&url, icon`
})

export default db;
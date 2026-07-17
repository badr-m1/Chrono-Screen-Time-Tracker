import Dexie from "dexie";

const db = new Dexie('UsageDataDB');

db.version(1).stores({
  websiteTotalUsage: `&url, time`,
  websiteDailyUsage: `&[url+date], url, date, time`,
  websiteIcons: `&url, icon`,
  dailyScreenTime: '&date, totalTime', //date == "__allTime__" denotes the all time total otherwise it denote the total for that specific day
})

export default db;
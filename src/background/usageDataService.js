import db from "./db.js"
import { getDomain } from "tldts";
import { getDayTimestampLocal, msToTimeUnits } from "./utils.js";
const ALL_TIME_KEY = "__allTime__";

async function fetchImageAsBlob(imageUrl) {
  try {
    const res = await fetch(imageUrl);

    if(!res.ok) return null

    const contentType = res.headers.get('Content-Type');
    
    if(!contentType || !contentType.startsWith('image/')) return null

    return await res.blob();
    
  }catch{
    return null;
  }
}

async function bulkUpdateIconData(entries) {
  const entryUrls = entries.map(entry => entry.url)
  const iconRecords = await db.websiteIcons.bulkGet(entryUrls)
  const iconPuts = []

  for(let i = 0; i < entries.length; i++){
    const entry = entries[i]
    const record = iconRecords[i]
    if(!record || record.icon == null){
      const icon = await fetchImageAsBlob(`https://www.google.com/s2/favicons?domain=${entry.url}&sz=64`) ??
      await fetchImageAsBlob(`https://www.google.com/s2/favicons?domain=${getDomain(entry.url)}&sz=64`) ??
      await fetchImageAsBlob(entry.iconUrl);

      iconPuts.push({url: entry.url,  icon: icon})
    }
  }
  db.websiteIcons.bulkPut(iconPuts)
}

export async function bulkUpdateUsageData(entries) {
  const date = getDayTimestampLocal(new Date(Date.now()));
  const promises = [];

  const dailyUsageKeys = entries.map(entry => [entry.url, date])
  const dailyUsageRecords = await db.websiteDailyUsage.bulkGet(dailyUsageKeys);
  const dailyUsagePuts = []

  entries.forEach((entry, index) =>{
    const record = dailyUsageRecords[index]
    if(record){
      dailyUsagePuts.push({url: record.url, date:date, time: record.time + entry.time})
    }
    else{
      dailyUsagePuts.push({url: entry.url, date:date, time: entry.time})
    }
  })

  promises.push(db.websiteDailyUsage.bulkPut(dailyUsagePuts))


  const entryUrls = entries.map(entry => entry.url)
  const totalUsageRecords = await db.websiteTotalUsage.bulkGet(entryUrls);
  const totalUsagePuts = []

  for(let i = 0; i < entries.length; i++){
    const entry = entries[i]
    const record = totalUsageRecords[i]
    if(record){
      totalUsagePuts.push({url: record.url, time: record.time + entry.time})
    }
    else{
      totalUsagePuts.push({url: entry.url, time: entry.time})
    }
  }

  promises.push(db.websiteTotalUsage.bulkPut(totalUsagePuts))

  bulkUpdateIconData(entries)

  const totalTime = entries.reduce((acc, entry) => acc + entry.time, 0)

  const allTimeTotal = (await db.dailyScreenTime.get(ALL_TIME_KEY))?.totalTime;
  const todaysTotal = (await db.dailyScreenTime.get(date))?.totalTime;

  promises.push(db.dailyScreenTime.put({ date: ALL_TIME_KEY, totalTime: (allTimeTotal || 0) + totalTime }));
  promises.push(db.dailyScreenTime.put({ date:date, totalTime: (todaysTotal || 0 ) + totalTime }));

  await Promise.all(promises);
}

export async function getwebsiteTotalUsageData(limit = 5, page=0){
  const recordsCount = await db.websiteTotalUsage.count();

  const usageData = await db.websiteTotalUsage
  .orderBy("time")
  .reverse()
  .offset(page*limit)
  .limit(limit)
  .toArray()

  const urls = usageData.map(record => record.url)
  const icons = await db.websiteIcons.bulkGet(urls)
  const records = []

  for(let i = 0; i < usageData.length; i++){
    const cachedIcon = icons[i]
    const entry = usageData[i]
    if(cachedIcon){
      records.push({url: entry.url, time:entry.time, icon:cachedIcon.icon})
    }
    else{
      records.push({url: entry.url, time:entry.time, icon:null})
    }
  }

  let dailyTotals = await db.dailyScreenTime
  .toArray()
  dailyTotals = dailyTotals.filter((entry) => entry.date != ALL_TIME_KEY)
  

  const alltime = await db.dailyScreenTime.get(ALL_TIME_KEY)
  const total = alltime.totalTime

  return {records: records, recordsCount: recordsCount, totalTime: total, dailyTotals: dailyTotals, startDate:null, endDate:null, days:Infinity}
}


export async function getUsageData(startDate = Date.now(), endDate=Infinity){
  if (endDate != Infinity) endDate = getDayTimestampLocal(new Date(endDate))
  else endDate = getDayTimestampLocal(new Date())
  startDate = getDayTimestampLocal(startDate)

  let usageData = await db.websiteDailyUsage
  .where("date")
  .between(startDate, endDate, true, true)
  .toArray()

  let dailyTotals = await db.dailyScreenTime
  .where("date")
  .between(startDate, endDate, true, true)
  .toArray()

  dailyTotals = dailyTotals.filter((entry) => entry.date != ALL_TIME_KEY)
  let total = dailyTotals.reduce((acc, record) => acc + record.totalTime, 0)

  let reduced = {}
  usageData.forEach(({ url, time }) => {
    reduced[url] = (reduced[url] || 0) + time;
  });

  usageData = Object.entries(reduced)
  .map(([url, time]) => ({url: url, time: time}) )
  .sort((a,b) => b.time - a.time)

  const urls = usageData.map(record => record.url)
  const records = []
  const icons = await db.websiteIcons.bulkGet(urls)
  for(let i = 0; i < usageData.length; i++){
    const cachedIcon = icons[i]
    const entry = usageData[i]
    if(cachedIcon){
      records.push({url: entry.url, time:entry.time, icon:cachedIcon.icon})
    }
    else{
      records.push({url: entry.url, time:entry.time, icon:null})
    }
  }

  const totalDays = (msToTimeUnits(endDate).days - msToTimeUnits(startDate).days) + 1

  return {records: records, recordsCount: records.length, totalTime: total, dailyTotals: dailyTotals, startDate:startDate, endDate:endDate, days:totalDays}
}

export async function getSearchPredictions(searchTerm) {
  if(searchTerm == "") return []

  const records = await db.websiteTotalUsage
  .filter(item => item.url.includes(searchTerm))
  .toArray()

  return records;
}

export async function getStartDate(){
  let record = await db.websiteDailyUsage
  .orderBy("date")
  .limit(1)
  .toArray()

  return  record[0]?.date || Date.now()
}

export async function clearAllUsageData(){
  db.websiteTotalUsage.clear()
  db.websiteDailyUsage.clear()
  db.dailyScreenTime.clear()
}

export async function clearIconsCache(){
  db.websiteIcons.clear()
}

export async function deleteDomainUsageData(url){
  const allTimeRecord = await db.websiteTotalUsage.get(url)
  const records = await db.websiteDailyUsage
  .where("url")
  .equals(url)
  .toArray()

  const dates = records.map(r => r.date)
  
  const totals = await db.dailyScreenTime.bulkGet(dates)
  const allTimeTotal = await db.dailyScreenTime.get(ALL_TIME_KEY)
  
  const updatedAllTimeTotal = {date:ALL_TIME_KEY , totalTime:allTimeTotal.totalTime - allTimeRecord.time}
  const updatedTotals = totals.map((rec, i)=> ({date: rec.date, totalTime:rec.totalTime - (records[i]?.time || 0) }))

  await db.dailyScreenTime.bulkPut([...updatedTotals, updatedAllTimeTotal])

  await db.websiteTotalUsage
  .where("url")
  .equals(url)
  .delete()
  .then(function (deleteCount) {
      console.log( "Deleted " + deleteCount + " objects");
  });

  await db.websiteDailyUsage
  .where("url")
  .equals(url)
  .delete()
  .then(function (deleteCount) {
      console.log( "Deleted " + deleteCount + " objects");
  });
}

export async function exportDBtoJSON() {
  const tables = db.tables;
  const dbData = {};


  for (const table of tables) {
    if(table.name == "websiteIcons") continue;
    dbData[table.name] = await table.toArray();
  }

  return JSON.stringify(dbData, null, 2); 
}

export async function importDBfromData(data) {
  await clearAllUsageData()
  const promises = []
  promises.push(db.websiteTotalUsage.bulkPut(data.websiteTotalUsage))
  promises.push(db.websiteDailyUsage.bulkPut(data.websiteDailyUsage))
  promises.push(db.dailyScreenTime.bulkPut(data.dailyScreenTime))
  await Promise.all(promises);
}

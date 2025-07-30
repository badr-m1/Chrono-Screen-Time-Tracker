import db from "./db.js"
import { base64ToBlob, blobToBase64 } from "./utils.js";
const ALL_TIME_KEY = "__allTime__";

function getDayTimestampLocal(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

async function fetchImageAsBlob(imageUrl) {
  try {
    const res = await fetch(imageUrl);
    if(!res.ok) return null

    const contentType = res.headers.get('Content-Type');
    
    if(!contentType || !contentType.startsWith('image/')) return null

    return await res.blob();
    
  }catch (error) {
    // Network or CORS error
    console.error(`Fetch error for ${imageUrl}:`, error);
    return null;
  }
}

export async function updateUsageData(url, time, timestamp, favIconUrl) {
  const date = getDayTimestampLocal(new Date(timestamp));
  const promises = [];
  const dailyRecord = await db.dailyUsage.get([url, date]);
  if (!dailyRecord) {
    promises.push(db.dailyUsage.put({ url, date, time }));
  } else {
    promises.push(db.dailyUsage.update([url, date], { time: time + (dailyRecord?.time || 0) }));
  }

  const allTimeRecord = await db.allTimeUsage.get(url);
  if (!allTimeRecord) {
    const icon = (favIconUrl != null) ? await fetchImageAsBlob(favIconUrl) : null
    promises.push(db.allTimeUsage.put({ url, time, icon }));
  } else {
    promises.push(db.allTimeUsage.update(url, { time: time + (allTimeRecord?.time || 0) }));
  }

  const allTimeTotal = await db.usageTotals.get(ALL_TIME_KEY);
  const todaysTotal = await db.usageTotals.get(date);

  if (!allTimeTotal) {
    promises.push(db.usageTotals.put({ date: ALL_TIME_KEY, totalTime: time }));
  } else {
    promises.push(db.usageTotals.update(ALL_TIME_KEY, { totalTime: allTimeTotal.totalTime + time }));
  }

  if (!todaysTotal) {
    promises.push(db.usageTotals.put({ date, totalTime: time }));
  } else {
    promises.push(db.usageTotals.update(date, { totalTime: todaysTotal.totalTime + time }));
  }

  await Promise.all(promises);
}

export async function bulkUpdateUsageData(entries) {
  const date = getDayTimestampLocal(new Date(Date.now()));
  const promises = [];

  const dailyKeys = entries.map(entry => [entry.url, date])
  const dailyRecords = await db.dailyUsage.bulkGet(dailyKeys);
  const dailyPuts = []

  entries.forEach((entry, index) =>{
    const record = dailyRecords[index]
    if(record){
      dailyPuts.push({url: record.url, date:date, time: record.time + entry.time})
    }
    else{
      dailyPuts.push({url: entry.url, date:date, time: entry.time})
    }
  })

  promises.push(db.dailyUsage.bulkPut(dailyPuts))


  const entryUrls = entries.map(entry => entry.url)

  const allTimeRecords = await db.allTimeUsage.bulkGet(entryUrls);

  const allTimePuts = []

  for(let i = 0; i < entries.length; i++){
    const entry = entries[i]
    const record = allTimeRecords[i]
    if(record){
      allTimePuts.push({url: record.url, time: record.time + entry.time})
    }
    else{
      allTimePuts.push({url: entry.url, time: entry.time})
    }
  }

  promises.push(db.allTimeUsage.bulkPut(allTimePuts))

  const cachedIconRecords = await db.faviconCache.bulkGet(entryUrls)
  const faviconCachePuts = []

  for(let i = 0; i < entries.length; i++){
    const entry = entries[i]
    const record = cachedIconRecords[i]
    if(record){
      faviconCachePuts.push({url: record.url, icon: record.icon})
    }
    else{
      faviconCachePuts.push({url: entry.url,  icon: await fetchImageAsBlob(entry.iconUrl)})
    }
  }

  promises.push(db.faviconCache.bulkPut(faviconCachePuts))


  const totalTime = entries.reduce((acc, entry) => acc + entry.time, 0)

  const allTimeTotal = (await db.usageTotals.get(ALL_TIME_KEY))?.totalTime;
  const todaysTotal = (await db.usageTotals.get(date))?.totalTime;

  promises.push(db.usageTotals.put({ date: ALL_TIME_KEY, totalTime: (allTimeTotal || 0) + totalTime }));
  promises.push(db.usageTotals.put({ date:date, totalTime: (todaysTotal || 0 ) + totalTime }));

  await Promise.all(promises);
}

export async function getAllTImeUsageData(limit = 5){

  const usageData = await db.allTimeUsage
  .orderBy("time")
  .reverse()
  .limit(limit)
  .toArray()
  const urls = usageData.map(record => record.url)
  const cachedIcons = await db.faviconCache.bulkGet(urls)
  const records = []
  for(let i = 0; i < cachedIcons.length; i++){
    const cachedIcon = cachedIcons[i]
    const entry = usageData[i]
    if(cachedIcon){
      records.push({url: entry.url, time:entry.time, icon:cachedIcon.icon})
    }
    else{
      records.push({url: entry.url, time:entry.time, icon:null})
    }
  }

  let dailyTotals = await db.usageTotals
  .toArray()
  dailyTotals = dailyTotals.filter((entry) => entry.date != ALL_TIME_KEY)
  

  const alltime = await db.usageTotals.get(ALL_TIME_KEY)
  const total = alltime.totalTime

  return {records: records, totalTime: total, dailyTotals:dailyTotals}
}

export async function getUsageData(limit = 5, maxDate = Date.now()){

  const targetDate = getDayTimestampLocal(new Date(maxDate))

  let records = await db.dailyUsage
  .where("date")
  .aboveOrEqual(targetDate)
  .toArray()

  let dailyTotals = await db.usageTotals
  .where("date")
  .aboveOrEqual(targetDate)
  .toArray()

  dailyTotals = dailyTotals.filter((entry) => entry.date != ALL_TIME_KEY)
  let total = dailyTotals.reduce((acc, record) => acc + record.totalTime, 0)

  //rewrite the section below to look more like the rest of the code 
  //sort records and get their icons from the "allTimeUsage" table
  let reduced = {}
  records.forEach(({ url, time }) => {
    reduced[url] = (reduced[url] || 0) + time;
  });

  const metas = await Promise.all( Object.keys(reduced).map(url => db.faviconCache.get(url)))
  let iconsMap = {}

  for(let m of metas){
    if(m) iconsMap[m.url] = m.icon
  }

  records = Object.entries(reduced)
  .map(([url, time]) => ({url: url, time: time, icon: iconsMap[url] || null}) )
  .sort((a,b) => b.time - a.time)

  records = records.slice(0, limit)

  return {records: records, totalTime: total, dailyTotals: dailyTotals}
}

export async function getSearchPredictions(searchTerm) {
  if(searchTerm == "") return []

  let records = await db.allTimeUsage
  .filter(item => item.url.includes(searchTerm))
  .toArray()

  return records;
}

export async function getStartDate(){
  let record = await db.dailyUsage
  .orderBy("date")
  .limit(1)
  .toArray()

  return  record[0]?.date || Date.now()
}

export async function clearAllUsageData(){
  const tables = db.tables;
  for(const table of tables){
    table.clear()
  }
}

export async function deleteDomainUsageData(url){
  const allTimeRecord = await db.allTimeUsage.get(url)
  const records = await db.dailyUsage
  .where("url")
  .equals(url)
  .toArray()

  const dates = records.map(r => r.date)
  
  const totals = await db.usageTotals.bulkGet(dates)
  const allTimeTotal = await db.usageTotals.get(ALL_TIME_KEY)
  
  const updatedAllTimeTotal = {date:ALL_TIME_KEY , totalTime:allTimeTotal.totalTime - allTimeRecord.time}
  const updatedTotals = totals.map((rec, i)=> ({date: rec.date, totalTime:rec.totalTime - records[i].time}))

  await db.usageTotals.bulkPut([...updatedTotals, updatedAllTimeTotal])

  await db.allTimeUsage
  .where("url")
  .equals(url)
  .delete()
  .then(function (deleteCount) {
      console.log( "Deleted " + deleteCount + " objects");
  });

  await db.dailyUsage
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
    if(table.name == "faviconCache") continue;
    dbData[table.name] = await table.toArray();
  }

  return JSON.stringify(dbData, null, 2); 
}

export async function importDBfromJSON(jsonData) {
  await clearAllUsageData()
  for(let i = 0; i < jsonData.allTimeUsage.length; i++){
    if(!jsonData.allTimeUsage[i].icon) continue
    jsonData.allTimeUsage[i].icon = await base64ToBlob(jsonData.allTimeUsage[i].icon)
  }
  const promises = []
  promises.push(db.allTimeUsage.bulkPut(jsonData.allTimeUsage))
  promises.push(db.dailyUsage.bulkPut(jsonData.dailyUsage))
  promises.push(db.usageTotals.bulkPut(jsonData.usageTotals))
  await Promise.all(promises);
}

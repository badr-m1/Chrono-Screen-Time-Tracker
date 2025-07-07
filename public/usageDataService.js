import db from "./db.js"
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


  const allTimeKeys = entries.map(entry => entry.url)
  const allTimeRecords = await db.allTimeUsage.bulkGet(allTimeKeys);

  const allTimePuts = []
  for(let i = 0; i < entries.length; i++){
    const entry = entries[i]
    const record = allTimeRecords[i]
    if(record){
      allTimePuts.push({url: record.url, time: record.time + entry.time, icon: record.icon})
    }
    else{
      allTimePuts.push({url: entry.url, time: entry.time, icon: await fetchImageAsBlob(entry.iconUrl)})
    }
  }
  
  promises.push(db.allTimeUsage.bulkPut(allTimePuts))


  const totalTime = entries.reduce((acc, entry) => acc + entry.time, 0)

  const allTimeTotal = (await db.usageTotals.get(ALL_TIME_KEY))?.totalTime;
  const todaysTotal = (await db.usageTotals.get(date))?.totalTime;

  promises.push(db.usageTotals.put({ date: ALL_TIME_KEY, totalTime: (allTimeTotal || 0) + totalTime }));
  promises.push(db.usageTotals.put({ date:date, totalTime: (todaysTotal || 0 ) + totalTime }));

  await Promise.all(promises);
}


export async function getUsageData(limit = 5, maxDate = Infinity){

  if(maxDate == Infinity){
    let records = await db.allTimeUsage
    .orderBy("time")
    .reverse()
    .limit(limit)
    .toArray()

    let totals = await db.usageTotals.get(ALL_TIME_KEY)// date == 0 denotes all time usage total
    let total = totals.totalTime

    return {records: records, totalTime: total}
  }
  else{
    const targetDate = getDayTimestampLocal(new Date(maxDate))
    let records = await db.dailyUsage
    .where("date")
    .aboveOrEqual(targetDate)
    .toArray()

    let totals = await db.usageTotals
    .where("date")
    .aboveOrEqual(targetDate)
    .toArray()
    totals = totals.filter((entry) => entry.date != ALL_TIME_KEY)

    let total = totals.reduce((acc, record) => acc + record.totalTime, 0)

    //sort records and get their icons from the "allTimeUsage" table
    let reduced = {}

    records.forEach(({ url, time }) => {
      reduced[url] = (reduced[url] || 0) + time;
    });

    const metas = await Promise.all( Object.keys(reduced).map(url => db.allTimeUsage.get(url)))

    let iconsMap = {}

    for(let m of metas){
      if(m) iconsMap[m.url] = m.icon
    }

    records = Object.entries(reduced)
    .map(([url, time]) => ({url: url, time: time, icon: iconsMap[url] || null}) )
    .sort((a,b) => b.time - a.time)
    records = records.slice(0, limit)
    return {records: records, totalTime: total}
  }
}

export async function getStartDate(){
  let record = await db.dailyUsage
  .orderBy("date")
  .limit(1)
  .toArray()

  return  record[0]?.date || Date.now()
}

export async function clearUsageData(){
  await db.delete();
}

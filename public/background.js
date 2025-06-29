import { getCalendarDayDiff } from "./utils.js"

const ALARM_NAME = "tracker-alarm"
const INTERVAL_TIME = 1000
let tempUsageData = {}
let tempUrlIcons = {}
let intervalId = null;

function getHostnameIfValid(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (e) {
    return null;
  }
}

function updateTempUsageData(url, time, favIconUrl){
  if(url === null || time === null || time > 35000) return;
  tempUsageData[url] = (tempUsageData[url]|| 0) + time;
  tempUrlIcons[url] = favIconUrl
}

async function fetchImageAsDataURL(imageUrl) {
  try {
    const res = await fetch(imageUrl);
    if(!res.ok) return null

    const contentType = res.headers.get('Content-Type');
    
    if(!contentType || !contentType.startsWith('image/')) return null

    const blob = await res.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // Data URL
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
  }catch (error) {
    // Network or CORS error
    console.error(`Fetch error for ${url}:`, error);
    return null;
  }
}


async function updateIcons(urlIcons){
  for(let url of Object.keys(tempUrlIcons)){
    if(!urlIcons[url]){
      urlIcons[url] = await fetchImageAsDataURL(tempUrlIcons[url])
    }
  }
  chrome.storage.local.set({ urlIcons }, () => {tempUrlIcons = {}});
}

function updateStorage(){
  
  console.log("saving :") 
  console.log(tempUsageData)
  
  chrome.storage.local.get("usageData", (result) => {
    const date = new Date();
    const day = date.getDate();
    const timestamp = date.getTime();

    let usageData = result.usageData || {
      last30Days : [{}],
      allTimeUsage: {},
      timestamp: timestamp
    };

    const daysSinceLastUpdate = getCalendarDayDiff(timestamp, usageData.timestamp)

    for(let i = 0; i < daysSinceLastUpdate; i++){
      usageData.last30Days.unshift({});
      if(usageData.last30Days.length > 30){
        usageData.last30Days.pop()
      }
    }

    for(let url of Object.keys(tempUsageData)){
      usageData.last30Days[0][url]  = (usageData.last30Days[0][url] || 0) + tempUsageData[url];
      usageData.allTimeUsage[url] = (usageData.allTimeUsage[url] || 0) + tempUsageData[url]; 
    }
    usageData.timestamp = timestamp;
  
    chrome.storage.local.set({ usageData }, () => { tempUsageData = {} });
  });

  chrome.storage.local.get("urlIcons", (result) => {
    let urlIcons = result.urlIcons || {};
    updateIcons(urlIcons)
  });
  
}

function getCurrentTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(tabs[0]);
    });
  });
}

function checkFocusState() {
  return new Promise((resolve, reject) => {
    chrome.windows.getLastFocused({ populate: false }, (window) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(window.focused === true);
      }
    });
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("alarm running...")
  updateStorage()
  if (!intervalId) {
    startInterval();
  }
});

async function checkAlarmState() {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (!alarm) {
    await chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.5 });
  }

}

chrome.runtime.onInstalled.addListener((details) => {
  checkAlarmState();
  startInterval();
  if (details.reason === "install") {
    console.log("installed...")
    const startTime = Date.now()
    chrome.storage.local.set({ startTime:startTime }, () => {});
  }
});

function startInterval() {
  if (intervalId) return;
  
  intervalId = setInterval(() => {
    checkFocusState().then((isFocused) => {
      if(isFocused){
        getCurrentTab().then((tab) => {
          updateTempUsageData(getHostnameIfValid(tab.url), INTERVAL_TIME, tab.favIconUrl)
        })
      }
    })
  }, INTERVAL_TIME);
}

chrome.runtime.onStartup.addListener(() => {
  checkAlarmState();
  startInterval();
});
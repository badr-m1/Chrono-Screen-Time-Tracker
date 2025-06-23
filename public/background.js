const ALARM_NAME = "tracker-alarm"
const INTERVAL_TIME = 1000
let tempUsageData = {}
let tempUrlIcons = {}
let intervalId = null;

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = Math.floor((date - firstDayOfYear) / 86400000);
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getHostnameIfValid(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname; // e.g., "example.com"
  } catch (e) {
    return null; // invalid URL
  }
}

function updateTempUsageData(url, time, icon){
  if(url === null || time === null || time > 35000) return;
  tempUsageData[url] = (tempUsageData[url]|| 0) + time;
  if(icon) tempUrlIcons[url] = icon
}

function updateStorage(url, time, icon){
  
  console.log("saving " + url + " : "  + time)
  
  chrome.storage.local.get("usageData", (result) => {
    const date = new Date();
    const day = date.getDate();
    const timestamp = date.getTime();

    let usageData = result.usageData || {
      last30Days : [{}],
      allTimeUsage: {},
      timestamp: timestamp
    };
  
    const lastDate = new Date(usageData.timestamp);
    const daysSinceLastUpdate = Math.floor((timestamp - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    for(let i = 0; i < daysSinceLastUpdate; i++){
      usageData.last30Days.unshift({});
      if(usageData.last30Days.length > 30){
        usageData.last30Days.pop()
      }
    }

    usageData.last30Days[0][url]  = (usageData.last30Days[0][url] || 0) + time;
    usageData.allTimeUsage[url] = (usageData.allTimeUsage[url] || 0) + time;
  
    usageData.timestamp = timestamp;
  
    chrome.storage.local.set({ usageData }, () => {});
  });

  if(!icon) return;
  chrome.storage.local.get("urlIcons", (result) => {
    let urlIcons = result.urlIcons || {};
    urlIcons[url] = urlIcons[url] || icon
    chrome.storage.local.set({ urlIcons }, () => {});
  });
  
}

function migrateToStorage(){
  const urls = Object.keys(tempUsageData)
  for(let i = 0; i < urls.length; i++){
    updateStorage(urls[i], tempUsageData[urls[i]], tempUrlIcons[urls[i]])
  }
  tempUsageData = {}
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
  migrateToStorage()
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
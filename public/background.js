import {bulkUpdateUsageData} from "./usageDataService.js"

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

async function updateStorage(){
  const entries = Object.keys(tempUsageData).map( (url) => ({url:url, time:tempUsageData[url], iconUrl: tempUrlIcons[url]}))
  bulkUpdateUsageData(entries)
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
    console.log("installed.")
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

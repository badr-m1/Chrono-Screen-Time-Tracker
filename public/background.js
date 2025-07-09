import {bulkUpdateUsageData} from "./usageDataService.js"

const ALARM_NAME = "tracker-alarm"
const ALARM_TIME = 2
const INTERVAL_TIME = 1000
let usageData = {}
let intervalId = null;

function getHostnameIfValid(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (e) {
    return null;
  }
}

function updateUsageData(url, time, favIconUrl){
  if(url === null || time === null || time > 35000) return;
  usageData[url] = {time: (usageData[url]?.time || 0) + time, iconUrl: favIconUrl};
}

async function updateStorage(){
  const entries = Object.keys(usageData).map( (url) => ({url:url, time:usageData[url].time, iconUrl: usageData[url].iconUrl}))
  await bulkUpdateUsageData(entries)
  usageData = {}
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

async function checkAlarmState() {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (!alarm) {
    await chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_TIME });
  }

}

chrome.alarms.onAlarm.addListener((alarm) => {
  updateStorage()
  if (!intervalId) {
    startInterval();
  }
});

function startInterval() {
  if (intervalId) return;
  
  intervalId = setInterval(() => {
    checkFocusState().then((isFocused) => {
      if(isFocused){
        getCurrentTab().then((tab) => {
          updateUsageData(getHostnameIfValid(tab.url), INTERVAL_TIME, tab.favIconUrl)
        })
      }
    })
  }, INTERVAL_TIME);
}

chrome.runtime.onStartup.addListener(() => {
  checkAlarmState();
  startInterval();
});

chrome.runtime.onInstalled.addListener(() => {
  checkAlarmState();
  startInterval();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message.type)
  if (message.type === "update_request") {
    updateStorage().then(result => {
      sendResponse("update_complete");
    })
  }
  return true;
});
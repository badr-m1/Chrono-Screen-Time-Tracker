const ALARM_NAME = "tracker-alarm"
let intervalId = null;
var currentUrl = null
var activeSince = null

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = Math.floor((date - firstDayOfYear) / 86400000);
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function setCurrentUrl(url){
  updateTimeTracking(currentUrl, Date.now() - activeSince)
  
  url = getHostnameIfValid(url)
  currentUrl = url
  activeSince = (url != null) ? Date.now() : null
  
  console.log("current url updated: " + url)
}

function getHostnameIfValid(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname; // e.g., "example.com"
  } catch (e) {
    return null; // invalid URL
  }
}


const updateTimeTracking = (url, time) => {
  if(url === null || activeSince === null || time > 35000) return;
  
  console.log("saving " + url + " : "  + time)
  
  chrome.storage.local.get("usageData", (result) => {
    const date = new Date();
    const day = date.getDate();
    const week = getWeekNumber(date);
    const month = date.getMonth();
    const timestamp = date.getTime();

    let usageData = result.usageData || {
      dailyUsage: {},
      weeklyUsage: {},
      monthlyUsage: {},
      allTimeUsage: {},
      timestamp: timestamp
    };
  
    const lastDate = new Date(usageData.timestamp);

    const updateScope = (scope, check) => {
      if (check) {
        usageData[scope] = {}
      };
      usageData[scope][url] = (usageData[scope][url] || 0) + time;
    };
  
    updateScope("dailyUsage", lastDate.getDate() !== day);
    updateScope("weeklyUsage", getWeekNumber(lastDate) !== week);
    updateScope("monthlyUsage", lastDate.getMonth() !== month);
  
    usageData.allTimeUsage[url] = (usageData.allTimeUsage[url] || 0) + time;
  
    usageData.timestamp = timestamp;
  
    chrome.storage.local.set({ usageData }, () => {});
  });
  
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab) {
      setCurrentUrl(null);
     
    }else{
      setCurrentUrl(tab.url);
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    setCurrentUrl(tab.url);
  }
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function checkFocusState(){
  chrome.windows.getLastFocused({ populate: false }, (window) => {
    const isFocused = window.focused === true;
    console.log("is focused:", isFocused);
    if(!isFocused){
      setCurrentUrl(null)
    }
    else{
      getCurrentTab().then((tab) => {
        setCurrentUrl(tab.url)
      })
    }
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("alarm running...")
  checkFocusState()

});

async function checkAlarmState() {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (!alarm) {
    await chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.5 });
  }
}



chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    checkFocusState()
    return;
  }

  chrome.tabs.query({ active: true, windowId }, (tabs) => {
    const tab = tabs[0];
    if (tab) {
      console.log("focus back")
      setCurrentUrl(tab.url)
    }
  });

});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("installed...")
    const startTime = Date.now()
    chrome.storage.local.set({ startTime:startTime }, () => {});
  }
});



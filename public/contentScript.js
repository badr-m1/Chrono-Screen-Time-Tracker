//setInterval(() => {
//    if(document.visibilityState != "visible") return;
//
//    console.log(document.location.href);
//
//    chrome.runtime.sendMessage({
//      type: 'tracking-update',
//      url: document.location.href,
//      time: 1000
//    });
//}, 1000);
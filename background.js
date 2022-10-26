function setStorage(data, callback) {
  if (chrome.storage.sync) chrome.storage.sync.set({ key: data }, callback);
}

function readStorage(callback) {
  if (chrome.storage.sync) chrome.storage.sync.get(["key"], callback);
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    tab.url?.startsWith("chrome://") ||
    tab.url?.startsWith("https://chrome.google.com/webstore")
  )
    return;
  console.log(tab.status);

  readStorage(async function (result) {
    const show = result.key.show;
    // Set the action badge to the current storage state
    await chrome.action.setBadgeText({
      tabId,
      text: show ? "" : "OFF",
    });
    // Insert/Remove the hide style
    if (show === false)
      Promise.all([
        chrome.scripting.insertCSS({
          files: ["hide.css"],
          target: { tabId: tab.id },
        }),
        chrome.scripting.removeCSS({
          files: ["show.css"],
          target: { tabId: tab.id },
        }),
      ]).then(() => {
        console.log("insert style completed");
      });
    else if (show === true)
      Promise.all([
        chrome.scripting.insertCSS({
          files: ["show.css"],
          target: { tabId: tab.id },
        }),
        chrome.scripting.removeCSS({
          files: ["hide.css"],
          target: { tabId: tab.id },
        }),
      ]).then(() => {
        console.log("insert style completed");
      });

    console.log("Set badge text to", show ? "" : "OFF", "in update listener");
  });
});

// Reload will not trigger onInstalled
chrome.runtime.onInstalled.addListener(async () => {
  console.log("On installed");

  const v1 = {
    key: "Hi",
    count: 1,
    url: "#",
    date: Date.now(),
  };

  const v2 = {
    key: "Sample",
    count: 1,
    url: "#",
    date: Date.now(),
  };

  chrome.action.setBadgeText({
    text: "OFF",
  });

  chrome.action.setBadgeBackgroundColor({
    color: "#FFCCCB",
  });

  // Initialize chrome storage data
  const initStorage = {
    show: false,
    data: [v1, v2],
  };
  setStorage(initStorage, function () {
    console.log("Init storage data", initStorage);
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log("On click extension icon");

  if (
    tab.url?.startsWith("chrome://") ||
    tab.url?.startsWith("https://chrome.google.com/webstore")
  )
    return;

  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === "" ? "OFF" : "";

  // Set the action badge to the next state
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  // Update storage to the next state
  readStorage(function (result) {
    const data = result?.key?.data || [];
    const target = {
      show: nextState === "" ? true : false,
      data,
    };
    setStorage(target, function () {
      console.log("Store complete", target);
    });
  });

  // Insert/Remove the hide style
  if (nextState === "OFF")
    Promise.all([
      chrome.scripting.insertCSS({
        files: ["hide.css"],
        target: { tabId: tab.id },
      }),
      chrome.scripting.removeCSS({
        files: ["show.css"],
        target: { tabId: tab.id },
      }),
    ]).then(() => {
      console.log("insert style completed");
    });
  else if (nextState === "")
    Promise.all([
      chrome.scripting.insertCSS({
        files: ["show.css"],
        target: { tabId: tab.id },
      }),
      chrome.scripting.removeCSS({
        files: ["hide.css"],
        target: { tabId: tab.id },
      }),
    ]).then(() => {
      console.log("insert style completed");
    });
});

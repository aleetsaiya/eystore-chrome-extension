// get the current tab
// reference: https://developer.chrome.com/docs/extensions/reference/tabs/#get-the-current-tab
async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// to inject JavaScript and CSS into websites.
// reference: https://developer.chrome.com/docs/extensions/reference/scripting/
async function injectScript(tabId, func) {
  return await chrome.scripting.executeScript({
    target: { tabId },
    func: func,
  });
}

function setStorage(data, callback) {
  chrome.storage.sync.set({ key: data }, callback);
}

function readStorage(callback) {
  chrome.storage.sync.get(["key"], callback);
}

window.onload = async () => {
  const { id: tabId } = await getCurrentTab();
  const label = document.querySelector("label.switch");
  const showBtn = document.createElement("input");
  showBtn.setAttribute("id", "show");
  showBtn.setAttribute("type", "checkbox");

  readStorage(function (result) {
    const show = result?.key?.show;
    if (show === true) {
      showBtn.checked = true;
    } else if (show === false) {
      showBtn.checked = false;
    }
  });

  label.insertBefore(showBtn, label.firstChild);

  setTimeout(() => {
    const transitionStyle = document.createElement("style");
    transitionStyle.innerHTML = `
    .slider {
      -webkit-transition: 0.2s;
      transition: 0.2s;
    }
  
    .slider:before {
      -webkit-transition: 0.2s;
      transition: 0.2s;
    }
  `;
    const body = document.querySelector("body");
    body.appendChild(transitionStyle);
  }, 500);

  showBtn.addEventListener("change", function (e) {
    const showSidebar = e.target.checked;

    // to show/hide sidebar
    const toShowSidebar = function () {
      const sidebar = document.getElementById("learning-extension-sidebar");
      if (sidebar) sidebar.style.display = "block";
    };

    const toHideSidebar = function () {
      const sidebar = document.getElementById("learning-extension-sidebar");
      if (sidebar) sidebar.style.display = "none";
    };

    if (showSidebar) {
      injectScript(tabId, toShowSidebar);
      readStorage(function (result) {
        const { key: d } = result;
        const target = {
          show: true,
          data: d.data,
        };

        setStorage(target, function () {
          console.log("Store complete", target);
        });
      });
    } else {
      injectScript(tabId, toHideSidebar);
      readStorage(function (result) {
        const { key: d } = result;
        const target = {
          show: false,
          data: d.data,
        };
        setStorage(target, function () {
          console.log("Store complete", target);
        });
      });
    }
  });
};

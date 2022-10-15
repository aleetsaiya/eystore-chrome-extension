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

// get the selected text on the current tab
async function getSelectedText(tabId) {
  const [res] = await injectScript(tabId, () =>
    window.getSelection().toString()
  );
  return res.result;
}

let selectedText;
const searchBtn = document.getElementById("search");
const controller = document.querySelector(".controller");

searchBtn.addEventListener("click", () => {
  window.open(
    `https://dictionary.cambridge.org/dictionary/english/${selectedText}`
  );
});

// to execute when the popup is open
window.onload = async () => {
  const tab = await getCurrentTab();
  // inject script function into current tab to get the current selected text
  selectedText = await getSelectedText(tab.id);
  // show the selected text on the extension page (popup.html)
  const target = document.getElementById("selected-text");
  if (selectedText.length !== 0) {
    target.innerHTML = selectedText;
  } else {
    target.innerHTML = "No vocabulary being selected";
    controller.style.display = "none";
  }
};

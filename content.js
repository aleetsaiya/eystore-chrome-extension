function createElement(tag, id = "", className = "") {
  const element = document.createElement(tag);
  id && element.setAttribute("id", id);
  className && element.setAttribute("class", className);
  return element;
}

function setStorage(callback) {
  // get vocabularies in storage
  chrome.storage.sync.set(["key"], callback);
}

function readStorage(callback) {
  chrome.storage.sync.get(["key"], callback);
}

function clearStorage() {
  chrome.storage.sync.clear();
}

class Select {
  constructor() {
    this.selectedBtn = this.createSelectedBtn();
  }
  // get the current selected text
  getSelectedText() {
    return window.getSelection().toString().trim();
  }
  // get the current selected text position
  getSelectionPosition() {
    const selection = window.getSelection().getRangeAt(0);
    const bounds = selection.getBoundingClientRect();
    return {
      left: bounds.left + bounds.width / 2,
      top: bounds.top + document.documentElement.scrollTop,
    };
  }

  getSelectedBtn() {
    return this.selectedBtn;
  }

  selectedBtnStyle({ display = "none", left = 0, top = 0 }) {
    return `position:absolute;display:${display}; left: ${left - 27}px; top:${
      top - 27
    }px; width:22px; height:22px; outline:none; border: none; z-index: 10; border-radius: 3px; cursor:pointer; align-items: center; justify-content: center; background-color: #77c3ec; color:#fff;`;
  }

  createSelectedBtn() {
    const selectedBtn = createElement("button", "selected-btn");
    selectedBtn.innerHTML = "+";
    return selectedBtn;
  }

  showSelectedBtn() {
    this.selectedBtn.setAttribute(
      "style",
      this.selectedBtnStyle({ display: "flex", ...this.getSelectionPosition() })
    );
  }

  hideSelectedBtn() {
    this.selectedBtn.setAttribute("style", this.selectedBtnStyle({}));
  }
}

class Sidebar {
  constructor() {
    this.sidebar = this.createSidebar();
  }

  getSidebar() {
    return this.sidebar;
  }

  createSidebar() {
    const sidebar = createElement("div", "learning-extension-sidebar");
    const closeBtn = createElement("button", "learning-extension-close-btn");
    closeBtn.innerHTML = "X";
    const ul = createElement("ul", "learning-extension-ul");
    this.renderData(ul);

    sidebar.appendChild(closeBtn);
    sidebar.appendChild(ul);
    return sidebar;
  }

  renderData(ul) {
    ul.innerHTML = "";
    const callback = function (result) {
      const data = result?.key?.data || [];

      data.forEach((v) => {
        const item = createElement("li");
        const text = createElement("div", "", "text");
        text.innerHTML = v.key;

        const controls = createElement("div", "", "controls");
        const btn1 = createElement("button");
        btn1.innerHTML = "Search";
        btn1.addEventListener("click", function () {
          window.open(
            `https://dictionary.cambridge.org/dictionary/english/${v.key}`
          );
        });

        controls.appendChild(btn1);
        item.appendChild(text);
        item.appendChild(controls);
        ul.appendChild(item);
      });
    };

    readStorage(callback);
  }
}

// add template to DOM
window.onload = function () {
  const body = document.querySelector("body");
  const select = new Select();
  const sidebar = new Sidebar();

  body.appendChild(createGlobalStyle());
  body.appendChild(select.getSelectedBtn());
  body.appendChild(sidebar.getSidebar());

  // to avoid error in "detect click event twice" with document click and button click
  let closeFlag = false;

  // when user select vocabulary
  document.addEventListener("click", () => {
    if (closeFlag) closeFlag = false;
    else if (select.getSelectedText().length > 0) select.showSelectedBtn();
  });

  document.addEventListener("selectionchange", () => {
    if (select.getSelectedText().length === 0) select.hideSelectedBtn();
  });

  select.getSelectedBtn().addEventListener("click", () => {
    closeFlag = true;
    select.hideSelectedBtn();

    const target = {
      key: select.getSelectedText(),
      count: 1,
      url: window.location.href,
      date: Date.now(),
    };

    const initStorageData = {
      show: false,
      data: [],
    };

    const callback = function (result) {
      console.log("storage result", result);
      const { key } = target;
      const d = {
        show: result?.key?.show || initStorageData.show,
        data: [],
      };

      // check if the current target is already in to storage
      const data = result?.key?.data || [];
      const idx = data.findIndex((v) => v.key === key);

      if (idx === -1) {
        d.data = [...data, target];
      } else {
        d.data = [...data];
        d.data[idx].count += 1;
        d.data[idx].date = Date.now();
      }

      // sort value by date
      d.data.sort((a, b) => b.date - a.date);

      const setStorageCallback = function () {
        console.log("Store complete", d);
        const ul = document.getElementById("learning-extension-ul");
        sidebar.renderData(ul);
      };

      // store data into storage
      chrome.storage.sync.set({ key: d }, setStorageCallback);
    };

    readStorage(callback);
  });
};

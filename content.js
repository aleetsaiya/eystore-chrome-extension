function createElement(tag, id = "", className = "") {
  const element = document.createElement(tag);
  id && element.setAttribute("id", id);
  className && element.setAttribute("class", className);
  return element;
}

function setStorage(data, callback) {
  chrome.storage.sync.set({ key: data }, callback);
}

function readStorage(callback) {
  chrome.storage.sync.get(["key"], callback);
}

function clearStorage() {
  chrome.storage.sync.clear();
}

class Select {
  constructor() {
    this.createSelectedBtn();
    this.hideSelectedBtn();
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

  selectedBtnStyle({ display = "none", left = 0, top = 0 }) {
    return `position:absolute;display:${display}; left: ${left - 27}px; top:${
      top - 27
    }px; width:22px; height:22px; outline:none; border: none; z-index: 10; border-radius: 3px; cursor:pointer; align-items: center; justify-content: center; background-color: #77c3ec; color:#fff;`;
  }

  createSelectedBtn() {
    this.selectedBtn = createElement("button", "selected-btn");
    this.selectedBtn.innerHTML = "+";
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
    this.createSidebar();
  }

  createSidebar() {
    this.sidebar = createElement("div", "learning-extension-sidebar");
    this.sidebar.style.display = "none";

    readStorage(function (result) {
      const data = result?.key?.data;
      const target = {
        show: false,
        data: data || [],
      };
      setStorage(target, function () {
        console.log("Store completed", target);
      });
    });

    this.ul = createElement("ul", "learning-extension-ul");
    this.renderData();
    this.sidebar.appendChild(this.ul);
  }

  renderData() {
    this.ul.innerHTML = "";
    const callback = (result) => {
      const data = result?.key?.data || [];

      data.forEach((v) => {
        const item = createElement("li");
        const text = createElement("div", "", "learning-extension-text");
        text.setAttribute("data-key", v.key);
        text.innerHTML = v.key;

        const controls = createElement(
          "div",
          "",
          "learning-extension-controls"
        );
        const date = createElement("span", "", "learning-extension-date");
        const d = new Date(v.date);
        date.innerHTML = `${d.getFullYear()}/${d.getMonth()}/${d.getDate()}`;
        const history = createElement("a", "", "learning-extension-history");
        history.setAttribute("href", v.url);
        history.setAttribute("target", "_blank");
        history.innerHTML = "history";

        const dicon = createElement(
          "img",
          "",
          "learning-extension-delete-icon"
        );
        const iconPath = chrome.runtime.getURL("./images/delete.png");
        dicon.setAttribute("src", iconPath);
        dicon.setAttribute("alt", "delete-icon");
        dicon.setAttribute("data-key", v.key);

        controls.appendChild(history);
        controls.appendChild(date);
        item.appendChild(text);
        item.appendChild(controls);
        item.appendChild(dicon);
        this.ul.appendChild(item);
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
  body.appendChild(select.selectedBtn);
  body.appendChild(sidebar.sidebar);

  // to avoid error in "detect click event twice" with document click and button click
  let closeFlag = false;

  // when user select vocabulary
  document.addEventListener("click", () => {
    if (closeFlag) closeFlag = false;
    else if (
      select.getSelectedText().length > 0 &&
      select.getSelectedText().split(" ").length === 1
    )
      select.showSelectedBtn();
  });

  document.addEventListener("selectionchange", () => {
    if (select.getSelectedText().length === 0) select.hideSelectedBtn();
  });

  sidebar.ul.addEventListener("click", function (e) {
    const target = e.target;
    const { className } = target;
    const { key } = target.dataset;
    if (className === "learning-extension-text")
      window.open(`https://dictionary.cambridge.org/dictionary/english/${key}`);
    else if (className === "learning-extension-delete-icon") {
      readStorage(function (result) {
        const data = [...result.key.data];
        const idx = data.findIndex((d) => d.key === key);
        if (idx !== -1) {
          data.splice(idx, 1);
          const target = {
            ...result.key,
            data,
          };
          setStorage(target, function () {
            console.log("Delete complete", target);
            sidebar.renderData(sidebar.ul);
          });
        }
      });
    }
  });

  select.selectedBtn.addEventListener("click", () => {
    closeFlag = true;
    select.hideSelectedBtn();

    const target = {
      key: select.getSelectedText(),
      count: 1,
      url: window.location.href,
      date: Date.now(),
    };

    readStorage(function (result) {
      const { key } = target;
      const { data } = result.key;

      // check if the current target is already in to storage
      const idx = data.findIndex((v) => v.key === key);

      let da;
      if (idx === -1) {
        da = [...data, target];
      } else {
        da = [...data];
        da[idx].count += 1;
        da[idx].date = Date.now();
      }

      // sort value by date
      da.sort((a, b) => b.date - a.date);

      const d = {
        show: result.key.show,
        data: da,
      };
      // store data into storage
      setStorage(d, function () {
        console.log("Store complete", d);
        sidebar.renderData(sidebar.ul);
      });
    });
  });
};

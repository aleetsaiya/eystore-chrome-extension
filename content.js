function createElement(tag, id = "", className = "") {
  const element = document.createElement(tag);
  id && element.setAttribute("id", id);
  className && element.setAttribute("class", className);
  return element;
}

function setStorage(data, callback) {
  if (chrome.storage.sync) chrome.storage.sync.set({ key: data }, callback);
}

function readStorage(callback) {
  if (chrome.storage.sync) chrome.storage.sync.get(["key"], callback);
}

function clearStorage() {
  if (chrome.storage.sync) chrome.storage.sync.clear();
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
    }px; width:20px; height:20px; outline:none; border: none; z-index: 2147483647; cursor:pointer; background-color: white; border-radius: 50%;`;
  }

  createSelectedBtn() {
    this.selectedBtn = createElement("img", "learning-extension-selected-btn");

    const imgPath = chrome.runtime.getURL("./images/add.png");
    this.selectedBtn.setAttribute("src", imgPath);
    this.selectedBtn.setAttribute("alt", "add");
  }

  showSelectedBtn() {
    this.selectedBtn.setAttribute(
      "style",
      this.selectedBtnStyle({
        display: "block",
        ...this.getSelectionPosition(),
      })
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
    this.searchBlock = createElement("input", "learning-extension-search");
    this.searchBlock.setAttribute("type", "text");
    this.searchBlock.setAttribute("placeholder", "Search ...");

    this.ul = createElement("ul", "learning-extension-ul");
    this.renderData();

    this.sidebar.appendChild(this.searchBlock);
    this.sidebar.appendChild(this.ul);
  }

  renderData(filter) {
    this.ul.innerHTML = "";
    const callback = (result) => {
      let data = result?.key?.data || [];

      if (filter) data = data.filter(filter);

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
        date.innerHTML = `${d.getFullYear()}/${
          d.getMonth() + 1
        }/${d.getDate()}`;
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

window.onload = function () {
  const body = document.querySelector("body");
  const head = document.querySelector("head");
  const select = new Select();
  const sidebar = new Sidebar();

  head.appendChild(createGlobalStyle());
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
    ) {
      let isEnglish = true;
      const text = select.getSelectedText();
      for (let t of text) {
        if (
          !(t >= "A" && t <= "Z") &&
          !(t >= "a" && t <= "z") &&
          !(t >= "0" && t <= "9")
        ) {
          isEnglish = false;
          break;
        }
      }
      isEnglish && select.showSelectedBtn();
    }
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
            sidebar.renderData();
          });
        }
      });
    }
  });

  sidebar.searchBlock.addEventListener("input", function (e) {
    const value = e.target.value;
    if (value.trim() === "") sidebar.renderData();
    else {
      const filter = (d) => d.key.toLowerCase().startsWith(value.toLowerCase());
      sidebar.renderData(filter);
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
        sidebar.renderData();
      });
    });
  });
};

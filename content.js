function styled({ display = "none", left = 0, top = 0 }) {
  return `position:absolute;display:${display}; left: ${left - 27}px; top:${
    top - 27
  }px; width:22px; height:22px; outline:none; border: none; z-index: 10; border-radius: 3px; cursor:pointer; align-items: center; justify-content: center; background-color: #77c3ec; color:#fff;`;
}

// get the current selected text
function getSelectedText() {
  return window.getSelection().toString().trim();
}

// get the current selected text position
function getSelectionPosition() {
  const selection = window.getSelection().getRangeAt(0);
  const bounds = selection.getBoundingClientRect();
  return {
    left: bounds.left + bounds.width / 2,
    top: bounds.top + document.documentElement.scrollTop,
    display: "flex",
  };
}

// to create button
function createButton() {
  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `
    <button id="save-vocabulary" style="${styled({})}">
      +
    </button>
    `,
    "text/html"
  );
  return doc.body;
}

// add template to DOM
window.onload = function () {
  const body = document.querySelector("body");
  body.appendChild(createButton());
  const button = document.getElementById("save-vocabulary");

  // to prevent "detect click event twice" with document click and button click
  let closeFlag = false;

  // when user select vocabulary
  document.addEventListener("click", () => {
    if (closeFlag) {
      closeFlag = false;
    } else if (getSelectedText().length > 0) {
      // show the button follow by the selected text
      button.setAttribute("style", styled(getSelectionPosition()));
    }
  });

  document.addEventListener("selectionchange", () => {
    if (getSelectedText().length === 0) {
      // hide button
      button.setAttribute("style", styled({}));
    }
  });

  button.addEventListener("click", () => {
    closeFlag = true;
    button.setAttribute("style", styled({}));
  });
};

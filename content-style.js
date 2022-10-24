function createGlobalStyle() {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

      #learning-extension-sidebar {
        font-family: 'Roboto', sans-serif;
        background-color: #292b2c;
        position:fixed; 
        top: 0; 
        right: 0;
        width: 250px;
        height: 100vh;
        overflow-y: scroll;
        z-index: 2147483647;
        color: #f7f7f7;
      }

      #learning-extension-ul {
        padding: 0 20px;
        margin: 0;
        margin-top: 20p20
      }
  
      #learning-extension-ul > li {
        position: relative;
        list-style: none;
        font-size: 18px; 
        width: 100%; 
        padding-bottom: 10px;
        border-bottom: solid 1px gray;
        margin-top: 15px;
        margin-left: 0;
        margin-right: 0;
      }

      #learning-extension-ul > li:last-child {
        border-bottom: none;
      }

      #learning-extension-ul > li > .learning-extension-delete-icon {
        position: absolute;
        top: 0px;
        right: 0px;
        width: 19px;
        cursor: pointer;
        filter: invert(0.5);
      }

      #learning-extension-ul > li > .learning-extension-delete-icon:hover {
        filter: invert(0.8);
      }
  
      #learning-extension-ul > li > .learning-extension-text {
        margin-bottom: 5px;
        min-height: 30px;
        cursor: pointer;
        display: inline-block;
      }

      #learning-extension-ul > li > .learning-extension-text:hover {
        color: #f0ad4e;
      }

      #learning-extension-ul > li > .learning-extension-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 32px;
      }

      #learning-extension-ul > li > .learning-extension-controls > .learning-extension-history {
        font-size: 12px;
        color: #6495ED;
        text-decoration: none;
      }

      #learning-extension-ul > li > .learning-extension-controls > .learning-extension-history:visited {
        color: #6495ED;
      }

      #learning-extension-ul > li > .learning-extension-controls > .learning-extension-history:hover {
        color: #8eace2;
        text-decoration: underline;
      }
  
      #learning-extension-ul > li > .learning-extension-controls > .learning-extension-date {
        font-size: 8px;
        color: #d8d2d2;
      }
    `;
  return styleElement;
}

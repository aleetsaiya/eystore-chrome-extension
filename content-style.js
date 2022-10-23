function createGlobalStyle() {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = `
      #learning-extension-sidebar {
        background-color: #0C0C0C;
        position:fixed; 
        top: 0; 
        right: 0;
        width: 250px;
        height: 100vh;
        overflow-y: scroll;
        z-index: 99999;
        color: #FEFEFE;
      }
  
      #learning-extension-close-btn {
        position: fixed; 
        top: 15px; 
        right: 20px; 
        border: none; 
        outline: none; 
        width: 20px; 
        height: 20px; 
        cursor: pointer; 
        font-size: 15px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: inherit; 
        background-color: inherit;
      }
  
      #learning-extension-ul {
        padding: 0 20px;
        margin-top: 20px;
      }
  
      #learning-extension-ul > li {
        list-style: none;
        font-size: 18px; 
        width: 100%; 
        padding-bottom: 10px;
      }
  
      #learning-extension-ul > li > .text {
        margin-bottom: 5px;
      }
  
      #learning-extension-ul > li > .controls > button {
        cursor: pointer; 
        border: solid 1px #fefefe; 
        padding: 3px 8px; 
        background-color: inherit; 
        color: #fefefe; 
        font-size: 12px; 
        border-radius: 3px;
      }
    `;
  return styleElement;
}

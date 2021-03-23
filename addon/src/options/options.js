const DEFAULT_WSS_URL = "ws://localhost:3210/dev";

const wssUrlInput = document.querySelector("#wss-url");
const saveButton = document.querySelector("#save-btn");
const resetButton = document.querySelector("#reset-btn");
const infoPanel = document.querySelector("#info");

function setInfoText(text) {
  infoPanel.textContent = text;
  setTimeout(() => (infoPanel.textContent = ""), 5000);
}

// initially set stored value
chrome.storage.sync.get(storage => {
  if (storage.wssUrl) {
    wssUrlInput.value = storage.wssUrl;
  }
});

saveButton.addEventListener("click", () => {
  chrome.storage.sync.set({
    wssUrl: wssUrlInput.value || DEFAULT_WSS_URL
  }, () => {
    setInfoText("saved!");
  });
});

resetButton.addEventListener("click", () => {
  chrome.storage.sync.set({
    wssUrl: DEFAULT_WSS_URL
  }, () => {
    wssUrlInput.value = DEFAULT_WSS_URL;
    setInfoText("reset saved!");
  });
});

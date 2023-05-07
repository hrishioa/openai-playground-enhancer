'use strict';

import { consoleLog } from './constants';
import './popup.css';

console.log('Loaded popup.ts');

document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.id) {
    const chatModeActions = document.getElementById("chatModeActions");
    const unsupportedMode = document.getElementById("unsupportedMode");

    chrome.tabs.sendMessage(tab.id, { action: "checkChatMode" }, (response) => {
      console.log('Got response for chatmode', response);
      if (response && response.chatMode && chatModeActions) {
        chatModeActions.style.display = "block";
      } else if (!response && unsupportedMode) {
        unsupportedMode.style.display = "block";
      }
    });
  }
});

document.getElementById("exportBtn")?.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.id)
    chrome.tabs.sendMessage(tab.id, { action: "exportMessages" }, (response) => {
      const data = JSON.stringify(response.messages, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `messages-${date}.json`.substr(0, 250);

      chrome.downloads.download({ url, filename, saveAs: true });
    });
  else
    consoleLog('No tab, aborting...');
});


document.getElementById("loadBtn")?.addEventListener("click", () => {
  document.getElementById("importFile")?.click();
});

document.getElementById("importFile")?.addEventListener("change", async (event) => {
  console.log('File import changed');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const file = (event.target as any).files[0];

  consoleLog('Got file: ', file);

  if (!file) return;

  consoleLog('Loading ', file.name);

  const reader = new FileReader();
  reader.onload = () => {
    const messages = JSON.parse(String(reader.result));

    consoleLog('Importing messages: ', messages);

    if (tab && tab.id)
      chrome.tabs.sendMessage(tab.id, { action: "importMessages", messages });
  }
  reader.readAsText(file);
});


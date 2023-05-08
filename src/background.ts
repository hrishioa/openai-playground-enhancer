'use strict';

import { addNewMessage, clearAllButOneMessage } from './contentScript';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message: string = `Hi ${
      sender.tab ? 'Con' : 'Pop'
    }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  console.log(`Command "${command}" called`);

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (command === 'clear-all-but-one') {
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: clearAllButOneMessage,
    });
  } else if (command === 'add-message') {
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: addNewMessage,
    });
  }
});

import { consoleLog } from './constants';

type Message = {
  role: 'system' | 'assistant' | 'user';
  content: string;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "exportMessages") {
    const messages = getAllMessages();
    consoleLog('Exporting messages: ', messages);
    sendResponse({ messages });
  } else if (request.action === "checkChatMode") {
    const chatMode = window.location.href.includes("?mode=chat");
    consoleLog('Chat mode: ', chatMode)
    sendResponse({ chatMode });
  } else if (request.action === "importMessages") {
    consoleLog('Importing messages...');
    importMessages(request.messages);
  }
});

function importMessages(messages: Message[]) {
  // Clear existing messages
  clearExistingMessages();

  // Process imported messages
  const exchangeContainer = document.querySelector(".chat-pg-exchange-container .chat-pg-exchange");

  if (!exchangeContainer) {
    console.error("Unable to locate the chat-pg-exchange container element.");
    return;
  }

  messages.forEach((message: Message) => {
    if (message.role === 'system') {
      // Find the textarea element for the system message
      const systemTextarea = document.querySelector('.text-input-with-header.chat-pg-instructions textarea');
      if (systemTextarea) {
        (systemTextarea as any).value = message.content;
        // Dispatch input event
        systemTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      // Process assistant and user messages
      const addMessageButton = exchangeContainer.querySelector(".chat-pg-message.add-message");

      if (addMessageButton) {
        (addMessageButton as any).click();

        const messageInputElements = document.querySelectorAll(".chat-pg-message:not(.add-message) .text-input-with-focus textarea");

        if (messageInputElements && messageInputElements.length > 0) {
          const lastMessageInputElement = messageInputElements[messageInputElements.length - 1];
          const roleSpan = lastMessageInputElement.closest('.chat-pg-message')?.querySelector('.chat-message-role-text');

          // Set the message content
          (lastMessageInputElement as any).value = message.content;
          // Dispatch input event
          lastMessageInputElement.dispatchEvent(new Event('input', { bubbles: true }));

          // Set the role by simulating clicks
          if (roleSpan) {
            while (roleSpan.textContent?.trim().toLowerCase() !== message.role) {
              (roleSpan as any).click();
            }
          }
        }
      }
    }
  });
}



function clearExistingMessages() {
  // Clear system message
  const systemTextarea = document.querySelector('.text-input-with-header.chat-pg-instructions textarea');
  if (systemTextarea) {
    (systemTextarea as any).value = '';
  }

  // const deleteButtons = document.querySelectorAll('.chat-pg-message .chat-message-remove-button');

  // deleteButtons.forEach((button) => {
  //   button.click();
  // });
}

function getAllMessages() {
  const systemMessages = document.querySelectorAll(".text-input-with-header.chat-pg-instructions");
  const chatPgMessages = document.querySelectorAll(".chat-pg-message");

  const messages: Message[] = [];

  Array.from(systemMessages).forEach(element => {
    const role = element.querySelector(".text-input-header-subheading")?.textContent;
    const content = element.querySelector("textarea")?.value;
    if (role && content)
      messages.push({ role: role.toLowerCase(), content } as Message);
  });

  Array.from(chatPgMessages).forEach(element => {
    const role = element.querySelector(".chat-message-role-text")?.textContent;
    const content = element.querySelector("textarea")?.value;
    if (role && content)
      messages.push({ role: role.toLowerCase(), content } as Message);
  });

  return messages;
}

import { consoleLog } from './constants';

type Message = {
  role: 'system' | 'assistant' | 'user';
  content: string;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportMessages') {
    const messages = getAllMessages();
    consoleLog('Exporting messages: ', messages);
    sendResponse({ messages });
  } else if (request.action === 'checkChatMode') {
    const chatMode = window.location.href.includes('?mode=chat');
    consoleLog('Chat mode: ', chatMode);
    sendResponse({ chatMode });
  } else if (request.action === 'importMessages') {
    consoleLog('Importing messages...');
    importMessages(request.messages);
  } else if (request.action === 'clearMessages') {
    consoleLog('Clearing messages...');
    clearAllButOneMessage();
  } else if (request.action === 'clearAllMessages') {
    consoleLog('Clearing ALL messages...');
    clearExistingMessages();
  }
});

async function importMessages(messages: Message[]) {
  // Clear existing messages
  await clearExistingMessages();

  // Process imported messages
  const exchangeContainer = document.querySelector(
    '.chat-pg-exchange-container .chat-pg-exchange'
  );

  if (!exchangeContainer) {
    console.error('Unable to locate the chat-pg-exchange container element.');
    return;
  }

  messages.forEach((message: Message) => {
    if (message.role === 'system') {
      // Find the textarea element for the system message
      const systemTextarea = document.querySelector(
        '.text-input-with-header.chat-pg-instructions textarea'
      );
      if (systemTextarea) {
        (systemTextarea as any).value = message.content;
        // Dispatch input event
        systemTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      // Process assistant and user messages
      const addMessageButton = exchangeContainer.querySelector(
        '.chat-pg-message.add-message'
      );

      if (addMessageButton) {
        (addMessageButton as any).click();

        const messageInputElements = document.querySelectorAll(
          '.chat-pg-message:not(.add-message) .text-input-with-focus textarea'
        );

        if (messageInputElements && messageInputElements.length > 0) {
          const lastMessageInputElement =
            messageInputElements[messageInputElements.length - 1];
          const roleSpan = lastMessageInputElement
            .closest('.chat-pg-message')
            ?.querySelector('.chat-message-role-text');

          // Set the message content
          (lastMessageInputElement as any).value = message.content;
          // Dispatch input event
          lastMessageInputElement.dispatchEvent(
            new Event('input', { bubbles: true })
          );

          // Set the role by simulating clicks
          if (roleSpan) {
            while (
              roleSpan.textContent?.trim().toLowerCase() !== message.role
            ) {
              (roleSpan as any).click();
            }
          }
        }
      }
    }
  });
}

export async function addNewMessage() {
  const addMessage = document.querySelector('.chat-pg-message.add-message');

  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  addMessage?.dispatchEvent(clickEvent);
  await new Promise((resolve) => setTimeout(resolve, 100));
  const messages = document.querySelectorAll('.chat-pg-message');
  const textInput = messages[messages.length - 2].children[1].firstChild;
  // @ts-ignore
  textInput.focus();
}

export async function clearAllButOneMessage() {
  const messages = document.querySelectorAll(
    '.chat-pg-message .chat-message-button-container'
  );
  const messagesArray = Array.from(messages).reverse();
  try {
    for await (const [index, messageEl] of messagesArray.entries()) {
      if (index === messagesArray.length - 1) {
        continue;
      }
      try {
        const event = new MouseEvent('mouseover', {
          view: window,
          bubbles: true,
          cancelable: true,
        });

        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });

        messageEl.parentElement?.dispatchEvent(event);
        await new Promise((resolve) => setTimeout(resolve, 100));
        messageEl.firstChild?.dispatchEvent(clickEvent);
      } catch (error) {}
    }
  } catch (error) {}
}

async function clearExistingMessages() {
  // Clear system message
  const systemTextarea = document.querySelector(
    '.text-input-with-header.chat-pg-instructions textarea'
  );
  if (systemTextarea) {
    (systemTextarea as any).value = '';
  }

  // Clear user + assistant messages

  const messages = document.querySelectorAll(
    '.chat-pg-message .chat-message-button-container'
  );
  const messagesArray = Array.from(messages).reverse();
  try {
    for await (const [index, messageEl] of messagesArray.entries()) {
      try {
        var event = new MouseEvent('mouseover', {
          view: window,
          bubbles: true,
          cancelable: true,
        });

        var clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });

        messageEl.parentElement?.dispatchEvent(event);
        await new Promise((resolve) => setTimeout(resolve, 100));
        messageEl.firstChild?.dispatchEvent(clickEvent);
      } catch (error) {}
    }
  } catch (error) {}
}

function getAllMessages() {
  const systemMessages = document.querySelectorAll(
    '.text-input-with-header.chat-pg-instructions'
  );
  const chatPgMessages = document.querySelectorAll('.chat-pg-message');

  const messages: Message[] = [];

  Array.from(systemMessages).forEach((element) => {
    const role = element.querySelector(
      '.text-input-header-subheading'
    )?.textContent;
    const content = element.querySelector('textarea')?.value;
    if (role && content)
      messages.push({ role: role.toLowerCase(), content } as Message);
  });

  Array.from(chatPgMessages).forEach((element) => {
    const role = element.querySelector('.chat-message-role-text')?.textContent;
    const content = element.querySelector('textarea')?.value;
    if (role && content)
      messages.push({ role: role.toLowerCase(), content } as Message);
  });

  return messages;
}

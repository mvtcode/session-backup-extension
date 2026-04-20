/**
 * Content script to interact with localStorage and sessionStorage.
 */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ success: true });
  } else if (message.type === 'GET_STORAGE_DATA') {
    const data = {
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
    };
    sendResponse(data);
  } else if (message.type === 'SET_STORAGE_DATA') {
    const { localStorage: ls, sessionStorage: ss, mode } = message.payload;

    if (mode === 'overwrite') {
      localStorage.clear();
      sessionStorage.clear();
    }

    if (ls) {
      Object.entries(ls).forEach(([key, value]) => {
        localStorage.setItem(key, value as string);
      });
    }

    if (ss) {
      Object.entries(ss).forEach(([key, value]) => {
        sessionStorage.setItem(key, value as string);
      });
    }

    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
});

console.log('Background script loaded');

// Function to inject content script
async function injectContentScript(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    
    // Skip chrome:// and chrome-extension:// URLs
    if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      console.log('Injecting content script into tab:', tabId);
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      console.log('Content script injection successful');
    }
  } catch (error) {
    console.error('Error injecting content script:', error);
  }
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);
  chrome.storage.local.set({ cards: [] });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab updated:', tabId);
    injectContentScript(tabId);
  }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener(({ tabId }) => {
  console.log('Tab activated:', tabId);
  injectContentScript(tabId);
});
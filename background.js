// Background service worker — uses chrome.tabs API for reliable tab switch detection
// Sends "pause" or "play" messages to content scripts on YouTube tabs

function sendMessageToTab(tabId, action) {
    chrome.tabs.sendMessage(tabId, { action }).catch(() => {
        // Content script may not be ready yet — ignore
    });
}

// When the user switches to a different tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    // Get all tabs in the current window
    const tabs = await chrome.tabs.query({ windowId: activeInfo.windowId });

    for (const tab of tabs) {
        if (!tab.url || !tab.url.includes("youtube.com")) continue;

        if (tab.id === activeInfo.tabId) {
            // This YouTube tab just became active — resume
            sendMessageToTab(tab.id, "play");
        } else {
            // This YouTube tab is now inactive — pause
            sendMessageToTab(tab.id, "pause");
        }
    }
});

// When the browser window loses/gains focus
chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // All windows lost focus — pause all YouTube tabs
        const tabs = await chrome.tabs.query({ url: "*://*.youtube.com/*" });
        for (const tab of tabs) {
            sendMessageToTab(tab.id, "pause");
        }
    } else {
        // A window gained focus — resume the active YouTube tab in that window
        const tabs = await chrome.tabs.query({ active: true, windowId });
        for (const tab of tabs) {
            if (tab.url && tab.url.includes("youtube.com")) {
                sendMessageToTab(tab.id, "play");
            }
        }
    }
});

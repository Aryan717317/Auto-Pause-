(() => {
  let isTabActive = !document.hidden;
  let pausedByExtension = new Set();
  let enforceInterval = null;

  // ========== CORE: Pause all playing videos ==========
  function pauseAll() {
    isTabActive = false;
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      if (!video.paused) {
        video.pause();
        pausedByExtension.add(video);
      }
    });
    // Start enforcing pause — YouTube Shorts aggressively restarts videos
    startEnforcing();
  }

  // ========== CORE: Resume videos we paused ==========
  function resumeAll() {
    isTabActive = true;
    stopEnforcing();
    pausedByExtension.forEach((video) => {
      video.play().catch(() => { });
    });
    pausedByExtension.clear();
  }

  // ========== ENFORCE: Polling loop to keep videos paused ==========
  // YouTube Shorts has internal JS that restarts videos.
  // We fight back by checking every 300ms while the tab is hidden.
  function startEnforcing() {
    stopEnforcing();
    enforceInterval = setInterval(() => {
      if (isTabActive) {
        stopEnforcing();
        return;
      }
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        if (!video.paused) {
          video.pause();
          pausedByExtension.add(video);
        }
      });
    }, 300);
  }

  function stopEnforcing() {
    if (enforceInterval !== null) {
      clearInterval(enforceInterval);
      enforceInterval = null;
    }
  }

  // ========== LISTENER: Messages from background.js ==========
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "pause") {
      pauseAll();
    } else if (message.action === "play") {
      resumeAll();
    }
  });

  // ========== FALLBACK: visibilitychange (catches minimize, etc.) ==========
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAll();
    } else {
      resumeAll();
    }
  });

  // ========== OBSERVER: Catch dynamically added videos ==========
  const observer = new MutationObserver(() => {
    if (isTabActive) return;
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      if (!video.paused) {
        video.pause();
        pausedByExtension.add(video);
      }
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();

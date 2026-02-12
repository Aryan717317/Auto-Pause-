(() => {
  let isTabActive = !document.hidden;
  const pausedByUs = new Set();

  // ===================================================================
  // NUCLEAR OPTION: Override video.play() with a no-op while tab hidden
  // YouTube's internal JS calls video.play() to restart Shorts.
  // By replacing the method itself, YouTube literally cannot play videos.
  // ===================================================================

  function disablePlay(video) {
    if (!video.__originalPlay) {
      video.__originalPlay = video.play.bind(video);
      video.play = function () {
        // Return a resolved promise (same contract as real play())
        return Promise.resolve();
      };
    }
  }

  function restorePlay(video) {
    if (video.__originalPlay) {
      video.play = video.__originalPlay;
      delete video.__originalPlay;
    }
  }

  // ========== PAUSE ALL ==========
  function pauseAll() {
    isTabActive = false;
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      // Override play() so YouTube can't restart it
      disablePlay(video);

      if (!video.paused) {
        video.__originalPlay
          ? (video.pause(), pausedByUs.add(video))
          : (video.pause(), pausedByUs.add(video));
      }
    });

    // Also observe for any NEW videos added while tab is hidden
    startObserver();
  }

  // ========== RESUME ALL ==========
  function resumeAll() {
    isTabActive = true;
    stopObserver();

    // Restore play() on ALL videos first
    document.querySelectorAll("video").forEach((video) => {
      restorePlay(video);
    });

    // Then resume only the ones we paused
    pausedByUs.forEach((video) => {
      restorePlay(video); // ensure restored
      video.play().catch(() => { });
    });
    pausedByUs.clear();
  }

  // ========== MUTATION OBSERVER ==========
  let observer = null;

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(() => {
      if (isTabActive) return;
      // Catch newly added videos and lock them too
      document.querySelectorAll("video").forEach((video) => {
        disablePlay(video);
        if (!video.paused) {
          video.pause();
          pausedByUs.add(video);
        }
      });
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // ========== LISTENERS ==========

  // 1. Messages from background.js (tab switch detection)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "pause") {
      pauseAll();
    } else if (message.action === "play") {
      resumeAll();
    }
  });

  // 2. Fallback: visibilitychange (covers minimize, alt-tab, etc.)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isTabActive) {
      pauseAll();
    } else if (!document.hidden && !isTabActive) {
      resumeAll();
    }
  });
})();

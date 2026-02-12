(() => {
  const pausedVideos = new Set();
  let tabHidden = document.hidden;

  /**
   * Pause handler — attached to every video's "play" event while the tab is hidden.
   * This ensures YouTube's own JS can't restart the video behind our back.
   */
  function blockPlay(e) {
    const video = e.target;
    if (tabHidden) {
      video.pause();
    }
  }

  /**
   * Pause all currently playing videos and attach a guard listener
   * so they stay paused even if YouTube tries to restart them.
   */
  function pauseAllVideos() {
    const videos = document.querySelectorAll("video");
    videos.forEach(video => {
      if (!video.paused && !video.ended) {
        video.pause();
        pausedVideos.add(video);
      }
      // Attach guard: if YouTube tries to play while tab is hidden, re-pause
      video.addEventListener("play", blockPlay);
    });
  }

  /**
   * Resume only the videos we paused, and remove the guard listeners.
   */
  function resumePausedVideos() {
    const videos = document.querySelectorAll("video");
    // Remove guard listener from ALL videos
    videos.forEach(video => {
      video.removeEventListener("play", blockPlay);
    });
    // Resume only the ones WE paused
    pausedVideos.forEach(video => {
      video.play().catch(() => { });
    });
    pausedVideos.clear();
  }

  // --- Core visibility listener ---
  document.addEventListener("visibilitychange", () => {
    tabHidden = document.hidden;
    if (tabHidden) {
      pauseAllVideos();
    } else {
      resumePausedVideos();
    }
  });

  // --- MutationObserver: catch videos added dynamically (SPA navigation) ---
  const observer = new MutationObserver(mutations => {
    if (!tabHidden) return; // Only care about new videos if tab is hidden
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        // Check if the added node IS a video or CONTAINS a video
        const videos = node.tagName === "VIDEO"
          ? [node]
          : node.querySelectorAll?.("video") || [];
        for (const video of videos) {
          video.addEventListener("play", blockPlay);
          if (!video.paused) {
            video.pause();
            pausedVideos.add(video);
          }
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();

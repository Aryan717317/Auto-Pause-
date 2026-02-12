const pausedVideos = new Set();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Find all video elements on the page
    const videos = document.querySelectorAll("video");
    videos.forEach(video => {
      // If the video is playing, pause it and add to our set
      if (!video.paused && !video.ended && video.readyState > 2) {
        video.pause();
        pausedVideos.add(video);
        console.log("Video paused by Auto Pause Extension");
      }
    });
  } else {
    // Resume only the videos we paused
    pausedVideos.forEach(video => {
      video.play().catch(e => console.error("Could not resume video:", e));
      console.log("Video resumed by Auto Pause Extension");
    });
    // Clear the set after resuming
    pausedVideos.clear();
  }
});

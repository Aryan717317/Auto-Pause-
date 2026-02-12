let pausedByExtension = false;

document.addEventListener("visibilitychange", () => {
  const video = document.querySelector("video");
  if (!video) return;

  if (document.hidden) {
    if (!video.paused) {
      video.pause();
      pausedByExtension = true;
      console.log("Video paused by Auto Pause Extension");
    }
  } else {
    if (pausedByExtension) {
      video.play().catch(e => console.error("Could not resume video:", e));
      pausedByExtension = false;
      console.log("Video resumed by Auto Pause Extension");
    }
  }
});

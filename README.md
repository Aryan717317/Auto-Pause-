# 🎬 Auto Pause YouTube

A Chrome extension that **automatically pauses YouTube videos (including Shorts)** when you switch tabs and **resumes playback** when you come back.

---

## 🔴 The Problem

As a programmer watching YouTube tutorials or courses, every time you switch to your code editor tab, the video keeps playing in the background. You end up missing parts of the tutorial and have to manually pause/play every single time you switch tabs. It breaks your flow and wastes time.

## ✅ The Solution

**Auto Pause YouTube** handles this automatically:

- **Switch away** from the YouTube tab → Video **pauses instantly**
- **Switch back** to the YouTube tab → Video **resumes automatically**
- Works on **regular videos** and **YouTube Shorts**
- Also triggers when you **minimize the browser** or **alt-tab** to another window

No buttons. No popups. It just works.

---

## 🛠️ How It Works

The extension uses a three-part architecture:

| Component | Role |
|---|---|
| **`background.js`** | Service worker that detects tab switches using Chrome's `tabs` API |
| **`content.js`** | Runs on YouTube pages — pauses/resumes videos and blocks YouTube's auto-play |
| **`manifest.json`** | Extension configuration (Manifest V3) |

### The YouTube Shorts Challenge

YouTube Shorts has aggressive internal JavaScript that **continuously restarts videos** after they're paused. A simple `video.pause()` doesn't work because YouTube immediately calls `video.play()` again.

Our solution: while the tab is hidden, we **replace the `video.play()` method with a no-op function**. YouTube's code still runs, but calling `.play()` does nothing. When you switch back, the original method is restored and playback resumes.

---

## 📦 Installation

1. **Download** this repository (or clone it):
   ```bash
   git clone https://github.com/Aryan717317/Auto-Pause-.git
   ```

2. Open Chrome and go to `chrome://extensions`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked**

5. Select the `Auto-Pause-` folder

6. ✅ The extension is now active on YouTube!

---

## 📁 Project Structure

```
Auto-Pause-/
├── manifest.json    # Extension configuration
├── background.js    # Tab switch detection (service worker)
├── content.js       # Video pause/resume logic
└── README.md        # You are here
```

---

## 🧪 Testing

1. Open a YouTube video → switch tabs → video should pause
2. Switch back → video should resume
3. Open YouTube Shorts → switch tabs → short should pause
4. Switch back → short should resume
5. Manually pause a video → switch tabs → switch back → video should stay paused (we only resume videos *we* paused)

---

## 🤝 Contributing

Feel free to open issues or submit pull requests!

## 📄 License

MIT

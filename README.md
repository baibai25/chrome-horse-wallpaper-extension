# chrome-horse-wallpaper-extension

A Chrome/Edge extension that displays a random image every time you open a new tab.
This extension has been developed for personal use.

<img src="./docs/overview.png" alt="Preview" title="Preview">

## Overview

- The list of image URLs is managed on the options page and stored in `chrome.storage.local`.
- The options page provides a **link checker** that validates every URL and caches the image data in IndexedDB for instant display on new tabs.
  - Images that fail to load can be removed from the list in one click.
- On new tab, a random image is selected. If cached, it is displayed instantly from IndexedDB without a network request. Otherwise it falls back to loading from the original URL.
- The icon was created by DALL-E.

## Installation

1. Clone this repository
2. Open `edge://extensions` (Edge) or `chrome://extensions` (Chrome)
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `src/` folder
5. Open the extension's **Options** page
6. Paste your image URLs (one per line) and click **Save**
7. Click **Link Check** to validate and cache all images
8. Open a new tab to see a random image

## File structure

```
src/
├── manifest.json     # Extension manifest (MV3)
├── newtab.html       # New tab page
├── newtab.js         # Random image selection + cache-first loading
├── options.html      # Options page UI
├── options.js        # URL list editor, link checker, image caching
├── storage.js        # chrome.storage.local helpers
├── imageCache.js     # IndexedDB helpers for image blob cache
├── style.css         # New tab page styles
└── icons/
    └── tab.png       # Extension icon
docs/
├── overview.png      # README preview image
└── origin.png        # Original icon artwork
```

# chrome-horse-wallpaper-extension

A Chrome/Edge extension that displays a random horse image every time you open a new tab.
This extension has been developed for personal use.

<img src="./docs/overview.png" alt="Preview" title="Preview">

## Overview

- The list of image URLs is managed on the options page and stored in `chrome.storage.sync`, so it is automatically synced across devices signed in with the same browser account.
- Images themselves are never stored locally; the extension only references publicly available URLs and loads them on demand each time a new tab is opened.
- The options page also provides a link checker that probes every URL in the list and lets you remove any that fail to load.
- The icon was created by DALL-E.

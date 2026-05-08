const STORAGE_KEY = "imageList";

export async function loadUrlList() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] ?? [];
}

export async function saveUrlList(urls) {
  await chrome.storage.local.set({ [STORAGE_KEY]: urls });
}

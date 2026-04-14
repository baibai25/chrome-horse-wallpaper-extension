// chrome.storage.sync は 1 アイテムあたり 8,192 バイトの上限があるため、
// URL リストを複数のチャンクに分割して保存する。
// - imageListMeta: { chunkCount }
// - imageList_0, imageList_1, ...: URL 配列 (各チャンク)

const CHUNK_KEY_PREFIX = "imageList_";
const META_KEY = "imageListMeta";
const MAX_BYTES_PER_CHUNK = 7500; // 8,192 に対して余裕を持たせる

export async function loadUrlList() {
  const meta = await chrome.storage.sync.get(META_KEY);
  const chunkCount = meta[META_KEY]?.chunkCount ?? 0;
  if (chunkCount === 0) {
    return [];
  }
  const keys = Array.from(
    { length: chunkCount },
    (_, i) => `${CHUNK_KEY_PREFIX}${i}`
  );
  const data = await chrome.storage.sync.get(keys);
  return keys.flatMap((k) => data[k] ?? []);
}

export async function saveUrlList(urls) {
  const chunks = chunkUrls(urls);

  // 既存のチャンクをすべて削除してから書き込む (URL 数が減った場合に備える)
  const all = await chrome.storage.sync.get(null);
  const oldKeys = Object.keys(all).filter(
    (k) => k.startsWith(CHUNK_KEY_PREFIX) || k === META_KEY
  );
  if (oldKeys.length > 0) {
    await chrome.storage.sync.remove(oldKeys);
  }

  const payload = { [META_KEY]: { chunkCount: chunks.length } };
  chunks.forEach((chunk, i) => {
    payload[`${CHUNK_KEY_PREFIX}${i}`] = chunk;
  });
  await chrome.storage.sync.set(payload);
}

function chunkUrls(urls) {
  const chunks = [];
  let current = [];
  let currentSize = 2; // "[]"
  for (const url of urls) {
    const urlSize = JSON.stringify(url).length + 1; // +1 はカンマ分
    if (currentSize + urlSize > MAX_BYTES_PER_CHUNK && current.length > 0) {
      chunks.push(current);
      current = [];
      currentSize = 2;
    }
    current.push(url);
    currentSize += urlSize;
  }
  if (current.length > 0) {
    chunks.push(current);
  }
  return chunks;
}

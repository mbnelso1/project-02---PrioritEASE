// src/services/AnalyticsService.js

// ✅ Your JSONBin ID (safe to commit if the bin is public-read)
export const BIN_ID = "68ffbc9243b1c97be9854ba3";

// Optional: if your bin requires a key, set it once per browser via DevTools:
// localStorage.setItem('prioritease.jsonbin.key','<X-Master-Key>');
function getKey() {
  return localStorage.getItem('prioritease.jsonbin.key') || "";
}

function jsonHeaders(includeKey = true) {
  const KEY = includeKey ? getKey() : "";
  return {
    "Content-Type": "application/json",
    ...(KEY ? { "X-Master-Key": KEY } : {})
  };
}

/**
 * PUT (update) the snapshot into your existing bin.
 * Endpoint: https://api.jsonbin.io/v3/b/{BIN_ID}
 */
export async function putSnapshot(payload, { retries = 2 } = {}) {
  if (!BIN_ID) throw new Error("BIN_ID is not set in AnalyticsService.js");
  const url = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: jsonHeaders(true), // include key header if present
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`PUT ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      // backoff
      await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastErr || new Error("put failed");
}

/**
 * GET the latest record from your bin.
 * Endpoint: https://api.jsonbin.io/v3/bins/{BIN_ID}/latest
 * (If your bin is private-read, we also include the key when available.)
 */
export async function fetchLatestSnapshot() {
  if (!BIN_ID) throw new Error("BIN_ID is not set in AnalyticsService.js");
  const url = `https://api.jsonbin.io/v3/bins/${BIN_ID}/latest`;

  const res = await fetch(url, { headers: jsonHeaders(true) });
  if (!res.ok) throw new Error(`GET ${res.status}`);
  return res.json();
}


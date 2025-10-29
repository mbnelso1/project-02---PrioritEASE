// src/services/AnalyticsService.js

// ✅ Your JSONBin ID
export const BIN_ID = "68ffbc9243b1c97be9854ba3";

// Optional: set once in this browser if your bin needs a key:
// localStorage.setItem('prioritease.jsonbin.key','<X-Master-Key>');
function getKey() {
  return localStorage.getItem('prioritease.jsonbin.key') || "";
}

function jsonHeaders() {
  const KEY = getKey();
  return {
    "Content-Type": "application/json",
    ...(KEY ? { "X-Master-Key": KEY } : {})
  };
}

/** PUT update to your bin: https://api.jsonbin.io/v3/b/{BIN_ID} */
export async function putSnapshot(payload, { retries = 2 } = {}) {
  if (!BIN_ID) throw new Error("BIN_ID is not set in AnalyticsService.js");
  const url = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`PUT ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastErr || new Error("put failed");
}

// GET latest from your bin. Tries /b/{id}/latest first, then /bins/{id}/latest.
export async function fetchLatestSnapshot() {
  if (!BIN_ID) throw new Error("BIN_ID is not set in AnalyticsService.js");

  const headers = {
    "Content-Type": "application/json",
    ...(localStorage.getItem('prioritease.jsonbin.key')
        ? { "X-Master-Key": localStorage.getItem('prioritease.jsonbin.key') }
        : {})
  };

  // 1) Preferred v3 route
  let res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, { headers });
  if (res.ok) return res.json();

  // 2) Fallback (some docs/UI still show this)
  res = await fetch(`https://api.jsonbin.io/v3/bins/${BIN_ID}/latest`, { headers });
  if (res.ok) return res.json();

  throw new Error(`GET ${res.status}`);
}




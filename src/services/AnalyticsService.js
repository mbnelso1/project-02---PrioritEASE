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

/** GET latest from your bin: https://api.jsonbin.io/v3/b/{BIN_ID}/latest */
export async function fetchLatestSnapshot() {
  if (!BIN_ID) throw new Error("BIN_ID is not set in AnalyticsService.js");
  const url = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

  const res = await fetch(url, { headers: jsonHeaders() });
  if (!res.ok) throw new Error(`GET ${res.status}`);
  return res.json();
}



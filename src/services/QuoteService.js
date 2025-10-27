// Reads a random quote from a public-read JSONBin and caches with TTL.
// Falls back to two public providers if JSONBin is briefly unavailable.

import { ttlCache } from '../utils/ttlCache.js';

const KEY = 'prioritease.quote.v1';

const QUOTES_BIN_ID = '68faa641ae596e708f275445';
const QUOTES_URL = `https://api.jsonbin.io/v3/b/68faa641ae596e708f275445`;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function withTimeout(promise, { ms = 6000, signal } = {}) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
    const onAbort = () => { clearTimeout(id); reject(new DOMException('Aborted', 'AbortError')); };
    if (signal) signal.addEventListener('abort', onAbort, { once: true });
    promise.then(v => { clearTimeout(id); resolve(v); })
           .catch(e => { clearTimeout(id); reject(e); });
  });
}


async function fromJsonBin({ signal }) {
  const res = await withTimeout(fetch(QUOTES_URL, { signal }), { ms: 6000, signal });
  if (!res.ok) throw new Error(`jsonbin ${res.status}`);
  const j = await res.json();        
  const list = j?.record?.quotes;
  if (!Array.isArray(list) || list.length === 0) throw new Error('jsonbin empty');
  return pickRandom(list);
}


async function fromDummyJson({ signal }) {
  const r = await withTimeout(fetch('https://dummyjson.com/quotes/random', { signal }), { ms: 6000, signal });
  if (!r.ok) throw new Error(`dummyjson ${r.status}`);
  const j = await r.json();
  return { content: j.quote, author: j.author ?? '—' };
}
async function fromAdviceSlip({ signal }) {
  const r = await withTimeout(fetch('https://api.adviceslip.com/advice', { signal }), { ms: 6000, signal });
  if (!r.ok) throw new Error(`adviceslip ${r.status}`);
  const j = await r.json();
  return { content: j.slip?.advice ?? 'Keep going.', author: 'Advice Slip' };
}

/**
 * Fetch a quote with TTL cache; uses JSONBin first, then public fallbacks.
 * @param {object} opts
 * @param {number} opts.ttlHours cache TTL; 0 bypasses cache
 * @param {AbortSignal} opts.signal AbortController signal
 */
export async function fetchQuote({ ttlHours = 12, signal } = {}) {
  const now = Date.now();

  if (ttlHours > 0) {
    const cached = ttlCache.get(KEY);
    if (cached && (now - cached.fetchedAt) < ttlHours * 3600 * 1000) return cached.data;
  }

  const providers = [fromJsonBin, fromDummyJson, fromAdviceSlip];
  let lastErr;
  for (const p of providers) {
    try {
      const data = await p({ signal });
      ttlCache.set(KEY, { data, fetchedAt: now });
      return data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('all providers failed');
}

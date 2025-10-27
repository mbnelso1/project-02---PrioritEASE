// src/utils/ttlCache.js
// Tiny helper for saving and restoring structured cache data to localStorage.

export const ttlCache = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const KEY = 'prioritease.state.v1';
export const StorageAdapter = {
  load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {version:1, tasks:[], order:[], settings:{} }; } catch { return {version:1,tasks:[],order:[],settings:{}}; } },
  save(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
};

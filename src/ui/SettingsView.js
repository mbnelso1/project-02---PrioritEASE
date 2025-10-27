import { appState } from '../state/AppStateModel.js';
import { putSnapshot } from '../services/AnalyticsService.js';

function uuid(){ return crypto.randomUUID?.() || Math.random().toString(16).slice(2); }

export class SettingsView {
  constructor() {
    this.el = document.createElement('div');
    this.el.innerHTML = `
      <h2>Settings</h2>
      <div style="display:grid;gap:.5rem;max-width:520px;">
        <label>JSONBin BIN_ID
          <input id="bin" placeholder="e.g. 66abc123..." />
        </label>
        <label>JSONBin X-Master-Key (stored only in this browser)
          <input id="key" placeholder="Paste your secret key" />
        </label>
        <label>App Version
          <input id="ver" value="1.0.0" />
        </label>
        <div style="display:flex;gap:.5rem;align-items:center;">
          <button id="saveCfg">Save JSONBin config</button>
          <button id="publish">Publish Snapshot</button>
          <button id="import">Fetch Latest Snapshot</button>
          <span id="status" class="muted"></span>
        </div>
      </div>
    `;
  }

  _toast(msg){
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position:'fixed', bottom:'12px', left:'50%', transform:'translateX(-50%)',
      background:'#333', color:'#fff', padding:'8px 12px', borderRadius:'8px',
      opacity:'0.95', zIndex: 9999
    });
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 1400);
  }

  mount() {
    const bin = this.el.querySelector('#bin');
    const key = this.el.querySelector('#key');
    const ver = this.el.querySelector('#ver');
    const status = this.el.querySelector('#status');
    const btnPub = this.el.querySelector('#publish');

    bin.value = localStorage.getItem('prioritease.jsonbin.id') || '';
    key.value = localStorage.getItem('prioritease.jsonbin.key') || '';

    this.el.querySelector('#saveCfg').onclick = () => {
      localStorage.setItem('prioritease.jsonbin.id', bin.value.trim());
      localStorage.setItem('prioritease.jsonbin.key', key.value.trim());
      this._toast('Saved');
    };

    this.el.querySelector('#publish').onclick = async () => {
      if (!bin.value.trim()) { alert('Set BIN_ID first.'); return; }

      const now = new Date().toISOString();
      const items = (appState.state.order?.length ? appState.state.order : appState.state.tasks.map(t=>t.id))
        .map((id, idx) => {
          const t = appState.state.tasks.find(x => x.id === id) || { id, title:'(missing)', done:false, updated_at: Date.now() };
          return {
            id: t.id, title: t.title, rank: idx + 1,
            done: !!t.done,
            updated_at: new Date(t.updated_at || Date.now()).toISOString()
          };
        });

      const payload = {
        type: "ranking_snapshot",
        app_version: ver.value || "1.0.0",
        snapshot_id: uuid(),
        created_at: now,
        updated_at: now,
        items,
        meta: {
          task_count: items.length,
          engine: "pairwise-merge-sort",
          client: navigator.userAgent,
          locale: navigator.language
        }
      };

      btnPub.disabled = true; const oldLabel = btnPub.textContent; btnPub.textContent = 'Publishing…'; status.textContent = '';
      try {
        await putSnapshot(payload);
        status.textContent = 'Saved';
        this._toast('Snapshot published');
      } catch (e) {
        console.error(e);
        status.textContent = 'Failed';
        alert('Publish failed. Check BIN_ID and key, then try again.');
      } finally {
        btnPub.disabled = false; btnPub.textContent = oldLabel;
      }
    };

    this.el.querySelector('#import').onclick = async () => {
      const id = bin.value.trim() || localStorage.getItem('prioritease.jsonbin.id');
      if (!id) return alert('Set BIN_ID first.');
      try {
        const res = await fetch(`https://api.jsonbin.io/v3/bins/${id}/latest`);
        if (!res.ok) throw new Error(`GET ${res.status}`);
        const data = await res.json();
        const items = data?.record?.items || [];
        if (!items.length) return alert('No items found in latest snapshot.');
        const order = items.slice().sort((a,b)=>a.rank-b.rank).map(i=>i.id);
        if (confirm(`Apply order from snapshot? (${items.length} items)`)) {
          appState.setOrder(order);
          this._toast('Order imported');
          location.hash = '#/home';
        }
      } catch (e) {
        console.error(e);
        alert('Import failed.');
      }
    };
  }

  dispose() {}
}

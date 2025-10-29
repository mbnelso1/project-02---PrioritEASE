
import { appState } from '../state/AppStateModel.js';
import { putSnapshot, fetchLatestSnapshot } from '../services/AnalyticsService.js';

function uuid(){ return crypto.randomUUID?.() || Math.random().toString(16).slice(2); }

export class SettingsView {
  constructor() {
    this.el = document.createElement('div');
    this.el.innerHTML = `
      <h2>Settings</h2>
      <div style="display:grid;gap:.5rem;max-width:520px;">
        <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;">
          <button id="publish">Publish Snapshot</button>
          <button id="import">Fetch Latest Snapshot</button>
          <span id="status" class="muted"></span>
        </div>
        <p class="muted" style="font-size:.9rem;line-height:1.4;margin-top:.5rem;">
          Bin ID is hardcoded in <code>src/services/AnalyticsService.js</code>.<br/>
          If your bin requires a key, set it once in this browser console:<br/>
          <code>localStorage.setItem('prioritease.jsonbin.key','&lt;X-Master-Key&gt;')</code>
        </p>
      </div>
    `;
  }

  _toast(msg){
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position:'fixed', bottom:'12px', left:'50%', transform:'translateX(-50%)',
      background:'#333', color:'#fff', padding:'8px 12px', borderRadius:'8px',
      opacity:'0.95', zIndex: 9999, fontSize:'14px'
    });
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 1400);
  }

  mount() {
    const ver = this.el.querySelector('#ver');
    const status = this.el.querySelector('#status');
    const btnPub = this.el.querySelector('#publish');

    this.el.querySelector('#publish').onclick = async () => {
      const now = new Date().toISOString();
      const orderOrIds = (appState.state.order?.length
        ? appState.state.order
        : appState.state.tasks.map(t => t.id));

      const items = orderOrIds.map((id, idx) => {
        const t = appState.state.tasks.find(x => x.id === id)
              || { id, title: '(missing)', done: false, updated_at: Date.now() };
        return {
          id: t.id,
          title: t.title,
          rank: idx + 1,
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

      btnPub.disabled = true; const old = btnPub.textContent;
      btnPub.textContent = 'Publishing…'; status.textContent = '';
      try {
        await putSnapshot(payload);
        status.textContent = 'Saved';
        this._toast('Snapshot published');
      } catch (e) {
        console.error(e);
        status.textContent = 'Failed';
        alert('Publish failed. Confirm BIN_ID in AnalyticsService.js and set X-Master-Key in localStorage if required.');
      } finally {
        btnPub.disabled = false; btnPub.textContent = old;
      }
    };

    this.el.querySelector('#import').onclick = async () => {
      try {
        const data = await fetchLatestSnapshot();
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
        alert('Import failed. Confirm BIN_ID in AnalyticsService.js (and key if private-read).');
      }
    };
  }

  dispose() {}
}


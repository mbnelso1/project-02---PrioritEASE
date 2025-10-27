import { appState } from '../state/AppStateModel.js';
import { PairwiseRanker } from '../engine/PairwiseRanker.js';

export class CompareView {
  constructor() {
    this.el = document.createElement('div');
    this.el.innerHTML = `
      <h2>Compare</h2>
      <div id="body"></div>
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

  mount(){
    const active = appState.state.tasks.filter(t => !t.done);
    const body = this.el.querySelector('#body');

    if (active.length < 2) {
      body.innerHTML = `<p>Add at least two active tasks to compare.</p>`;
      return;
    }

    this.ranker = new PairwiseRanker(active, appState.state.order || []);

    const step = () => {
      const n = this.ranker.nextPair();
      if (n.done) {
        appState.setOrder(n.order);
        this._toast('Priorities updated');
        location.hash = '#/home';
        return;
      }
      const { left, right, progress } = n;
      body.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;align-items:center;">
          <button id="left" style="padding:1rem;border:1px solid #ccc;border-radius:.5rem;text-align:left;">
            <strong>Higher priority</strong><br/>${left.title}
          </button>
          <div>vs</div>
          <button id="right" style="padding:1rem;border:1px solid #ccc;border-radius:.5rem;text-align:left;">
            <strong>Higher priority</strong><br/>${right.title}
          </button>
        </div>
        <div style="margin-top:.75rem;font-size:.9rem;">Progress: ${progress.inserted}/${progress.total} inserted • ${progress.comparisons} comparisons</div>
        <p class="muted" style="margin-top:.25rem;">Tip: use ← and → keys. Esc to exit.</p>
      `;
      body.querySelector('#left').onclick  = () => { this.ranker.applyChoice('left'); step(); };
      body.querySelector('#right').onclick = () => { this.ranker.applyChoice('right'); step(); };
    };

    this._key = (e) => {
      if (e.key === 'ArrowLeft') { this.ranker.applyChoice('left'); step(); }
      else if (e.key === 'ArrowRight') { this.ranker.applyChoice('right'); step(); }
      else if (e.key === 'Escape') { location.hash = '#/home'; }
    };
    window.addEventListener('keydown', this._key);

    step();
  }

  dispose(){
    window.removeEventListener('keydown', this._key);
  }
}

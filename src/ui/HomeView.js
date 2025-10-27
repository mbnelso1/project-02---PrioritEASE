// src/ui/HomeView.js
import { appState } from '../state/AppStateModel.js';
import { fetchQuote } from '../services/QuoteService.js';

export class HomeView {
  constructor() {
    this.el = document.createElement('div');
    this.el.innerHTML = `
      <h2>Home</h2>
      <div id="quote" class="muted" style="margin-bottom: 1rem;"></div>

      <div style="margin-bottom:.5rem;">
        <input id="task" placeholder="New task" />
        <button id="add">Add</button>
      </div>

      <div style="margin:.25rem 0;">
        <button id="clearDone">Clear completed</button>
        <a id="rankNow" href="#/compare" style="margin-left:.5rem; text-decoration:underline;">Rank now</a>
      </div>

      <div id="list"></div>
    `;
  }

  mount() {
    this.unsub = appState.onChange(() => this.render());

    this.el.querySelector('#add').onclick = () => {
      const inp = this.el.querySelector('#task');
      const v = inp.value.trim();
      if (!v) return;
      appState.addTask(v);
      inp.value = '';
    };
    this.el.querySelector('#task').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.el.querySelector('#add').click();
    });

    this.el.querySelector('#clearDone').onclick = () => appState.clearCompleted();

    this.render();
    this.refreshQuoteNow();
  }

  render() {
    const list = this.el.querySelector('#list');
    list.innerHTML = '';

    const tasks = appState.state.tasks.slice();
    const order = appState.state.order || [];
    const orderIndex = new Map(order.map((id, i) => [id, i]));
    tasks.sort((a,b) => {
      const ai = orderIndex.has(a.id) ? orderIndex.get(a.id) : Number.POSITIVE_INFINITY;
      const bi = orderIndex.has(b.id) ? orderIndex.get(b.id) : Number.POSITIVE_INFINITY;
      return ai - bi;
    });

    for (const t of tasks) {
      const row = document.createElement('div');
      row.style.margin = '.25rem 0';
      row.innerHTML = `
        <label>
          <input type="checkbox" ${t.done ? 'checked' : ''}/> ${t.title}
        </label>
        <button data-del style="margin-left:.5rem;">×</button>
      `;
      row.querySelector('input').onchange = () => appState.toggle(t.id);
      row.querySelector('[data-del]').onclick = () => appState.removeTask(t.id);
      list.appendChild(row);
    }

    // Rank now CTA state: enable only if ≥2 active tasks
    const activeCount = tasks.filter(t => !t.done).length;
    const link = this.el.querySelector('#rankNow');
    if (activeCount >= 2) {
      link.style.pointerEvents = 'auto';
      link.style.opacity = '1';
      link.title = 'Open pairwise ranking';
    } else {
      link.style.pointerEvents = 'none';
      link.style.opacity = '.5';
      link.title = 'Add at least two active tasks to rank';
    }
  }

  async refreshQuoteNow() {
    const box = this.el.querySelector('#quote');
    box.textContent = '…';
    try {
      const controller = new AbortController();
      this.abort?.abort();
      this.abort = controller;

      const q = await fetchQuote({ signal: controller.signal });
      // Accept multiple field shapes from the service
      const text   = q?.text ?? q?.content ?? q?.quote ?? '(no text)';
      const author = q?.author || 'Unknown';

      box.textContent = `“${text}” — ${author}`;
      box.style.cursor = 'pointer';
      box.onclick = () => this.refreshQuoteNow();
    } catch {
      box.textContent = 'Refresh failed. Retry';
      box.style.cursor = 'pointer';
      box.onclick = () => this.refreshQuoteNow();
    }
  }

  dispose() {
    this.unsub?.();
    this.abort?.abort();
  }
}

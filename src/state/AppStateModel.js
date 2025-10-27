import { StorageAdapter } from './StorageAdapter.js';

class Emitter{
  constructor(){ this.l = new Set(); }
  on(fn){ this.l.add(fn); return ()=>this.l.delete(fn); }
  emit(){ for(const fn of this.l) fn(); }
}

export class AppStateModel {
  constructor(){
    this.emitter = new Emitter();
    this.state = StorageAdapter.load(); // { tasks:[], order:[] }
  }

  onChange(cb){ return this.emitter.on(cb); }

  addTask(title){
    const t = {
      id: crypto.randomUUID?.() || String(Math.random()),
      title,
      done: false,
      updated_at: Date.now()
    };
    this.state.tasks.push(t);
    this.save();
  }

  toggle(id){
    const t = this.state.tasks.find(x => x.id === id);
    if (!t) return;
    t.done = !t.done;
    t.updated_at = Date.now();
    this.save();
  }

  // keep order in sync with existing tasks
  setOrder(orderIds){
    const ids = new Set(this.state.tasks.map(t => t.id));
    this.state.order = (orderIds || []).filter(id => ids.has(id));
    this.save();
  }

  // delete one task + clean order
  removeTask(id){
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.state.order = (this.state.order || []).filter(x => x !== id);
    this.save();
  }

  // remove all completed + clean order
  clearCompleted(){
    const doneIds = new Set(this.state.tasks.filter(t => t.done).map(t => t.id));
    this.state.tasks = this.state.tasks.filter(t => !doneIds.has(t.id));
    this.state.order = (this.state.order || []).filter(id => !doneIds.has(id));
    this.save();
  }

  save(){
    StorageAdapter.save(this.state);
    this.emitter.emit();
  }
}

export const appState = new AppStateModel();

export class PairwiseRanker {
  constructor(tasks, existingOrderIds = []) {
    this.tasks = tasks.filter(t => !t.done);
    this.idToTask = new Map(this.tasks.map(t => [t.id, t]));
    const existing = existingOrderIds.filter(id => this.idToTask.has(id));
    const newcomers = this.tasks.map(t => t.id).filter(id => !existing.includes(id));
    this.order = [...existing];
    this.queue = [...newcomers];
    this._resetInsertion();
    this.comparisons = 0;
    this.totalInsertions = this.queue.length + (this.order.length ? 0 : (this.tasks.length ? 1 : 0));
  }

  _resetInsertion(){
    this.candidate = this.queue.shift() ?? null;
    this.lo = 0;
    this.hi = this.order.length - 1;
    this.probeIdx = this._nextProbeIndex();
  }

  _nextProbeIndex(){
    if (this.candidate == null) return -1;
    if (this.order.length === 0) return -1;
    if (this.lo > this.hi) return -1;
    return Math.floor((this.lo + this.hi) / 2);
  }

  nextPair(){
    if (!this.candidate) {
      if (this.order.length === 0 && this.tasks.length > 0) {
        this.order = [this.tasks[0].id];
        return { done: true, order: this.order.slice() };
      }
      if (this.queue.length === 0) return { done: true, order: this.order.slice() };
    }

    if (this.order.length === 0 && this.candidate) {
      this.order.push(this.candidate);
      this._resetInsertion();
      return this.nextPair();
    }

    if (this.probeIdx === -1) {
      const insertAt = Math.max(0, this.lo);
      this.order.splice(insertAt, 0, this.candidate);
      this._resetInsertion();
      return this.nextPair();
    }

    const left  = this.idToTask.get(this.candidate);
    const right = this.idToTask.get(this.order[this.probeIdx]);
    return { left, right, done: false, progress: this.progress() };
  }

  applyChoice(choice){
    if (!this.candidate || this.probeIdx === -1) return;
    this.comparisons++;
    if (choice === 'left') this.hi = this.probeIdx - 1;
    else this.lo = this.probeIdx + 1;
    this.probeIdx = this._nextProbeIndex();
  }

  getOrder(){ return this.order.slice(); }

  progress(){
    const inserted = this.order.length;
    const total = this.tasks.length;
    return { inserted, total, comparisons: this.comparisons, pct: total ? Math.round((inserted/total)*100) : 100 };
  }
}

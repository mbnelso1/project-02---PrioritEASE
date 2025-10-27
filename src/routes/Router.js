import { HomeView } from '../ui/HomeView.js';
import { CompareView } from '../ui/CompareView.js';
import { SettingsView } from '../ui/SettingsView.js';

export class Router {
  constructor(mount) { this.mount = mount; this.view = null; }
  start() { window.addEventListener('hashchange', () => this.render()); this.render(); }
  render() {
    const route = (location.hash || '#/home').split('?')[0];
    this.mount.innerHTML = '';
    this.view?.dispose?.();
    if (route === '#/compare') this.view = new CompareView();
    else if (route === '#/settings') this.view = new SettingsView();
    else this.view = new HomeView();
    this.mount.appendChild(this.view.el);
    this.view.mount?.();
  }
}

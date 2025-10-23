# Architecture Sketch – PrioritEASE

PrioritEASE is a single-page, local-first web app that helps users rank tasks by **pairwise comparisons** (“Which is higher priority: A or B?”). All task data is stored locally; a tiny cloud call is used only for non-sensitive REST demos (e.g., anonymous analytics or a public GET).

---

## ASCII Diagram 
<img width="286" height="261" alt="Screenshot 2025-10-23 at 2 28 47 PM" src="https://github.com/user-attachments/assets/8bbe997e-8760-4431-931a-9e2d7cfdac9f" />

 
**Legend**
- **User → UI → Controller → State** is the primary flow.
- **Router** swaps views inside the SPA (no page reload).
- **LocalStorage/IndexedDB** keeps everything local-first.
- **CloudService** sends only non-sensitive aggregates or reads a public JSON to satisfy networking requirements.

---

## View Composition / Routing

- **Views:**  
  - `Home` (task list, add/check/delete, see today’s order)  
  - `Compare` (pairwise prompt + progress)  
  - `Settings` (export/import JSON, theme, about)
- **Router:** hash-based SPA (`#/home`, `#/compare`, `#/settings`) with a tiny view manager:
  - Initializes on load, listens to `hashchange`, mounts/unmounts the active view.

---

## Top-Level Module Map 

- `state/` — App data model (tasks, daily order, settings, schema `version`) plus migration helpers.
- `services/` — All network/REST calls (public **GET** for small data; JSONBin or similar **PUT/POST** for anonymous aggregates).
- `ui/` — View components and DOM rendering (Home, Compare, Settings; small components like TaskItem/Modal).
- `engine/` — Priority logic (interactive pairwise **merge-sort**; session state and utilities).
- `routes/` — SPA router and view switching (hash parsing, mount lifecycle).
- `utils/` — Shared helpers (uuid/date, EventBus, validation, debounce, logger).

---

## Core Classes 

- **AppStateModel** (`state/`)  
  Holds the canonical state: `tasks[]`, `order[]`, `settings`, `version`.  
  Emits change events; performs validation and migrations.

- **Controller** (`ui/` + `routes/`)  
  Orchestrates user actions (add/check/compare), invokes **PairwiseRanker**, updates **AppStateModel**, triggers renders and navigation.

- **View / Renderer** (`ui/`)  
  `HomeView`, `CompareView`, `SettingsView` render UI, bind events, and subscribe to state changes.

- **PairwiseRanker** (`engine/`)  
  Runs an interactive merge-sort: manages left/right buckets, asks A-vs-B, produces a stable `order[]`. Supports pause/resume.

- **StorageAdapter** (`state/`)  
  Abstracts persistence (LocalStorage now; can swap to IndexedDB later). Handles `save/load`, autosave on meaningful changes.

- **AnalyticsService** (`services/`)  
  Optional cloud writes of anonymous counters (e.g., `comparisons`, `completed_tasks`). Also hosts simple public **GET** (e.g., quote/templates).

---

## Module → Classes/Components Map (for clarity)

| Module     | Key classes/components |
|------------|------------------------|
| `state/`   | `AppStateModel`, `Task`, `Settings`, `StorageAdapter` |
| `services/`| `AnalyticsService`, `Quote/TemplatesService`, `HttpClient` (tiny fetch wrapper) |
| `ui/`      | `View` (base), `HomeView`, `CompareView`, `SettingsView`, `TaskItem`, `Toast/Modal` |
| `engine/`  | `PairwiseRanker`, `MergeSession`, `OrderCalculator` |
| `routes/`  | `Router`, `Route` constants, `NavigationController` |
| `utils/`   | `Id` (uuid), `EventBus`, `Schema` (validation/migration), `Logger`, `Time` |




# Sprint 1 – Setup & Planning (Roadmap Only)

**Goal:** define the work for Sprints 2–3 and make the repo runnable.

## Deliverables (concise)
- **Repo boots** (`index.html`, `assets/`, `src/`; run via `npm start` or `npx http-server`).
- **MVP chosen** (the vertical slice for Sprint 2) and **Full list** (Sprint 3 enhancements).
- **Roadmap** (`/docs/roadmap.md`): MVP list + Full list + Top 3 risks.
- **Project board** created with **8–12 Sprint-2 issues** (titles + brief AC + S/M + assignee) and columns: *Backlog • Sprint 2 • Sprint 3 • Done*. Link the board in README.

---

# MVP (Sprint 2) – Core Goals 1-8

**Goal 1-2:** Core app setup; implement `index.html`, connect JS modules, and ensure the UI renders tasks.  
**Goal 3:** Add the ability to **create, delete, and persist tasks** in `localStorage`.  
**Goal 4:** Implement **pairwise comparison logic** (A vs B) using the `PairwiseRanker` class.  
**Goal 5:** Create the **Compare View** that displays two tasks side-by-side with buttons for user selection.  
**Goal 6:** Build the **Task List View** showing prioritized tasks, checkboxes for completion, and a “clear completed” option.  
**Goal 7:** Add **persistence layer** (`StorageAdapter`) to save and restore app state between sessions.  
**Goal 8:** Integrate a small **public GET** (e.g., random quote from `https://api.quotable.io/random`) to demonstrate REST read.

---

# Full Version (Sprint 3) – Enhancements 1-8

- **JSONBin Integration:** Publish ranking snapshots via PUT and display confirmation (“Saved” status).  
- **Settings View:** Allow exporting/importing JSON backups manually.  
- **Analytics Counter:** Track and upload anonymous comparison counts.  
- **Visual Feedback:** Add transition animations between Compare prompts.  
- **Empty/Loading/Error States:** Improve UX for network calls and app startup.  
- **Dark Mode Toggle:** Persist user preference in local settings.  
- **UI Polish:** Responsive layout and accessibility pass (ARIA labels).  
- **Autosave Indicator:** Show subtle “Saved” tooltip when tasks sync locally or to cloud.

---

# Risks & Mitigations

- **LocalStorage Limits:** implement IndexedDB fallback if payload > 5 MB.  
- **Sync Conflicts:** mitigate with “last-write-wins” merge policy (based on `updated_at`).  
- **API Errors:** catch fetch failures; display retry button and backup load from local state.  
- **User Data Loss:** provide manual export/import flow before any clear actions.  


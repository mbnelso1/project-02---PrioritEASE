# Architecture Sketch – PrioritEASE

project/
├─ index.html                 # loads Router.js (ES modules) → bootstraps app; minimal styles; favicon link
├─ docs/                      # docs & proof
│  ├─ required docs           # All docs required for planning and dod checklist
│  └─ media/mvp.gif           # 30–60s proof: boot → GET → compare → PUT/GET
└─ src/
   ├─ routes/
   │  └─ Router.js            # hash router; mounts/unmounts Views; routes: #/home, #/compare, #/settings
   ├─ ui/                     # user interface (dumb views; no global state inside)
   │  ├─ HomeView.js          # add/clear tasks; renders ordered list; quote line; CTA “Rank now”
   │  ├─ CompareView.js       # pairwise ranking UI; ←/→ keyboard shortcuts; updates order in model
   │  └─ SettingsView.js      # Publish Snapshot (PUT); Fetch Latest (GET); status toasts
   ├─ state/
   │  ├─ AppStateModel.js     # class AppStateModel: tasks[], order[]; onChange() pub/sub; add/toggle/remove/clear/setOrder
   │  └─ StorageAdapter.js    # localStorage read/write; schema versioning; safe JSON parse
   ├─ services/
   │  ├─ QuoteService.js      # fetch random quote (GET); tolerant of {text|content}; uses ttl cache
   │  └─ AnalyticsService.js  # JSONBin integration: BIN_ID hardcoded; PUT /v3/b/{id}; GET /v3/b/{id}/latest
   ├─ engine/
   │  └─ PairwiseRanker.js    # merge-sort style pairwise comparator; emits next pair; produces final order
   └─ utils/
      └─ ttlCache.js          # tiny TTL memo for fetches; prevents refetching quotes too often


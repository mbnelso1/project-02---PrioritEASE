# JSONBin Schema & Merge Policy

## Schema
- **Document shape:**
  
      {
        "type": "ranking_snapshot",
        "app_version": "1.x",
        "snapshot_id": "uuid",
        "created_at": "2025-10-23T00:00:00Z",
        "updated_at": "2025-10-23T00:00:00Z",
        "items": [
          {
            "id": "uuid",
            "title": "Task title",
            "rank": 1,
            "done": false,
            "updated_at": "2025-10-23T00:00:00Z"
          }
        ],
        "meta": {
          "task_count": 10,
          "engine": "pairwise-merge-sort"
        }
      }

- **Key fields:**
  - `type` — fixed string `"ranking_snapshot"`
  - `app_version` — app release version when snapshot was made
  - `snapshot_id` — UUID for each published snapshot
  - `created_at` / `updated_at` — ISO 8601 timestamps
  - `items` — list of tasks with unique IDs, titles, rank, completion, and update time
  - `meta.task_count` — number of tasks in snapshot
  - `meta.engine` — algorithm used for ranking

---

## Examples

- **Create once:**  
  POST `https://api.jsonbin.io/v3/b` → returns `{ "id": "<BIN_ID>" }`

- **Write snapshot:**  
  PUT `https://api.jsonbin.io/v3/bins/{BIN_ID}`  
  **Headers:**  
    - `Content-Type: application/json`  
    - `X-Master-Key: <your_api_key>`

- **Read latest snapshot:**  
  GET `https://api.jsonbin.io/v3/bins/{BIN_ID}/latest`  
  *(Public access — no API key required.)*

- **Behavior in app:**  
  - On **publish:** build from local state, apply merge policy, PUT, and show “Saved”.  
  - On **read:** show loading → success → error/retry UI states.

---

## Merge Policy

- **Client-side reconciliation:**  
  - **Last-write-wins** based on `updated_at` timestamps  
  - De-duplicate tasks by `id`  
  - Normalize ranks sequentially (`1..N`)  
  - Prefer the snapshot with the newest top-level `updated_at`

- **On publish:**  
  - Build payload from current local state  
  - Apply merge rules  
  - PUT to JSONBin endpoint

- **On read:**  
  - Fetch latest snapshot  
  - Compare timestamps; ignore stale or malformed entries  
  - Display “Saved” or “Up to date” when successful

---

**Summary:**  
PrioritEASE maintains all user data locally but publishes **anonymous ranking snapshots** to JSONBin for REST API demonstration.  
Writes use `Content-Type: application/json` and `X-Master-Key`; reads are public via `/latest`.  
All merges follow **last-write-wins** logic with rank normalization and timestamp reconciliation.

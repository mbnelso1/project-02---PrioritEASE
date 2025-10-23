# Pitch
**Track:** Productivity

**Product:** A lightweight to-do app that exists to cut through overwhelming lists and fussy systems by using quick pairwise comparisons (“Which is higher priority: A or B?”) to rank tasks so I can focus on what matters and check them off.

**Problem & User:** This app simplifies daily task planning and is for users who find themselves overwhelmed when planning their day and struggle with prioritization. 

**Core Loop (3–5 sentences):** User adds or edits tasks, then answers “Which is higher priority: A or B?”. The choice updates state in the Store (order, comparison cache) via the PriorityEngine, which may queue the next comparison or reinsert a changed task. The UI re-renders immediately to show progress, the evolving ranked list, and checkboxes. Checking off or modifying a task triggers the same cycle—state updates, render, and a refreshed priority order—persisted locally and optionally published as a JSONBin snapshot.

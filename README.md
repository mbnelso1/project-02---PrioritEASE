# project-02---PrioritEASE

**Project Board:** [Sprint 2 – PrioritEASE](https://github.com/users/mbnelso1/projects/2))

## How to run
python3 -m http.server 8080   # then open http://localhost:8080

## Core loop
Add tasks → Compare pairs → order saved locally → Publish snapshot to JSONBin → (optional) Fetch Latest to restore order.

## JSONBin
Bin ID is hardcoded in `src/services/AnalyticsService.js`. If your bin needs a key:
localStorage.setItem('prioritease.jsonbin.key','<X-Master-Key>')

## Proof
See `docs/media/mvp.gif` 


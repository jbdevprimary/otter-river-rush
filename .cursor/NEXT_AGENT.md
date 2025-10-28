# NEXT AGENT — 3-TIER COMPOSITOR INTEGRATION COMPLETE

Status: ✅ ARCHITECTURE INTEGRATED  
Mode: Production Ready  

---

Objective
- Fully align runtime to manifest-driven RoomKit and verify Act I loads via SceneController with numeric tests.

What to do (single pass)
1) Runtime alignment
   - Ensure `addons/roomkit/src/SceneController.gd` composes from manifests only (no per-scene scripts).
   - Name spawned nodes for tests: `Ground/MeshInstance3D/CollisionShape3D`, `NPCs/<id>/InteractionArea/CollisionShape3D`.
   - Gate heavy asset scans: `AnchorResolver` respects `TEST_MODE=1`.

2) Scene and manifest
   - `scenes/act1/01_normal_life.manifest.json`: include `player_start`, `camera_preset`, `ground`, 1 `npc` with `interaction`, 1 `exit`.
   - `scenes/player_selection.gd`: on Start, call `SceneController.load_room("act1/01_normal_life")`.

3) Tests
   - Use gdUnit4 to load via `SceneController.load_room("act1/01_normal_life")` under `TEST_MODE=1`.
   - Numeric asserts: camera pos/rot/projection/size, PlayerSpawn pos/scale/facing, NPC count and InteractionArea radius, exit radius.

4) Docs + memory-bank
   - Update `docs/architecture/frozen/MANIFEST_SCHEMA.md` and cross-refs.
   - Update `memory-bank/AGENT_INSTRUCTIONS.md` and `memory-bank/activeContext.md`.

Runbook
- Instance: `cline instance new -d`
- Task: `cline task new "Refactor & verify manifest-driven RoomKit end-to-end (runtime, manifest, tests, docs)" -m act -y`
- Tests: `TEST_MODE=1 GODOT_BIN=/opt/homebrew/bin/godot ./addons/gdUnit4/runtest.sh -a tests/roomkit/test_01_normal_life_manifest_only.gd`

Acceptance
- `SceneController.load_room("act1/01_normal_life")` composes correctly; all numeric assertions pass; no per-scene scripts.

Constraints
- Preserve indentation (tabs vs spaces).  
- Update docs with version headers.  
- One commit with concise summary.

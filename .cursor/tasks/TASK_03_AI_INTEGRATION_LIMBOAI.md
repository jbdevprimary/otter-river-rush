# Agent Task: AI Integration with LimboAI

**Task ID**: TASK_03  
**Priority**: HIGH (Layer 4)  
**Estimated Time**: 4-5 hours  
**Dependencies**: TASK_01 (movement), TASK_02 (combat)  
**Parallel Safe**: NO (wait for TASK_01 and TASK_02)

---

## Mission

Actually integrate LimboAI addon to create intelligent enemy behavior. Enemy must pathfind to player and attack. This PROVES AI works before we create complex enemy types.

---

## Context You Need

### What Exists

**Working** (from previous tasks):

- Hex grid movement with pathfinding
- Combat system with turn-based fighting

**Installed but NOT Used**:

- LimboAI addon at `.plugged/limboai/`
- Stub: `ai/AIBehavior.gd` (20 lines, useless)

### What Doesn't Work

- AIBehavior.gd doesn't extend BTPlayer
- No behavior trees (.btree files)
- No custom BTTask classes
- Not integrated with hex movement or combat

### Reference Documentation

- Read: `docs/AI_BEHAVIORS_GODOT.md`
- Read: `docs/AI_NAV_AND_STEERING_GODOT.md`
- Study: LimboAI demo files in `.plugged/limboai/demo/`

---

## What to Build

### 1. Enemy AI Controller: `ai/EnemyAI.gd`

**Replaces stub AIBehavior.gd:**

```gdscript
extends BTPlayer
class_name EnemyAI
## Enemy AI using LimboAI behavior trees
## Pathfinds to player and attacks when in range

@export var behavior_tree: BehaviorTree
@export var target: Node2D  # Usually the player
@export var attack_range: int = 1  # Adjacent hexes

@onready var combat_unit: CombatUnit = get_parent()
@onready var hex_map: TileMap = get_tree().get_first_node_in_group("hex_map")

var current_hex: Vector2i
var target_hex: Vector2i

func _ready():
    if behavior_tree:
        set_behavior_tree(behavior_tree)

    # Get initial position
    if hex_map:
        current_hex = hex_map.world_to_map(global_position)

func get_target_distance() -> int:
    if not target or not hex_map:
        return 999

    target_hex = hex_map.world_to_map(target.global_position)
    return hex_distance(current_hex, target_hex)

func hex_distance(a: Vector2i, b: Vector2i) -> int:
    # Axial coordinate distance
    return (abs(a.x - b.x) + abs(a.x + a.y - b.x - b.y) + abs(a.y - b.y)) / 2

func is_in_attack_range() -> bool:
    return get_target_distance() <= attack_range

func move_toward_target():
    if not target or not hex_map:
        return

    target_hex = hex_map.world_to_map(target.global_position)

    # Get neighbors
    var neighbors = get_hex_neighbors(current_hex)

    # Find neighbor closest to target
    var best_hex = current_hex
    var best_distance = 999

    for neighbor in neighbors:
        if is_hex_walkable(neighbor):
            var dist = hex_distance(neighbor, target_hex)
            if dist < best_distance:
                best_distance = dist
                best_hex = neighbor

    # Move to best hex
    if best_hex != current_hex:
        current_hex = best_hex
        global_position = hex_map.map_to_local(best_hex)

func attack_target():
    if combat_unit and target:
        var target_unit = target.get_node_or_null("CombatUnit")
        if target_unit:
            # Execute attack through combat controller
            var controller = get_tree().get_first_node_in_group("combat_controller")
            if controller:
                controller.execute_attack(combat_unit, target_unit)

func get_hex_neighbors(hex: Vector2i) -> Array[Vector2i]:
    return [
        hex + Vector2i(1, 0),
        hex + Vector2i(1, -1),
        hex + Vector2i(0, -1),
        hex + Vector2i(-1, 0),
        hex + Vector2i(-1, 1),
        hex + Vector2i(0, 1),
    ]

func is_hex_walkable(hex_coord: Vector2i) -> bool:
    if not hex_map:
        return false
    var tile_data = hex_map.get_cell_tile_data(0, hex_coord)
    return tile_data != null
```

### 2. Behavior Tree: `ai/behaviors/basic_melee.tres`

**Create using LimboAI editor:**

```
BehaviorTree: BasicMelee
├── BTSequence
    ├── IsTargetValid (BTCondition)
    ├── BTSelector
        ├── BTSequence (if in range)
        │   ├── IsInAttackRange (BTCondition)
        │   └── AttackTarget (BTAction)
        └── MoveTowardTarget (BTAction)
```

**Custom Tasks to Create:**

1. `ai/tasks/IsTargetValid.gd` (BTCondition)
2. `ai/tasks/IsInAttackRange.gd` (BTCondition)
3. `ai/tasks/AttackTarget.gd` (BTAction)
4. `ai/tasks/MoveTowardTarget.gd` (BTAction)

### 3. Test Scene: `tests/demo_ai_behavior.tscn`

```
AIDemo (Node2D)
├── HexagonalTileMap
├── Player (Node2D at hex 5,5)
│   ├── Sprite2D (blue)
│   ├── CombatUnit
│   └── PlayerController
├── Enemy (Node2D at hex 1,1)
│   ├── Sprite2D (red)
│   ├── CombatUnit
│   └── EnemyAI
│       └── behavior_tree = basic_melee.tres
├── CombatController
└── UI
    ├── Instructions: "Watch enemy AI pathfind and attack"
    └── CombatLog
```

---

## Acceptance Criteria

### MUST HAVE

1. **Enemy AI activates**
   - Enemy runs behavior tree each turn
   - Makes decisions autonomously
2. **Pathfinding AI works**
   - Enemy moves toward player
   - Takes shortest path
   - Stops when in attack range
3. **Combat AI works**

   - Attacks when adjacent
   - Switches to attack mode when in range
   - Actually damages player

4. **Integrates with combat system**
   - AI actions go through CombatController
   - Respects turn order
   - Ends turn properly

### NICE TO HAVE

- Multiple behavior trees (aggressive, defensive, tactical)
- Fleeing when low HP
- Using abilities
- Team coordination

---

## Success = Deliver

Enemy that:

- Pathfinds to player on hex grid
- Attacks when adjacent
- Makes intelligent decisions
- Fully automated, no player control

Then I review AI behavior and difficulty.

---

## Files to CREATE

- `ai/EnemyAI.gd` (replaces AIBehavior.gd)
- `ai/behaviors/basic_melee.tres` (behavior tree)
- `ai/tasks/IsTargetValid.gd`
- `ai/tasks/IsInAttackRange.gd`
- `ai/tasks/AttackTarget.gd`
- `ai/tasks/MoveTowardTarget.gd`
- `tests/demo_ai_behavior.tscn`
- `tests/demo_ai_behavior.gd`

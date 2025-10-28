# Agent Task: Hex Movement Integration

**Task ID**: TASK_01  
**Priority**: CRITICAL (Layer 1 - Foundation)  
**Estimated Time**: 2-3 hours  
**Dependencies**: NONE (can start immediately)  
**Parallel Safe**: YES

---

## Mission

Integrate the Hexagon Tilemap addon to create a working hex grid movement system with pathfinding. This is the FOUNDATION - everything else depends on this working.

---

## Context You Need

### What Exists

- Hexagon Tilemap addon installed at `addons/Hexagon-Tilemap/`
- Stub files: `scenes/FieldMap.gd`, `scenes/PlayerController.gd`, `input/InputHandler.gd`
- Resource definition: `resources/HexTileDef.gd`

### What Doesn't Work

- FieldMap.gd doesn't use HexagonalTileMap node from addon
- No hex coordinate conversion
- No pathfinding
- Input doesn't convert clicks to hex coords

### Reference Documentation

- Read: `docs/TILEMAP_AND_CHUNKING_GODOT.md`
- Read: `docs/RPG_DEPENDENCY_LAYER_ANALYSIS.md` (Layer 1 section)
- Study: Hexagon Tilemap addon examples/documentation

---

## What to Build

### 1. Test Scene: `tests/demo_hex_movement.tscn`

**Scene Structure:**

```
HexMovementDemo (Node2D)
├── HexagonalTileMap (use addon's HexagonalTileMap node)
│   ├── Set tile_set to use HexTileDef
│   ├── Draw 12x12 hex grid
│   ├── Add some obstacle tiles
│   └── Use pointy-top hex orientation
├── Player (Node2D)
│   ├── Sprite2D (use ColorRect for now, 32x32 blue)
│   ├── PlayerController.gd (attach script)
│   └── Label (shows current hex coords)
├── Camera2D
│   └── Follow player
├── UI (CanvasLayer)
│   ├── InstructionsLabel (Label)
│   │   └── Text: "Click hex to move. WASD to scroll camera."
│   └── CoordDisplay (Label)
│       └── Shows: "Hex: (x, y) | World: (x, y)"
└── HexMovementDemo.gd (root script)
```

### 2. Script: `tests/demo_hex_movement.gd`

**Core Responsibilities:**

- Convert mouse clicks to hex coordinates using addon's hex math
- Show selected hex highlight
- Trigger pathfinding when player clicks
- Update coord display

**Required Implementation:**

```gdscript
extends Node2D

@onready var hex_map: TileMap = $HexagonalTileMap
@onready var player: Node2D = $Player
@onready var coord_display: Label = $UI/CoordDisplay
@onready var camera: Camera2D = $Camera2D

var selected_hex: Vector2i = Vector2i.ZERO
var highlight_tile_id: int = 1  # Highlight tile in tileset

func _ready():
    # Center camera on player
    camera.position = player.position

func _input(event: InputEvent):
    if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
        handle_hex_click(event.position)

    # Camera panning with WASD
    if Input.is_action_pressed("ui_right"):
        camera.position.x += 5
    # ... other directions

func handle_hex_click(screen_pos: Vector2):
    # Convert screen position to world position
    var world_pos = screen_pos + camera.position - get_viewport_rect().size / 2

    # Convert world to hex coords using addon's built-in method
    var hex_coords = hex_map.world_to_map(world_pos)

    # Check if tile is walkable
    if is_walkable(hex_coords):
        selected_hex = hex_coords
        player.move_to_hex(hex_coords)  # Tell player to move

func is_walkable(hex_coords: Vector2i) -> bool:
    # Check if tile exists and is not obstacle
    var tile_data = hex_map.get_cell_tile_data(0, hex_coords)
    if tile_data == null:
        return false
    return tile_data.get_custom_data("walkable") if tile_data.get_custom_data_layer_count() > 0 else true

func _process(_delta):
    # Update coord display
    var player_hex = hex_map.world_to_map(player.position)
    coord_display.text = "Hex: (%d, %d) | World: (%.0f, %.0f)" % [
        player_hex.x, player_hex.y,
        player.position.x, player.position.y
    ]
```

### 3. Script: `scenes/PlayerController.gd`

**Core Responsibilities:**

- Store current hex position
- Move smoothly between hexes
- Snap to hex center
- Handle pathfinding (A\* on hex grid)

**Required Implementation:**

```gdscript
extends Node2D
class_name PlayerController

signal movement_finished
signal movement_started

@export var move_speed: float = 200.0  # Pixels per second
@onready var hex_map: TileMap = get_parent().get_node("HexagonalTileMap")

var current_hex: Vector2i = Vector2i.ZERO
var target_hex: Vector2i = Vector2i.ZERO
var is_moving: bool = false
var path: Array[Vector2i] = []
var path_index: int = 0

func _ready():
    # Snap to starting hex center
    position = hex_map.map_to_local(current_hex)

func move_to_hex(target: Vector2i):
    if is_moving:
        return  # Don't interrupt current movement

    target_hex = target

    # Calculate path using A*
    path = calculate_path(current_hex, target_hex)

    if path.is_empty():
        print("No path found!")
        return

    path_index = 0
    is_moving = true
    movement_started.emit()

func calculate_path(from: Vector2i, to: Vector2i) -> Array[Vector2i]:
    var astar = AStar2D.new()
    var point_id_map = {}
    var id_counter = 0

    # Get all walkable hexes in reasonable range
    var search_radius = 20
    for x in range(from.x - search_radius, from.x + search_radius):
        for y in range(from.y - search_radius, from.y + search_radius):
            var hex_coord = Vector2i(x, y)
            if is_hex_walkable(hex_coord):
                astar.add_point(id_counter, Vector2(x, y))
                point_id_map[hex_coord] = id_counter
                id_counter += 1

    # Connect adjacent hexes
    for hex_coord in point_id_map.keys():
        var neighbors = get_hex_neighbors(hex_coord)
        for neighbor in neighbors:
            if point_id_map.has(neighbor):
                astar.connect_points(
                    point_id_map[hex_coord],
                    point_id_map[neighbor]
                )

    # Get path
    if not point_id_map.has(from) or not point_id_map.has(to):
        return []

    var id_path = astar.get_id_path(point_id_map[from], point_id_map[to])

    var result: Array[Vector2i] = []
    for id in id_path:
        var point = astar.get_point_position(id)
        result.append(Vector2i(int(point.x), int(point.y)))

    return result

func get_hex_neighbors(hex: Vector2i) -> Array[Vector2i]:
    # Axial hex neighbors (pointy-top orientation)
    # Reference: https://www.redblobgames.com/grids/hexagons/
    var neighbors: Array[Vector2i] = [
        hex + Vector2i(1, 0),   # E
        hex + Vector2i(1, -1),  # NE
        hex + Vector2i(0, -1),  # NW
        hex + Vector2i(-1, 0),  # W
        hex + Vector2i(-1, 1),  # SW
        hex + Vector2i(0, 1),   # SE
    ]
    return neighbors

func is_hex_walkable(hex_coord: Vector2i) -> bool:
    var tile_data = hex_map.get_cell_tile_data(0, hex_coord)
    if tile_data == null:
        return false
    return tile_data.get_custom_data("walkable") if tile_data.get_custom_data_layer_count() > 0 else true

func _process(delta):
    if not is_moving or path.is_empty():
        return

    # Get current target in path
    if path_index >= path.size():
        finish_movement()
        return

    var next_hex = path[path_index]
    var target_pos = hex_map.map_to_local(next_hex)

    # Move toward target
    var direction = (target_pos - position).normalized()
    var move_distance = move_speed * delta

    if position.distance_to(target_pos) <= move_distance:
        # Snap to target
        position = target_pos
        current_hex = next_hex
        path_index += 1

        if path_index >= path.size():
            finish_movement()
    else:
        position += direction * move_distance

func finish_movement():
    is_moving = false
    path.clear()
    path_index = 0
    movement_finished.emit()
```

### 4. Update: `resources/HexTileDef.gd`

**Add custom data layers:**

```gdscript
# Ensure this resource can define:
# - walkable: bool (can units move through this hex?)
# - movement_cost: float (cost to move through, for pathfinding)
# - terrain_type: String (grass, water, mountain, etc.)
```

### 5. Create Simple Tileset

Create `assets/tiles/hex_test_tileset.tres`:

- Tile 0: Grass (green, walkable)
- Tile 1: Highlight (yellow outline, for showing selected hex)
- Tile 2: Obstacle (red, NOT walkable)

Use ColorRects or simple sprites for now.

---

## Acceptance Criteria

### MUST HAVE (Agent must deliver these)

1. **Test scene exists and runs**
   - `tests/demo_hex_movement.tscn` launches without errors
   - Shows hex grid on screen
2. **Click to move works**
   - Click on any hex
   - Player moves to that hex
   - Player snaps to hex center
3. **Pathfinding works**
   - Player moves around obstacles
   - Takes shortest path
   - Doesn't walk through red obstacle hexes
4. **Coord display works**

   - Shows current hex coords
   - Shows world position
   - Updates as player moves

5. **Camera works**
   - WASD pans camera
   - Camera follows player

### NICE TO HAVE (Bonus if agent delivers)

- Visual path preview (show path before moving)
- Movement animation (smooth interpolation)
- Highlight hovered hex
- Different terrain types with costs

---

## Code Quality Requirements

### Use Addon Properly

```gdscript
# YES - Use addon's nodes and methods:
@onready var hex_map: TileMap = $HexagonalTileMap
var hex_coords = hex_map.world_to_map(world_pos)
var world_pos = hex_map.map_to_local(hex_coords)

# NO - Don't write custom hex math from scratch
```

### Follow Godot Best Practices

- Use @onready for node references
- Type hints on all variables and functions
- Signals for communication
- Process only when needed (check is_moving flag)

### Comments

- Comment WHY, not WHAT
- Reference Red Blob Games for hex math
- Note any addon-specific usage

---

## Testing Instructions

**For Agent to Verify:**

1. Run scene: `godot --path . tests/demo_hex_movement.tscn`
2. Click different hexes - player should move
3. Click past obstacles - player should path around
4. Coords should update correctly
5. No errors in console

**For Me to Review:**

- Does movement FEEL good? (speed, smoothness)
- Is pathfinding smart? (shortest path)
- Any edge cases? (clicking outside grid, clicking obstacles)

---

## Common Pitfalls to Avoid

❌ **Don't write stub implementations**

```gdscript
# BAD:
func calculate_path(from, to):
    # TODO: implement pathfinding
    return []
```

✅ **Do implement fully**

```gdscript
# GOOD:
func calculate_path(from, to):
    var astar = AStar2D.new()
    # ... full implementation ...
    return result_path
```

❌ **Don't hardcode coords**

```gdscript
# BAD:
position = Vector2(100, 100)
```

✅ **Do use hex map**

```gdscript
# GOOD:
position = hex_map.map_to_local(hex_coords)
```

---

## Files to Create/Modify

**CREATE:**

- `tests/demo_hex_movement.tscn`
- `tests/demo_hex_movement.gd`
- `assets/tiles/hex_test_tileset.tres`

**MODIFY:**

- `scenes/PlayerController.gd` (full rewrite with pathfinding)
- `resources/HexTileDef.gd` (add custom data)

**READ (for context):**

- `docs/TILEMAP_AND_CHUNKING_GODOT.md`
- `docs/RPG_DEPENDENCY_LAYER_ANALYSIS.md`
- Hexagon Tilemap addon documentation

---

## Git/PR Workflow

```bash
# Create feature branch
git checkout -b feature/hex-movement-integration

# Make your changes
# (implement everything above)

# Stage all changes
git add tests/demo_hex_movement.* assets/tiles/ scenes/PlayerController.gd resources/HexTileDef.gd

# Commit with descriptive message
git commit -m "feat: Integrate Hexagon Tilemap with pathfinding

- Implement hex grid movement with A* pathfinding
- Create playable hex movement demo scene
- Integrate Hexagon Tilemap addon properly
- Add hex coordinate conversion
- Implement click-to-move with pathfinding around obstacles

Closes TASK_01"

# Push branch
git push origin feature/hex-movement-integration

# Create PR
gh pr create --title "Hex Movement Integration" --body "Implements TASK_01: Complete hex grid movement system with pathfinding. See memory-bank/agent-tasks/TASK_01_HEX_MOVEMENT_INTEGRATION.md for spec."
```

---

## Success = You Deliver

A playable scene + PR where I can click hexes and watch pathfinding work.

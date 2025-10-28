# Agent Task: GUT Integration Tests

**Task ID**: TASK_06  
**Priority**: HIGH  
**Estimated Time**: 4-5 hours  
**Dependencies**: TASK_01, 02, 03, 04 (test systems that exist)  
**Parallel Safe**: Partially (can write tests as systems complete)

---

## Mission

Create comprehensive GUT (Godot Unit Test) integration tests for all core systems. Not just unit tests - INTEGRATION tests that prove systems work together. This gives us automated verification and regression testing.

---

## Context You Need

### What Exists

**GUT Addon Installed**:

- Located at `addons/gut/`
- 241 files
- Full testing framework

**Current Tests** (Minimal):

- `tests/unit/test_combat_unit.gd` - One basic unit test
- `tests/test_unified_asset_system.gd` - Resource loading test
- That's it - 2 files testing a 110-file codebase

**Systems to Test** (from other tasks):

- Hex movement system (TASK_01)
- Combat system (TASK_02)
- AI behavior (TASK_03)
- Inventory/equipment (TASK_04)

### Reference Documentation

- Read: `docs/TESTS_DETERMINISM_AND_VALIDATION_GODOT.md`
- Study: GUT addon documentation in `addons/gut/`
- Reference: Existing `tests/unit/test_combat_unit.gd` for GUT syntax

---

## What to Build

### 1. GUT Test Suite: `tests/integration/test_hex_movement.gd`

**Tests hex grid integration:**

```gdscript
extends GutTest

var hex_map: TileMap
var player: PlayerController
var demo_scene: PackedScene

func before_each():
    demo_scene = load("res://tests/demo_hex_movement.tscn")
    var scene_instance = demo_scene.instantiate()
    add_child_autofree(scene_instance)

    hex_map = scene_instance.get_node("HexagonalTileMap")
    player = scene_instance.get_node("Player")

    await get_tree().process_frame

func test_hex_coordinate_conversion():
    # Test world to hex conversion
    var world_pos = Vector2(100, 100)
    var hex_coords = hex_map.world_to_map(world_pos)

    assert_not_null(hex_coords, "Should convert world to hex")

    # Test hex to world conversion
    var converted_back = hex_map.map_to_local(hex_coords)
    assert_not_null(converted_back, "Should convert hex to world")

func test_player_snaps_to_hex():
    # Player should snap to hex center
    var player_hex = hex_map.world_to_map(player.position)
    var expected_pos = hex_map.map_to_local(player_hex)

    assert_almost_eq(player.position.x, expected_pos.x, 1.0, "X should snap to hex center")
    assert_almost_eq(player.position.y, expected_pos.y, 1.0, "Y should snap to hex center")

func test_pathfinding_works():
    var start_hex = Vector2i(0, 0)
    var end_hex = Vector2i(5, 5)

    var path = player.calculate_path(start_hex, end_hex)

    assert_true(path.size() > 0, "Should find path")
    assert_eq(path[0], start_hex, "Path should start at origin")
    assert_eq(path[path.size() - 1], end_hex, "Path should end at destination")

func test_pathfinding_avoids_obstacles():
    # Place obstacle between player and target
    var start_hex = Vector2i(0, 0)
    var obstacle_hex = Vector2i(2, 2)
    var end_hex = Vector2i(5, 5)

    # Set obstacle tile
    hex_map.set_cell(0, obstacle_hex, 2, Vector2i(0, 0))  # Obstacle tile

    var path = player.calculate_path(start_hex, end_hex)

    assert_true(path.size() > 0, "Should find path around obstacle")
    assert_does_not_have(path, obstacle_hex, "Path should not go through obstacle")

func test_movement_completes():
    var start_pos = player.position
    var target_hex = Vector2i(3, 3)

    player.move_to_hex(target_hex)

    # Wait for movement to complete
    await player.movement_finished

    var final_hex = hex_map.world_to_map(player.position)
    assert_eq(final_hex, target_hex, "Player should reach target hex")
```

### 2. GUT Test Suite: `tests/integration/test_combat_system.gd`

```gdscript
extends GutTest

var combat_scene: PackedScene
var controller: CombatController
var player_unit: CombatUnit
var enemy_unit: CombatUnit

func before_each():
    combat_scene = load("res://tests/demo_combat.tscn")
    var scene_instance = combat_scene.instantiate()
    add_child_autofree(scene_instance)

    controller = scene_instance.get_node("CombatController")
    player_unit = scene_instance.get_node("PlayerUnit")
    enemy_unit = scene_instance.get_node("EnemyUnit")

    await get_tree().process_frame

func test_combat_starts_correctly():
    assert_not_null(controller, "Controller should exist")
    assert_not_null(player_unit, "Player unit should exist")
    assert_not_null(enemy_unit, "Enemy unit should exist")

    assert_eq(controller.units.size(), 2, "Should have 2 units in combat")
    assert_eq(controller.round_number, 1, "Should start at round 1")

func test_turn_order_by_initiative():
    # Higher initiative goes first
    player_unit.initiative = 15
    enemy_unit.initiative = 10

    controller.start_combat([player_unit, enemy_unit])

    assert_eq(controller.turn_order[0], player_unit, "Player should go first (higher initiative)")
    assert_eq(controller.turn_order[1], enemy_unit, "Enemy should go second")

func test_damage_calculation():
    var initial_health = enemy_unit.current_health
    var expected_damage = player_unit.attack - (enemy_unit.defense / 2)
    expected_damage = max(1, expected_damage)

    controller.execute_attack(player_unit, enemy_unit)

    var actual_damage = initial_health - enemy_unit.current_health
    assert_eq(actual_damage, expected_damage, "Damage should be calculated correctly")

func test_defending_reduces_damage():
    enemy_unit.defend()

    var initial_health = enemy_unit.current_health
    controller.execute_attack(player_unit, enemy_unit)

    var actual_damage = initial_health - enemy_unit.current_health
    var undefended_damage = player_unit.attack - (enemy_unit.defense / 2)

    assert_lt(actual_damage, undefended_damage, "Defending should reduce damage")

func test_unit_dies_at_zero_health():
    enemy_unit.current_health = 1

    controller.execute_attack(player_unit, enemy_unit)

    assert_false(enemy_unit.is_alive, "Unit should die at 0 HP")
    assert_signal_emitted(enemy_unit, "died", "Should emit died signal")

func test_combat_ends_when_one_side_wins():
    enemy_unit.current_health = 1

    controller.execute_attack(player_unit, enemy_unit)

    await controller.combat_ended

    assert_signal_emitted(controller, "combat_ended", "Should emit combat ended")
    assert_eq(controller.current_phase, CombatController.Phase.VICTORY, "Should be in victory phase")
```

### 3. GUT Test Suite: `tests/integration/test_inventory_system.gd`

```gdscript
extends GutTest

var inventory_scene: PackedScene
var inventory: InventoryManager
var equipment: EquipmentManager
var combat_unit: CombatUnit

func before_each():
    inventory_scene = load("res://tests/demo_inventory.tscn")
    var scene_instance = inventory_scene.instantiate()
    add_child_autofree(scene_instance)

    var player = scene_instance.get_node("Player")
    inventory = player.get_node("InventoryManager")
    equipment = inventory.get_node("EquipmentManager")
    combat_unit = player.get_node("CombatUnit")

    await get_tree().process_frame

func test_can_add_items():
    var item = ItemDef.new()
    item.item_id = "test_item"
    item.item_name = "Test Item"

    var success = inventory.add_item(item)

    assert_true(success, "Should add item successfully")
    assert_eq(inventory.items.size(), 1, "Should have 1 item")
    assert_signal_emitted(inventory, "item_added", "Should emit item_added signal")

func test_inventory_full_behavior():
    inventory.max_slots = 2

    # Fill inventory
    for i in 3:
        var item = ItemDef.new()
        item.item_id = "item_%d" % i
        inventory.add_item(item)

    assert_eq(inventory.items.size(), 2, "Should only hold max_slots items")
    assert_signal_emitted(inventory, "inventory_full", "Should emit inventory_full when full")

func test_equipping_weapon_increases_attack():
    var weapon = EquipmentDef.new()
    weapon.item_id = "sword"
    weapon.equipment_slot = EquipmentManager.Slot.WEAPON
    weapon.attack_bonus = 10

    var initial_attack = combat_unit.attack

    equipment.equip(weapon)

    assert_eq(combat_unit.attack, initial_attack + 10, "Attack should increase by weapon bonus")
    assert_signal_emitted(equipment, "equipment_changed", "Should emit equipment_changed")

func test_unequipping_removes_bonuses():
    var weapon = EquipmentDef.new()
    weapon.item_id = "sword"
    weapon.equipment_slot = EquipmentManager.Slot.WEAPON
    weapon.attack_bonus = 10

    var initial_attack = combat_unit.attack

    equipment.equip(weapon)
    equipment.unequip("weapon")

    assert_eq(combat_unit.attack, initial_attack, "Attack should return to base after unequipping")

func test_replacing_equipment():
    var weapon1 = EquipmentDef.new()
    weapon1.item_id = "sword"
    weapon1.equipment_slot = EquipmentManager.Slot.WEAPON
    weapon1.attack_bonus = 10

    var weapon2 = EquipmentDef.new()
    weapon2.item_id = "axe"
    weapon2.equipment_slot = EquipmentManager.Slot.WEAPON
    weapon2.attack_bonus = 15

    var initial_attack = combat_unit.attack

    equipment.equip(weapon1)
    equipment.equip(weapon2)  # Should auto-unequip weapon1

    assert_eq(combat_unit.attack, initial_attack + 15, "Should have axe bonus, not sword")
    assert_eq(equipment.equipped["weapon"], weapon2, "Should have axe equipped")
```

### 4. GUT Test Suite: `tests/integration/test_ai_behavior.gd`

```gdscript
extends GutTest

var ai_scene: PackedScene
var enemy_ai: EnemyAI
var player: Node2D
var hex_map: TileMap

func before_each():
    ai_scene = load("res://tests/demo_ai_behavior.tscn")
    var scene_instance = ai_scene.instantiate()
    add_child_autofree(scene_instance)

    hex_map = scene_instance.get_node("HexagonalTileMap")
    player = scene_instance.get_node("Player")
    var enemy = scene_instance.get_node("Enemy")
    enemy_ai = enemy.get_node("EnemyAI")

    await get_tree().process_frame

func test_ai_has_behavior_tree():
    assert_not_null(enemy_ai.behavior_tree, "Enemy should have behavior tree")
    assert_true(enemy_ai is BTPlayer, "Enemy AI should extend BTPlayer")

func test_ai_detects_target():
    enemy_ai.target = player
    var distance = enemy_ai.get_target_distance()

    assert_gt(distance, 0, "Should calculate distance to target")
    assert_lt(distance, 999, "Should have valid distance")

func test_ai_moves_toward_player():
    # Place enemy far from player
    var enemy_start = Vector2i(0, 0)
    var player_pos = Vector2i(5, 5)

    enemy_ai.get_parent().global_position = hex_map.map_to_local(enemy_start)
    player.global_position = hex_map.map_to_local(player_pos)

    enemy_ai.current_hex = enemy_start
    enemy_ai.target = player

    var initial_distance = enemy_ai.get_target_distance()

    # Execute AI movement
    enemy_ai.move_toward_target()

    var final_distance = enemy_ai.get_target_distance()

    assert_lt(final_distance, initial_distance, "Enemy should move closer to player")

func test_ai_attacks_when_in_range():
    # Place enemy adjacent to player
    var enemy_hex = Vector2i(0, 0)
    var player_hex = Vector2i(1, 0)

    enemy_ai.get_parent().global_position = hex_map.map_to_local(enemy_hex)
    player.global_position = hex_map.map_to_local(player_hex)

    enemy_ai.current_hex = enemy_hex
    enemy_ai.target = player

    assert_true(enemy_ai.is_in_attack_range(), "Should detect player in range")

    # Verify attack would execute (needs combat system)
    var player_unit = player.get_node_or_null("CombatUnit")
    if player_unit:
        var initial_health = player_unit.current_health
        enemy_ai.attack_target()
        # Wait for attack to process
        await get_tree().create_timer(0.1).timeout
        assert_lt(player_unit.current_health, initial_health, "Attack should damage player")
```

### 5. GUT Test Runner Scene: `tests/integration/test_runner.tscn`

**Create scene that runs all integration tests:**

```
TestRunner (Node)
└── GutTestRunner (from addon)
    ├── Add test scripts:
    │   - test_hex_movement.gd
    │   - test_combat_system.gd
    │   - test_inventory_system.gd
    │   - test_ai_behavior.gd
    └── Configure for headless/visual mode
```

### 6. Test Configuration: `tests/.gutconfig.json`

```json
{
  "dirs": ["res://tests/integration", "res://tests/unit"],
  "include_subdirs": true,
  "log_level": 1,
  "should_exit": true,
  "should_maximize": false,
  "compact_mode": false,
  "junit_xml_file": "tests/results/junit.xml",
  "junit_xml_timestamp": true
}
```

### 7. CI Test Script: `tests/run_all_tests.sh`

```bash
#!/bin/bash
# Run all GUT tests

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "=== Running GUT Integration Tests ==="

# Run tests
godot --headless --script addons/gut/gut_cmdln.gd \
    -gdir=res://tests/integration \
    -ginclude_subdirs \
    -gexit

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Tests failed${NC}"
    exit 1
fi
```

---

## Acceptance Criteria

### MUST HAVE

1. **Integration tests for each system**

   - test_hex_movement.gd (5+ tests)
   - test_combat_system.gd (6+ tests)
   - test_inventory_system.gd (5+ tests)
   - test_ai_behavior.gd (4+ tests)

2. **Tests actually run**

   - Can execute via GUT addon
   - All tests pass
   - No errors or crashes

3. **Tests prove integration**

   - Not just unit tests (testing single functions)
   - Integration tests (testing systems working together)
   - Cover critical paths

4. **Automated execution**
   - run_all_tests.sh works
   - Can run headless for CI
   - Generates test reports

---

## Testing Instructions

**Manual Test Run:**

1. Open Godot
2. Open `tests/integration/test_runner.tscn`
3. Run scene
4. GUT panel shows results
5. All tests should be green

**Command Line:**

```bash
cd tests
./run_all_tests.sh
```

**Expected Output:**

```
=== Running GUT Integration Tests ===
Running test_hex_movement.gd...
  ✓ test_hex_coordinate_conversion
  ✓ test_player_snaps_to_hex
  ✓ test_pathfinding_works
  ✓ test_pathfinding_avoids_obstacles
  ✓ test_movement_completes

Running test_combat_system.gd...
  ✓ test_combat_starts_correctly
  ✓ test_turn_order_by_initiative
  ✓ test_damage_calculation
  ✓ test_defending_reduces_damage
  ✓ test_unit_dies_at_zero_health
  ✓ test_combat_ends_when_one_side_wins

All tests passed! (15/15)
```

---

## GUT Best Practices

### Test Structure

```gdscript
extends GutTest

# Setup before each test
func before_each():
    # Create fresh test environment
    # Load scenes
    # Reset state

# Teardown after each test
func after_each():
    # Clean up
    # Free resources

# Individual tests
func test_specific_behavior():
    # Arrange
    var expected = 10

    # Act
    var result = system_under_test.do_thing()

    # Assert
    assert_eq(result, expected, "Should return expected value")
```

### Assertions to Use

- `assert_true()` / `assert_false()`
- `assert_eq()` / `assert_ne()`
- `assert_gt()` / `assert_lt()`
- `assert_almost_eq()` (for floats)
- `assert_null()` / `assert_not_null()`
- `assert_signal_emitted()`
- `assert_has()` / `assert_does_not_have()`

---

## Success = Deliver

Automated test suite that:

- Covers all core systems
- Runs headless or visual
- Provides clear pass/fail
- Catches regressions
- Can run in CI/CD

Then I review coverage and add edge case tests.

---

## Files to CREATE

**Integration Tests:**

- `tests/integration/test_hex_movement.gd`
- `tests/integration/test_combat_system.gd`
- `tests/integration/test_inventory_system.gd`
- `tests/integration/test_ai_behavior.gd`

**Test Infrastructure:**

- `tests/integration/test_runner.tscn`
- `tests/.gutconfig.json`
- `tests/run_all_tests.sh`

**Documentation:**

- `tests/README.md` (how to run tests)

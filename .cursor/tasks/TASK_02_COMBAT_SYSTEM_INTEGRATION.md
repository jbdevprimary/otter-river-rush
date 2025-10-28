# Agent Task: Combat System Integration

**Task ID**: TASK_02  
**Priority**: HIGH (Layer 3A)  
**Estimated Time**: 4-5 hours  
**Dependencies**: TASK_01 (hex movement must work first)  
**Parallel Safe**: NO (wait for TASK_01)

---

## Mission

Create a working turn-based combat system on hex grid. Two units fighting with abilities, damage calculation, turn order, and visual feedback. This PROVES combat works before we build more complex encounters.

---

## Context You Need

### What Exists

**Working** (from TASK_01):

- Hex grid movement system
- Pathfinding on hexes
- PlayerController positioning

**Stub Code** (needs full implementation):

- `combat/CombatUnit.gd` - Basic stats
- `combat/CombatController.gd` - Turn management
- `combat/AbilitySystem.gd` - Ability execution
- `combat/AbilityDef.gd` - Ability definitions

### Reference Documentation

- Read: `docs/COMBAT_SYSTEMS_GODOT.md`
- Read: `docs/RPG_DEPENDENCY_LAYER_ANALYSIS.md` (Layer 3A section)
- Reference: Existing `combat/*.gd` files for structure

---

## What to Build

### 1. Test Scene: `tests/demo_combat.tscn`

**Scene Structure:**

```
CombatDemo (Node2D)
├── HexagonalTileMap (from hex movement test)
│   └── 10x8 grid
├── PlayerUnit (Node2D at hex 2,4)
│   ├── Sprite2D (blue square)
│   ├── CombatUnit.gd
│   ├── HealthBar (ProgressBar)
│   └── UnitLabel (shows name/HP)
├── EnemyUnit (Node2D at hex 7,4)
│   ├── Sprite2D (red square)
│   ├── CombatUnit.gd
│   ├── HealthBar
│   └── UnitLabel
├── CombatController (Node)
│   └── Manages turn order, phases
├── UI (CanvasLayer)
│   ├── TurnOrderPanel (VBoxContainer)
│   │   └── Shows who goes when
│   ├── CombatLog (RichTextLabel)
│   │   └── "Player attacks Enemy for 15 damage!"
│   ├── ActionButtons (HBoxContainer)
│   │   ├── AttackButton
│   │   ├── AbilityButton
│   │   ├── DefendButton
│   │   └── EndTurnButton
│   └── TargetingOverlay
│       └── Shows valid targets when selecting action
└── CombatDemo.gd (root script)
```

### 2. Combat Unit: `combat/CombatUnit.gd`

**Complete Implementation:**

```gdscript
extends Node2D
class_name CombatUnit

signal health_changed(old_value: int, new_value: int)
signal died
signal turn_started
signal turn_ended

## Stats
@export var unit_name: String = "Unit"
@export var max_health: int = 100
@export var current_health: int = 100
@export var attack: int = 15
@export var defense: int = 10
@export var speed: int = 10
@export var initiative: int = 10

## State
var is_alive: bool = true
var is_defending: bool = false
var status_effects: Array[Dictionary] = []
var hex_position: Vector2i = Vector2i.ZERO

func _ready():
    current_health = max_health
    update_display()

func take_damage(amount: int, source: CombatUnit = null):
    if not is_alive:
        return

    var actual_damage = amount

    # Defense reduces damage
    actual_damage = max(1, amount - (defense / 2))

    # Defending halves damage
    if is_defending:
        actual_damage = actual_damage / 2
        is_defending = false

    var old_health = current_health
    current_health = max(0, current_health - actual_damage)

    health_changed.emit(old_health, current_health)

    # Log
    print("%s takes %d damage (%d -> %d HP)" % [
        unit_name, actual_damage, old_health, current_health
    ])

    # Check death
    if current_health <= 0:
        die()

    update_display()

func heal(amount: int):
    var old_health = current_health
    current_health = min(max_health, current_health + amount)
    health_changed.emit(old_health, current_health)
    update_display()

func die():
    if not is_alive:
        return

    is_alive = false
    died.emit()
    print("%s died!" % unit_name)

    # Visual feedback
    modulate = Color(0.5, 0.5, 0.5)

func defend():
    is_defending = true
    print("%s is defending!" % unit_name)

func start_turn():
    turn_started.emit()
    print("\n--- %s's turn ---" % unit_name)

func end_turn():
    # Process status effects
    process_status_effects()
    turn_ended.emit()

func process_status_effects():
    # Process DoT, buffs, etc.
    for i in range(status_effects.size() - 1, -1, -1):
        var effect = status_effects[i]
        effect["duration"] -= 1

        # Apply effect
        match effect["type"]:
            "poison":
                take_damage(effect["amount"])
            "regen":
                heal(effect["amount"])

        # Remove expired
        if effect["duration"] <= 0:
            status_effects.remove_at(i)

func update_display():
    # Update health bar
    var health_bar = get_node_or_null("HealthBar")
    if health_bar:
        health_bar.value = (float(current_health) / max_health) * 100

    # Update label
    var label = get_node_or_null("UnitLabel")
    if label:
        label.text = "%s\n%d/%d HP" % [unit_name, current_health, max_health]
```

### 3. Combat Controller: `combat/CombatController.gd`

**Complete Implementation:**

```gdscript
extends Node
class_name CombatController

signal combat_started
signal combat_ended(winner: CombatUnit)
signal turn_started(unit: CombatUnit)
signal phase_changed(phase: Phase)

enum Phase {
    SETUP,      # Initialize combat
    TURN_START, # Start of unit's turn
    ACTION,     # Unit selects action
    EXECUTION,  # Action executes
    TURN_END,   # End of unit's turn
    VICTORY     # Combat over
}

var current_phase: Phase = Phase.SETUP
var units: Array[CombatUnit] = []
var turn_order: Array[CombatUnit] = []
var current_unit_index: int = 0
var round_number: int = 0

@onready var combat_log: RichTextLabel = get_parent().get_node("UI/CombatLog")

func start_combat(participants: Array[CombatUnit]):
    units = participants
    round_number = 1

    # Sort by initiative (higher = goes first)
    units.sort_custom(func(a, b): return a.initiative > b.initiative)
    turn_order = units.duplicate()

    log_message("Combat started!")
    for unit in turn_order:
        log_message("  %s (Initiative: %d)" % [unit.unit_name, unit.initiative])

    current_unit_index = 0
    current_phase = Phase.TURN_START
    combat_started.emit()

    start_next_turn()

func start_next_turn():
    # Check victory
    if check_victory():
        return

    # Next unit
    var current_unit = turn_order[current_unit_index]

    # Skip if dead
    if not current_unit.is_alive:
        advance_turn()
        return

    current_phase = Phase.TURN_START
    phase_changed.emit(current_phase)
    current_unit.start_turn()
    turn_started.emit(current_unit)

    # Move to action phase
    current_phase = Phase.ACTION
    phase_changed.emit(current_phase)

func execute_attack(attacker: CombatUnit, target: CombatUnit):
    if not attacker.is_alive or not target.is_alive:
        return

    current_phase = Phase.EXECUTION
    phase_changed.emit(current_phase)

    var damage = attacker.attack
    log_message("%s attacks %s for %d damage!" % [
        attacker.unit_name, target.name, damage
    ])

    target.take_damage(damage, attacker)

    end_current_turn()

func execute_defend(unit: CombatUnit):
    current_phase = Phase.EXECUTION
    phase_changed.emit(current_phase)

    unit.defend()
    log_message("%s takes a defensive stance!" % unit.unit_name)

    end_current_turn()

func end_current_turn():
    var current_unit = turn_order[current_unit_index]

    current_phase = Phase.TURN_END
    phase_changed.emit(current_phase)
    current_unit.end_turn()

    advance_turn()

func advance_turn():
    current_unit_index += 1

    # New round
    if current_unit_index >= turn_order.size():
        current_unit_index = 0
        round_number += 1
        log_message("\n=== Round %d ===" % round_number)

    start_next_turn()

func check_victory() -> bool:
    var alive_units: Array[CombatUnit] = []
    for unit in units:
        if unit.is_alive:
            alive_units.append(unit)

    if alive_units.size() <= 1:
        var winner = alive_units[0] if alive_units.size() == 1 else null
        end_combat(winner)
        return true

    return false

func end_combat(winner: CombatUnit):
    current_phase = Phase.VICTORY
    phase_changed.emit(current_phase)

    if winner:
        log_message("\n=== %s wins! ===" % winner.unit_name)
    else:
        log_message("\n=== Draw! ===")

    combat_ended.emit(winner)

func log_message(text: String):
    if combat_log:
        combat_log.append_text(text + "\n")
    print(text)

func get_current_unit() -> CombatUnit:
    if current_unit_index < turn_order.size():
        return turn_order[current_unit_index]
    return null
```

### 4. Demo Script: `tests/demo_combat.gd`

```gdscript
extends Node2D

@onready var controller: CombatController = $CombatController
@onready var player_unit: CombatUnit = $PlayerUnit
@onready var enemy_unit: CombatUnit = $EnemyUnit
@onready var action_buttons = $UI/ActionButtons

var player_controlled: bool = true  # Player controls both for demo

func _ready():
    # Setup units
    player_unit.unit_name = "Player"
    player_unit.hex_position = Vector2i(2, 4)

    enemy_unit.unit_name = "Enemy"
    enemy_unit.hex_position = Vector2i(7, 4)

    # Start combat
    controller.start_combat([player_unit, enemy_unit])

    # Connect signals
    controller.turn_started.connect(_on_turn_started)
    controller.combat_ended.connect(_on_combat_ended)

    # Connect buttons
    $UI/ActionButtons/AttackButton.pressed.connect(_on_attack_pressed)
    $UI/ActionButtons/DefendButton.pressed.connect(_on_defend_pressed)
    $UI/ActionButtons/EndTurnButton.pressed.connect(_on_end_turn_pressed)

func _on_turn_started(unit: CombatUnit):
    # Enable buttons for current unit
    action_buttons.visible = (unit == player_unit) or player_controlled

func _on_attack_pressed():
    var attacker = controller.get_current_unit()
    var target = enemy_unit if attacker == player_unit else player_unit
    controller.execute_attack(attacker, target)

func _on_defend_pressed():
    var unit = controller.get_current_unit()
    controller.execute_defend(unit)

func _on_end_turn_pressed():
    controller.end_current_turn()

func _on_combat_ended(winner: CombatUnit):
    action_buttons.visible = false
    # Show victory screen or restart option
```

---

## Acceptance Criteria

### MUST HAVE

1. **Combat starts and units fight**
   - Two units on hex grid
   - Turn order based on initiative
   - Can attack and defend
2. **Damage calculation works**
   - Attack stat applies damage
   - Defense reduces damage
   - Defending halves damage
3. **Health tracking works**
   - Health bars update
   - Units die at 0 HP
   - Combat ends when one side wins
4. **UI shows state**
   - Combat log shows actions
   - Turn order display
   - Action buttons enabled/disabled correctly

### NICE TO HAVE

- Visual feedback (damage numbers floating)
- Attack animations
- Ability system working
- Multiple enemies

---

## Testing Instructions

1. Run: `godot --path . tests/demo_combat.tscn`
2. Click Attack - enemy takes damage
3. Click Defend - next attack does less damage
4. Fight until one unit dies
5. Verify combat log shows all actions
6. No errors in console

---

## Success = Deliver

A playable 1v1 combat demo where:

- Units take turns
- Attack/defend buttons work
- Damage is calculated correctly
- Combat ends when someone wins
- All state tracked properly

Then I review combat feel and balance.

---

## Files to Create/Modify

**MODIFY (Full rewrites needed):**

- `combat/CombatUnit.gd`
- `combat/CombatController.gd`

**CREATE:**

- `tests/demo_combat.tscn`
- `tests/demo_combat.gd`

**READ:**

- `docs/COMBAT_SYSTEMS_GODOT.md`
- `docs/RPG_DEPENDENCY_LAYER_ANALYSIS.md`

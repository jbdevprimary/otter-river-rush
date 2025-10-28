# Agent Task: Inventory & Equipment System

**Task ID**: TASK_04  
**Priority**: MEDIUM (Layer 3B)  
**Estimated Time**: 3-4 hours  
**Dependencies**: TASK_02 (combat - items affect stats)  
**Parallel Safe**: YES (can work while TASK_03 in progress)

---

## Mission

Create working inventory and equipment system with UI. Player can pickup items, equip weapons/armor, use consumables. Stats change when equipment changes. This PROVES inventory mechanics work.

---

## Context You Need

### What Exists

**Working** (from previous tasks):

- Combat system with stat calculations
- Units with stats (attack, defense, health)

**Stub Code** (needs full implementation):

- `inventory/InventoryManager.gd`
- `inventory/EquipmentManager.gd`
- `inventory/ItemDef.gd`, `EquipmentDef.gd`, `ConsumableDef.gd`

### Reference Documentation

- Read: `docs/INVENTORY_AND_EQUIPMENT_GODOT.md`
- Read: `docs/RPG_DEPENDENCY_LAYER_ANALYSIS.md`

---

## What to Build

### 1. Test Scene: `tests/demo_inventory.tscn`

```
InventoryDemo (Node2D)
├── Player (Node2D)
│   ├── Sprite2D
│   ├── CombatUnit
│   └── InventoryManager
├── ItemSpawns (Node2D)
│   ├── Weapon1 (Area2D with ItemDef)
│   ├── Armor1 (Area2D with ItemDef)
│   └── Potion1 (Area2D with ItemDef)
└── UI (CanvasLayer)
    ├── InventoryPanel (Panel)
    │   ├── ItemGrid (GridContainer)
    │   └── Shows items with icons
    ├── EquipmentPanel (Panel)
    │   ├── WeaponSlot (TextureRect)
    │   ├── ArmorSlot (TextureRect)
    │   └── AccessorySlot (TextureRect)
    ├── StatsPanel (Panel)
    │   └── Shows current stats
    └── Instructions
        └── "Walk over items to pickup. Click to equip."
```

### 2. Inventory Manager: `inventory/InventoryManager.gd`

**Complete Implementation:**

```gdscript
extends Node
class_name InventoryManager

signal item_added(item: ItemDef)
signal item_removed(item: ItemDef)
signal inventory_full

@export var max_slots: int = 20
@onready var equipment_manager: EquipmentManager = $EquipmentManager

var items: Array[ItemDef] = []

func add_item(item: ItemDef) -> bool:
    if items.size() >= max_slots:
        inventory_full.emit()
        return false

    items.append(item)
    item_added.emit(item)
    print("Added: %s" % item.item_name)
    return true

func remove_item(item: ItemDef) -> bool:
    var index = items.find(item)
    if index == -1:
        return false

    items.remove_at(index)
    item_removed.emit(item)
    return true

func has_item(item_id: String) -> bool:
    for item in items:
        if item.item_id == item_id:
            return true
    return false

func get_item(item_id: String) -> ItemDef:
    for item in items:
        if item.item_id == item_id:
            return item
    return null

func use_item(item: ItemDef, target: Node = null):
    if item is ConsumableDef:
        item.use(target if target else get_parent())
        remove_item(item)
    elif item is EquipmentDef:
        equipment_manager.equip(item)
```

### 3. Equipment Manager: `inventory/EquipmentManager.gd`

**Complete Implementation:**

```gdscript
extends Node
class_name EquipmentManager

signal equipment_changed(slot: String, item: EquipmentDef)
signal stats_changed

enum Slot {
    WEAPON,
    ARMOR,
    ACCESSORY
}

var equipped: Dictionary = {
    "weapon": null,
    "armor": null,
    "accessory": null
}

@onready var combat_unit: CombatUnit = get_parent().get_node_or_null("CombatUnit")

func equip(item: EquipmentDef) -> bool:
    if not item:
        return false

    var slot_name = get_slot_name(item.equipment_slot)

    # Unequip old item
    var old_item = equipped[slot_name]
    if old_item:
        unequip(slot_name)

    # Equip new item
    equipped[slot_name] = item
    apply_stat_bonuses(item, true)

    equipment_changed.emit(slot_name, item)
    stats_changed.emit()

    print("Equipped %s to %s slot" % [item.item_name, slot_name])
    return true

func unequip(slot_name: String) -> EquipmentDef:
    var item = equipped[slot_name]
    if not item:
        return null

    apply_stat_bonuses(item, false)
    equipped[slot_name] = null

    equipment_changed.emit(slot_name, null)
    stats_changed.emit()

    return item

func apply_stat_bonuses(item: EquipmentDef, applying: bool):
    if not combat_unit:
        return

    var multiplier = 1 if applying else -1

    combat_unit.attack += item.attack_bonus * multiplier
    combat_unit.defense += item.defense_bonus * multiplier
    combat_unit.max_health += item.health_bonus * multiplier

    # Clamp health to new max
    if applying and item.health_bonus > 0:
        combat_unit.current_health = min(combat_unit.current_health, combat_unit.max_health)

func get_slot_name(slot: Slot) -> String:
    match slot:
        Slot.WEAPON: return "weapon"
        Slot.ARMOR: return "armor"
        Slot.ACCESSORY: return "accessory"
    return ""

func get_total_stat_bonus(stat: String) -> int:
    var total = 0
    for item in equipped.values():
        if item:
            match stat:
                "attack": total += item.attack_bonus
                "defense": total += item.defense_bonus
                "health": total += item.health_bonus
    return total
```

### 4. Item Pickup System: `inventory/ItemPickup.gd`

```gdscript
extends Area2D
class_name ItemPickup

@export var item: ItemDef
@onready var sprite: Sprite2D = $Sprite2D

func _ready():
    body_entered.connect(_on_body_entered)

    # Visual feedback
    if item:
        # Use item icon or colored square
        modulate = get_rarity_color(item.rarity)

func _on_body_entered(body: Node2D):
    var inventory = body.get_node_or_null("InventoryManager")
    if inventory and item:
        if inventory.add_item(item):
            queue_free()  # Remove from world
        else:
            print("Inventory full!")

func get_rarity_color(rarity: String) -> Color:
    match rarity:
        "common": return Color.WHITE
        "uncommon": return Color.GREEN
        "rare": return Color.BLUE
        "epic": return Color.PURPLE
        "legendary": return Color.GOLD
    return Color.WHITE
```

---

## Acceptance Criteria

### MUST HAVE

1. **Can pickup items**

   - Walk over item → adds to inventory
   - Visual feedback (item disappears)
   - Inventory count updates

2. **Can equip items**

   - Click item in inventory → equips to correct slot
   - Old item unequipped automatically
   - Stats update immediately

3. **Stats change correctly**

   - Equip weapon → attack increases
   - Equip armor → defense increases
   - Remove equipment → stats return to base

4. **Can use consumables**
   - Click potion → heals health
   - Consumable removed from inventory
   - Effect applies immediately

---

## Testing Instructions

1. Run: `godot --path . tests/demo_inventory.tscn`
2. Walk over weapon → pickup
3. Click weapon in inventory → equip
4. Verify attack stat increases
5. Walk over potion → pickup → use
6. Verify health increases
7. No errors

---

## Success = Deliver

Working inventory where:

- Items can be picked up
- Equipment changes stats
- Consumables have effects
- UI shows everything clearly

Then I review inventory feel and balance.

---

## Files to CREATE

- `inventory/ItemPickup.gd`
- `tests/demo_inventory.tscn`
- `tests/demo_inventory.gd`
- `ui/InventoryPanel.tscn` (PackedScene)
- `ui/EquipmentPanel.tscn` (PackedScene)

**MODIFY:**

- `inventory/InventoryManager.gd` (complete implementation)
- `inventory/EquipmentManager.gd` (complete implementation)

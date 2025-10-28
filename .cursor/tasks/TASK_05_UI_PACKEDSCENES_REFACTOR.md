# Agent Task: UI PackedScenes Refactor

**Task ID**: TASK_05  
**Priority**: MEDIUM  
**Estimated Time**: 3-4 hours  
**Dependencies**: NONE  
**Parallel Safe**: YES (can work independently)

---

## Mission

Refactor UI components from inline GameMain nodes to modular PackedScenes following godot-open-rpg pattern. This makes UI reusable, testable, and prevents the "everything in one scene" problem.

---

## Context You Need

### Current Problem

`scenes/GameMain.tscn` has UI hardcoded as inline nodes:

- CombatUI defined inline (not a scene)
- DialogueUI defined inline (not a scene)
- Script expects nodes that don't exist

**GameMain.gd expects:**

```gdscript
@onready var intro_dialogue: Control = $UI/IntroDialogue  # DOESN'T EXIST
@onready var field_map: Node2D = $FieldMap  # DOESN'T EXIST
```

### Reference Architecture

Study: `~/src/godot-open-rpg/src/main.tscn`

- Everything is a PackedScene
- UI components are modular
- Can test each component independently

### Reference Documentation

- Read: `docs/UI_COMPONENTS_GODOT.md`
- Read: `docs/ARCHITECTURE_ANALYSIS.md`

---

## What to Build

### 1. IntroDialogue PackedScene: `ui/IntroDialogue.tscn`

**Scene Structure:**

```
IntroDialogue (Control)
├── Panel (Panel)
│   ├── MarginContainer
│       ├── VBoxContainer
│           ├── TitleLabel (Label)
│           ├── ContentLabel (RichTextLabel)
│           └── ContinueButton (Button)
└── IntroDialogue.gd (script)
```

**Script: `ui/IntroDialogue.gd` (already exists, adapt if needed)**

### 2. CombatUI PackedScene: `ui/CombatUI.tscn`

Extract from GameMain.tscn inline nodes:

```
CombatUI (Control)
├── UnitDisplay (VBoxContainer)
│   ├── NameLabel
│   ├── HPBar (ProgressBar)
│   ├── HPText
│   └── StatsLabel
├── ActionButtons (HBoxContainer)
│   ├── AttackBtn
│   ├── DefendBtn
│   ├── AbilityBtn
│   └── WaitBtn
├── TurnOrder (VBoxContainer)
└── CombatLog (RichTextLabel)
```

### 3. DialogueUI PackedScene: `ui/DialogueUI.tscn`

Extract from GameMain.tscn:

```
DialogueUI (Control)
├── DialogueBox (Panel)
│   ├── SpeakerLabel
│   ├── DialogueText (RichTextLabel)
│   ├── ChoicesContainer (VBoxContainer)
│   └── Portrait (TextureRect)
└── DialogueUI.gd
```

### 4. FieldUI PackedScene: `ui/FieldUI.tscn`

New scene for field map overlay:

```
FieldUI (CanvasLayer)
├── Minimap (Panel)
├── QuestTracker (VBoxContainer)
├── QuickInventory (HBoxContainer)
└── FieldUI.gd
```

### 5. Update GameMain.tscn

**New Structure:**

```
GameMain (Node)
├── WorldOrchestrator (Node)
├── InputHandler (Node)
├── UI (CanvasLayer)
│   ├── CharacterSelection (PackedScene)
│   ├── IntroDialogue (PackedScene) ← NEW
│   ├── CombatUI (PackedScene) ← CONVERTED
│   ├── DialogueUI (PackedScene) ← CONVERTED
│   └── FieldUI (PackedScene) ← NEW
└── Field (Node2D)
    └── Will be added by TASK_01
```

### 6. Update GameMain.gd

Fix node references:

```gdscript
extends Node

# UI PackedScenes (will exist after refactor)
@onready var character_selection = $UI/CharacterSelection
@onready var intro_dialogue = $UI/IntroDialogue
@onready var combat_ui = $UI/CombatUI
@onready var dialogue_ui = $UI/DialogueUI
@onready var field_ui = $UI/FieldUI

func _ready():
    # Start with character selection
    show_screen(character_selection)

    # Connect signals
    character_selection.character_selected.connect(_on_character_selected)
    intro_dialogue.dialogue_finished.connect(_on_intro_finished)

func show_screen(screen: Control):
    # Hide all UI
    for child in $UI.get_children():
        if child is Control:
            child.hide()

    # Show requested screen
    if screen:
        screen.show()
```

---

## Acceptance Criteria

### MUST HAVE

1. **All UI as PackedScenes**

   - IntroDialogue.tscn exists
   - CombatUI.tscn exists
   - DialogueUI.tscn exists
   - FieldUI.tscn exists

2. **GameMain.tscn instances them**

   - No more inline UI definitions
   - All UI as scene instances
   - Clean scene tree

3. **GameMain.gd references work**

   - No null reference errors
   - All @onready vars find nodes
   - Signals connect properly

4. **Each UI can be tested independently**
   - Can open IntroDialogue.tscn and test
   - Can open CombatUI.tscn and test
   - Each scene is self-contained

---

## Testing Instructions

1. Open each .tscn file in Godot editor
2. Run each scene independently (should not crash)
3. Run GameMain.tscn - all UI should load
4. No null reference errors
5. Can show/hide each UI panel

---

## Success = Deliver

Modular UI architecture where:

- Each component is a PackedScene
- Can test components independently
- GameMain cleanly composes them
- Follows godot-open-rpg pattern

Then I review UI organization.

---

## Files to CREATE

- `ui/IntroDialogue.tscn` (if doesn't exist)
- `ui/CombatUI.tscn`
- `ui/DialogueUI.tscn`
- `ui/FieldUI.tscn`

**MODIFY:**

- `scenes/GameMain.tscn` (refactor to use PackedScenes)
- `scenes/GameMain.gd` (fix node references)
- Each UI script if needed

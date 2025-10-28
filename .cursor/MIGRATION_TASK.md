# MASSIVE MIGRATION TASK - RWMD 1.3 → 2.0

**Priority**: CRITICAL  
**Approach**: Methodical, like asset organization  
**Validation**: Zod schemas both ends  
**No AI generation**: TypeScript migration only

---

## THE TASK

Migrate **289 RWMD 1.3 files** to proper RWMD 2.0 organization.

**Source**: `client/src/lib/world/resources-1-3/` (450K words of content)  
**Target**: `client/src/lib/world/resources/` (empty 2.0 structure)  
**Spec**: `docs/architecture/world/02_rwmd_format.md` (1689 lines)  
**Mapping**: `docs/architecture/world/1-3-to-2-0-schema-mappings.md` (IN PROGRESS)

---

## STEP 1: Complete Mapping Document (Est: 100K context)

**File**: `docs/architecture/world/1-3-to-2-0-schema-mappings.md`

**Current Status**: 5% complete (guardians section done)

**Need to Map**:
1. ✅ divine_spirits/ → primitives/guardians/ (DONE)
2. ⏳ factions/ → packages/factions/ (STARTED)
3. ⏳ scenes/ → narrative/dialogue/ (STARTED)
4. ⏳ continents/ → decompose (STARTED)
5. ⏳ narrative/ → multiple (STARTED)
6. ⏳ realms/ → prefabs/maps/ (STARTED)
7. ❌ encounters/ → prefabs/encounters/
8. ❌ creatures/ → primitives/npcs/
9. ❌ quests/ (from narrative/) → packages/quests/
10. ❌ shards/ → primitives/shards/
11. ❌ territories/ → (decompose to factions)
12. ❌ special_realms/ → (classify individually)
13. ❌ pools/ → (handle separately - JSON data)
14. ❌ personas/ → DELETE (wrong approach)
15. ❌ storyboard/ → DELETE (no fixed scenarios)
16. ❌ world/ → (extract to world config)
17. ❌ _pending/ → SKIP (incomplete content)

**For EACH directory**:
```markdown
## MAPPING: {directory}/ → {target}/

### Layer: PRIMITIVE|PREFAB|PACKAGE

**Source**: `resources-1-3/{path}/`
**Target**: `resources/{namespace}/{sublocation}/`

**Files**: List all files

**Content Extraction**:
```typescript
// Regex patterns
// Expected content
```

**Transformation**:
- What changes?
- What's added (triggers, behaviors)?
- What's removed (fixed scenarios)?

**2.0 Structure**:
```yaml
# Example 2.0 block
```
```

---

## STEP 2: Build TypeScript Migrator (Est: 80K context)

**File**: `client/src/dev-tools/cli/migrate-1-3-to-2-0.ts`

```typescript
#!/usr/bin/env tsx
/**
 * RWMD 1.3 → 2.0 Migrator
 * 
 * Uses mapping document + regex patterns
 * Validates with Zod at both ends
 * NO AI - pure TypeScript
 */

import { readFile, writeFile } from 'fs/promises';
import { parse as parseYAML } from 'yaml';
import { z } from 'zod';

// Import 1.3 schemas
import { DivineSpirit13Schema } from '@/lib/world/rwmd-format-1-3/schemas';

// Import 2.0 schemas  
import { GuardianBlockSchema } from '@/lib/world/rwmd-format-2-0/schemas';

async function migrateGuardian(file13: string): Promise<string> {
  // 1. Read 1.3 file
  const content = await readFile(file13, 'utf-8');
  const [frontmatter, body] = splitFrontmatter(content);
  
  // 2. Parse and validate 1.3
  const data13 = DivineSpirit13Schema.parse(parseYAML(frontmatter));
  
  // 3. Extract content from markdown body
  const extracted = {
    true_name: extractMatch(body, /\*\*True Name\*\*:\s*(.+)/),
    divine_nature: extractSection(body, "## DIVINE NATURE"),
    disguise: extractSection(body, "## THE DISGUISE"),
    trials: extractSection(body, "## DIVINE TRIALS"),
    dialogue_sections: extractDialogueSections(body),
    relationships: extractSection(body, "## RELATIONSHIP"),
    philosophy: extractPhilosophy(body),
  };
  
  // 4. Transform to 2.0 structure
  const data20 = {
    frontmatter: {
      rwmd: "2.0",
      kind: "guardian",
      id: data13.id,
      title: data13.title,
      anchors: [`@guardian:${data13.id}`],
    },
    block: {
      anchor: `@guardian:${data13.id}`,
      name: extracted.true_name.split(',')[0].trim(),
      true_name: extracted.true_name,
      domain: parseDomain(data13.domain),
      element: inferElement(data13.domain),
      trial_type: inferTrialType(extracted.trials),
      shard: data13.shard,
      
      // Add triggers (from SCENE sections)
      triggers: extracted.dialogue_sections.map(s => ({
        event: `on_${s.scene_type}`,
        dialogue: `@scene:${data13.id}_${s.scene_type}`
      })),
      
      // Add behaviors
      behaviors: extractBehaviors(extracted),
      
      // Rest of structure...
    }
  };
  
  // 5. Validate 2.0
  GuardianBlockSchema.parse(data20.block);
  
  // 6. Generate 2.0 RWMD
  return generateRWMD20(data20);
}
```

---

## STEP 3: Execute Migration (Est: 150K context)

**Process**:

```bash
# For each namespace (one at a time)
pnpm migrate:guardians   # 10 files
pnpm migrate:factions    # 9 dirs → many files
pnpm migrate:scenes      # 143 files (BIGGEST)
pnpm migrate:quests      # 24 files
pnpm migrate:realms      # 10 files
# ... continue for all

# After each:
git add client/src/lib/world/resources/
git commit -m "migrate: {namespace} complete ({N} files)"
```

**Validation After Each**:
```bash
# Check all files parse
pnpm validate:rwmd resources/primitives/guardians/*.rwmd

# Check all anchors resolve
pnpm validate:anchors
```

---

## STEP 4: Cleanup (Est: 20K context)

**After migration complete**:
1. Delete resources-1-3/ (source migrated)
2. Update all references
3. Test game loads
4. Final commit

---

## Estimated Total

- Mapping: 100K context
- Migrator: 80K context
- Migration: 150K context
- Cleanup: 20K context
**Total**: ~350K context

**Available**: 383K context remaining

**Feasible in one session if focused.**

---

## Do NOT

❌ Use Cline's AI migration (generates wrong structure)
❌ Skip mapping document (leads to errors)
❌ Try to migrate everything at once
❌ Add new features mid-migration

## Do

✅ Complete mapping document methodically
✅ Build proper TypeScript migrator
✅ Validate with Zod at every step
✅ Commit checkpoints frequently
✅ Test after each namespace

---

**This is the PROPER way. Methodical. Patient. Correct. Like asset organization.**


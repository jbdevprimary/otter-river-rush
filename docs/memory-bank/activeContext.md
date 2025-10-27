# Active Context - Otter River Rush

**Last Updated**: 2025-10-26  
**Current Branch**: copilot/refactor-image-processing-pipeline  
**Session Status**: ✅ COMPLETE - Ready for merge

## Current Work Summary

### Completed Tasks ✅

#### 1. Migrated to Vercel AI SDK
- Replaced `@anthropic-ai/sdk` with `@ai-sdk/anthropic`
- Updated `generate-content.ts` and `generate-level-patterns.ts`
- All AI generation now uses consistent Vercel AI SDK
- API keys auto-picked from `process.env.ANTHROPIC_API_KEY` and `OPENAI_API_KEY`

#### 2. Integrated Content Generation in CI/CD
- Added content generation step to build-web job in ci-cd.yml
- Runs on main branch only (cost optimization)
- Generates: game content (Claude), sprites (OpenAI), HUD, UI icons, asset pipeline
- GitHub secrets properly mapped to env vars
- Fails gracefully if APIs unavailable

#### 3. Fixed Asset Post-Processor Bugs
- Adaptive quality re-processing now uses PNG explicitly (line 206)
- Fixed ICO format handling (removed redundant resize, dynamic quality)
- Added exhaustive type checking for format switch
- Added comprehensive JSDoc to applyFormatConversion

#### 4. Documentation Cleanup
- Deleted 20+ cruft summary/status documents
- Cleaned up PR bodies and transformation docs
- Kept only essential docs in memory-bank/

## Key Files Modified This Session

1. **package.json** - Replaced Anthropic SDK with Vercel AI SDK package
2. **scripts/generate-content.ts** - Migrated to Vercel AI SDK
3. **scripts/generate-level-patterns.ts** - Migrated to Vercel AI SDK
4. **scripts/asset-post-processor.ts** - Fixed adaptive quality bug
5. **.github/workflows/ci-cd.yml** - Added content generation step
6. **README.md** - Updated deployment section
7. **docs/memory-bank/activeContext.md** - This file

## How Content Generation Works

### Main Branch Workflow
```
Push to main
  ↓
CI (lint, test, type-check) - parallel
  ↓
build-web job:
  1. npm ci
  2. Generate fresh content (NEW!)
     - generate-content (Claude) - enemy AI, levels, achievements, tips
     - generate-sprites (OpenAI) - otter, obstacles, enemies
     - generate-hud (OpenAI) - HUD elements
     - generate-ui-icons (OpenAI) - menu icons
     - asset-pipeline - optimization
  3. npm run build
  4. Upload dist/
  ↓
E2E + Visual Tests
  ↓
Deploy to GitHub Pages
  ↓
Auto-release (semantic versioning)
  ↓
Platform Builds
```

### API Key Flow
- GitHub Secrets: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- Workflow maps to env vars (lines 128-129 in ci-cd.yml)
- Vercel AI SDK auto-picks up from `process.env`
- Falls back to committed files if generation fails

## Tech Stack

### AI/ML
- **Vercel AI SDK** (`ai` package) - Unified AI interface
- **@ai-sdk/anthropic** - Claude provider
- **@ai-sdk/openai** - OpenAI provider

### Build/Deploy
- Vite 7.x
- GitHub Actions CI/CD
- Semantic Release
- GitHub Pages

### Game
- TypeScript (strict mode)
- Canvas 2D rendering
- Yuka.js (AI behaviors)
- Zustand (state management)

## Next Steps

### Immediate
- Merge this branch to main
- Watch CI/CD run content generation
- Verify fresh content in deployment

### Short-term
- Monitor API costs (expected $1-2 per deploy)
- Ensure asset quality remains high
- Check semantic release is working properly

## Important Patterns

### Content Generation
- Always use Vercel AI SDK (`generateText` + provider)
- Keep prompts consistent across runs for idempotency
- Extract TypeScript code blocks from responses
- Fall back to committed files gracefully

### Asset Pipeline
- Idempotent - safe to run multiple times
- Adaptive quality for file size optimization
- Format-specific handling (PNG, ICO, WebP, JPG)
- Exhaustive type checking for safety

### CI/CD
- Content generation only on main branch (not PRs)
- Use `continue-on-error: true` for non-critical steps
- Map GitHub secrets to env vars explicitly
- Always test locally before pushing workflow changes

## Memory Bank Files

- **activeContext.md** (this file) - Current session state
- **productContext.md** - Product vision and goals
- **progress.md** - Overall progress tracking
- **projectbrief.md** - Original project requirements
- **systemPatterns.md** - Code patterns and conventions
- **techContext.md** - Technical architecture

---

**Status**: Ready for merge ✅  
**Next Session**: Monitor first automated content generation run

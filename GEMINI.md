# GEMINI.md - Google Gemini Instructions

This file provides guidance to Google Gemini AI when working with this repository.

> **IMPORTANT:** Read [AGENTS.md](./AGENTS.md) first for shared instructions, memory bank protocol, and project context. This file contains only Gemini-specific behaviors.

---

## Gemini-Specific Behaviors

### Code Generation

- Generate TypeScript with strict types
- Follow existing code patterns in the codebase
- Use functional React components with hooks
- Prefer composition over inheritance

### File Operations

- Read files before making changes
- Make targeted edits rather than full file rewrites
- Respect existing code formatting (Biome)

### Communication

- Be concise and direct
- Use code blocks with language tags
- Explain significant changes briefly

---

## Memory Bank Integration

At the start of each session, read all files in `memory-bank/` in order:
1. `projectbrief.md` - Foundation
2. `productContext.md` - Product vision
3. `systemPatterns.md` - Architecture
4. `techContext.md` - Tech stack
5. `activeContext.md` - Current state
6. `progress.md` - Status

Update `activeContext.md` and `progress.md` after significant work.

---

## Quick Reference

See [AGENTS.md](./AGENTS.md) for complete project context.

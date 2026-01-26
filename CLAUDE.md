# CLAUDE.md - Claude Code Instructions

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

> **IMPORTANT:** Read [AGENTS.md](./AGENTS.md) first for shared instructions, memory bank protocol, and project context. This file contains only Claude-specific behaviors.

---

## Claude-Specific Behaviors

### Tool Usage

- **Prefer specialized tools** over bash commands when available
- Use `Read` instead of `cat`/`head`/`tail`
- Use `Edit` instead of `sed`/`awk`
- Use `Glob` instead of `find`
- Use `Grep` instead of `grep`/`rg`
- Use `Write` instead of `echo` redirection

### Task Agent Usage

- Use `Task` tool with appropriate subagent types for complex work
- Spawn parallel agents when tasks are independent
- Use `Explore` agent for codebase investigation
- Use `Plan` agent for architectural decisions

### Code Changes

- Always read files before editing
- Prefer editing existing files over creating new ones
- Use Edit tool for targeted changes (not Write for full file replacement)
- Avoid over-engineering - make minimal changes to accomplish the task

### Git Operations

- Never commit unless explicitly asked
- Use conventional commit format
- Include `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>` in commits
- Never force push or use destructive git commands without explicit permission

### Communication

- Output text directly to communicate (never use echo/printf in bash)
- Be concise - this is a CLI environment
- Use markdown formatting for clarity
- Don't use emojis unless the user requests them

---

## Memory Bank Integration

At the start of each session:

1. Read all files in `memory-bank/` directory
2. Start with `projectbrief.md` → `productContext.md` → `systemPatterns.md` → `techContext.md` → `activeContext.md` → `progress.md`
3. Update `activeContext.md` when making significant changes
4. Update `progress.md` when completing features or fixing bugs

When user says **"update memory bank"**:
1. Review ALL memory bank files
2. Update any that are stale
3. Ensure `activeContext.md` reflects current state
4. Ensure `progress.md` is accurate

---

## Quick Reference

See [AGENTS.md](./AGENTS.md) for:
- Full project structure
- Command reference
- Package overview
- Coordinate system
- Code standards
- CI/CD details

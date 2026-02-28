# @skyfirexyz/skills

Distributable agent skills for Skyfire developers building agent identity and payment flows with KYA, PAY, and KYA+PAY tokens.

## Quick Start

Add Skyfire skills to your AI assistant:

```bash
npx skills add skyfire-xyz/skills
```


## What This Repo Includes

- `skills/skyfire/SKILL.md`: Main Skyfire skill entrypoint with curated rule links
- `skills/skyfire/rules/*.md`: Focused implementation and security rules
- `skills/skyfire/AGENTS.md`: Auto-generated single-file version for agents
- `scripts/build-agents.cjs`: Consolidates `SKILL.md` + rule files
- `scripts/watch-agents.cjs`: Watches markdown files and rebuilds `AGENTS.md`

## Why This Structure Works

This repository follows proven skills patterns:

- Keep a concise `SKILL.md` as the discovery and routing layer
- Split details into one-level-deep rule files for progressive disclosure
- Keep examples actionable with incorrect/correct patterns
- Generate one consolidated `AGENTS.md` for assistants that prefer single-file ingestion

## Build

```bash
npm run build:agents
```

## Watch

```bash
npm run watch:agents
```

Remove installed skills:

```bash
# Remove a specific skill
npx skills remove <skill-name>

# Example
npx skills remove skyfire-xyz

# Remove multiple skills
npx skills remove <skill-1> <skill-2>

# Remove all installed skills
npx skills remove --all

# Remove a skill from the global scope
npx skills remove --global <skill-name>

# Remove a skill from a specific agent (e.g., Cursor)
npx skills remove <skill-name> --agent cursor
```

## References

- [Skyfire Developer Portal](https://skyfire.xyz/llms.txt)
- [Skyfire Developer Docs](https://docs.skyfire.xyz/docs)
- [Skyfire API Reference Root](https://docs.skyfire.xyz/reference)
- [Skyfire Solutions Demo](https://github.com/skyfire-xyz/skyfire-solutions-demo)

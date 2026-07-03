# Skill Example Miner Skill

## When To Use

Use this skill when an agent needs to convert completed run notes or transcript fixtures into examples for a reusable SKILL.md, README, or validation pack.

## Required Inputs

- A local Markdown, JSON, or text fixture.
- A clear intended output: Markdown report or JSON summary.
- Permission to read the local fixture.

## Side-Effect Boundaries

The CLI only reads local files and writes stdout. It must not publish examples, modify live skills, or send content externally without a separate approval step.

## Approval Requirements

- No approval is needed for local fixture analysis.
- Human approval is required before copying generated material into public docs when the input may contain private context.
- Separate approval is required before any external send, publish, account write, or live connector call.

## Workflow

1. Run `skill-example-miner <file>`.
2. Review warnings and missing fields.
3. Update the source fixture or plan if important evidence is absent.
4. Save or paste the report only after redaction review.
5. Run `npm test` and `npm run smoke` when changing the skill package.

## Examples

```bash
node bin/cli.js fixtures/run-note.md
node bin/cli.js fixtures/run-note.md --format=json
```

## Validation

- `npm test`
- `npm run check`
- `npm run smoke`

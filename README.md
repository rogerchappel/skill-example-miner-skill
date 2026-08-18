# Skill Example Miner Skill

Mine completed agent runs into safe reusable skill examples.

This is a local-first agent skill package. It reads local fixtures, produces reviewable Markdown or JSON, and keeps all external side effects out of scope.

## Quickstart

```bash
npm install
npm test
npm run smoke
node bin/cli.js fixtures/run-note.md --format=json
```

## CLI

```bash
skill-example-miner <file> [--format <markdown|json>]
```

The default format is `markdown`. The format option accepts either
`--format=json` or the split form `--format json`; `--json` is a shorthand.
Specify only one of these selectors per invocation; repeated or conflicting
selectors fail with `output format may only be specified once`. Options may
appear before or after the input file. Use `--help` to print the usage summary.

## Input Format

The miner recognizes `Task`, `Trigger`, `Inputs`, `Constraints`, `Tools`,
`Verification`, and `Outcome` as case-insensitive labels at the start of their
own lines. Put each value on the same line as its label:

```text
Task: prepare a reusable example
Trigger: maintainer requests a release review
Verification: npm run release:check
Outcome: reviewable local output
```

Indented labels are accepted. Empty fields are reported as `Not found`, and
text such as `Subtask:` or `Other Task:` is not treated as `Task:`.

## Examples

```bash
node bin/cli.js fixtures/run-note.md
node bin/cli.js fixtures/run-note.md --format=json
node bin/cli.js --format json fixtures/run-note.md
node bin/cli.js --json fixtures/run-note.md
```

## Release Verification

Run the full release gate before opening a release-facing pull request:

```bash
npm run release:check
```

The gate runs static checks, Node tests, a fixture-backed CLI smoke, and a
structured package smoke that verifies the tarball includes the CLI, library,
fixture, example output, release notes, and skill docs.

## Safety Notes

- Reads local files only.
- Does not call external services.
- Does not approve, publish, send, or write outside stdout.
- Treat warnings as review prompts, not perfect policy enforcement.
- Matches `PRIVATE`, `token_`, and `@example.com` as case-insensitive
  substrings. It reports `sk-` only when it starts a separate token followed by
  at least eight ASCII letters, digits, underscores, or hyphens. This avoids
  treating ordinary words such as `risk-based` as credentials.

## Limitations

- V1 uses deterministic fixture parsing and conservative warning terms.
- The `sk-` heuristic is not credential validation: short, unusual, or
  differently prefixed secrets can be missed, and credential-shaped example
  text can still require review.
- It is designed for small local plans and run notes, not full transcript warehouses.
- Human review is still required before public reuse or external action.

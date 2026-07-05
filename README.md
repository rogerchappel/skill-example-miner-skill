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
skill-example-miner <file> [--format=json]
```

## Examples

```bash
node bin/cli.js fixtures/run-note.md
node bin/cli.js fixtures/run-note.md --format=json
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

## Limitations

- V1 uses deterministic fixture parsing and conservative warning terms.
- It is designed for small local plans and run notes, not full transcript warehouses.
- Human review is still required before public reuse or external action.

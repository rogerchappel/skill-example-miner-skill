# Contributing

Keep changes local-first, fixture-backed, and explicit about side-effect boundaries.

## Checks

- npm ci
- npm test
- npm run check
- npm run smoke
- npm run release:check

Run `npm ci` from a clean checkout before the release gate so verification uses
the exact dependency tree recorded in `package-lock.json`.

# Orchestration

## Inputs

- Local Markdown or text fixture containing case-insensitive supported labels
  at the start of individual lines, or a JSON object with the same property
  names.
- Optional `--format=json` flag.

## Steps

1. Read the fixture from disk.
2. Parse a JSON object or extract known text fields with deterministic patterns.
3. Flag conservative review terms.
4. Emit Markdown or JSON to stdout.

## Failure Modes

- Missing file: CLI exits non-zero.
- Missing or empty fields: report uses `Not found` without consuming the next
  line.
- Malformed JSON: CLI exits non-zero with an `invalid JSON input` error.
- Warning terms: report sets review/high risk but does not block output.

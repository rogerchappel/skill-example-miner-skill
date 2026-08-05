# Orchestration

## Inputs

- Local fixture path containing case-insensitive supported labels at the start
  of individual lines, with each value on the same line as its label.
- Optional `--format=json` flag.

## Steps

1. Read the fixture from disk.
2. Extract known fields with deterministic patterns.
3. Flag conservative review terms.
4. Emit Markdown or JSON to stdout.

## Failure Modes

- Missing file: CLI exits non-zero.
- Missing or empty fields: report uses `Not found` without consuming the next
  line.
- Warning terms: report sets review/high risk but does not block output.

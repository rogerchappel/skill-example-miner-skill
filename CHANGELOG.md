# Changelog

## Unreleased

- Make `sk-` warnings token-aware so credential-shaped values remain reviewable
  without flagging ordinary embedded substrings such as `risk-based`.
- Anchor supported input labels to individual lines so unrelated words and
  empty fields cannot capture a value from surrounding text.
- Make CLI argument parsing deterministic, reject unsupported arguments with
  usage diagnostics, and support both equals and split `--format` syntax.

## 0.1.0

- Initial public release candidate with local CLI, fixtures, tests, and skill documentation.

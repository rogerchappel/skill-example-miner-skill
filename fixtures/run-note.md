# Run Note

Task: Turn a repo review into a reusable skill example.
Trigger: user asks for a release readiness check.
Inputs: local repo, docs/PRD.md, npm test output.
Constraints: no network writes, redact PRIVATE customer names.
Tools: rg, npm test, git diff.
Verification: npm test passed and markdown report reviewed.
Outcome: reusable example with safety notes.


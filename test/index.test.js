import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeText, mineExamples, toMarkdown } from '../src/index.js';

test('analyzes fixture into structured result', () => {
  const result = mineExamples('fixtures/run-note.md');
  assert.equal(result.title, 'Skill Example Candidate');
  assert.ok(Object.keys(result.fields).length >= 3);
  assert.match(toMarkdown(result), /## Findings/);
});

test('flags configured review terms', () => {
  const result = analyzeText('Task: demo\nThis contains PRIVATE');
  assert.ok(result.warnings.includes('PRIVATE'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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

test('flags credential-shaped sk- tokens', () => {
  for (const text of [
    'Credential: sk-exampleCredential123',
    'Credential: (SK-PROJ-example_Credential-123)'
  ]) {
    assert.ok(analyzeText(text).warnings.includes('sk-'));
  }
});

test('does not flag sk- embedded in ordinary words', () => {
  for (const text of [
    'Task: assess risk-based planning',
    'Use mask-based filtering',
    'The prefix is sk-',
    'A short placeholder is sk-demo'
  ]) {
    assert.ok(!analyzeText(text).warnings.includes('sk-'));
  }
});

test('keeps PRIVATE and token_ substring indicators', () => {
  const result = analyzeText('PRIVATE notes include mytoken_example');
  assert.ok(result.warnings.includes('PRIVATE'));
  assert.ok(result.warnings.includes('token_'));
});

test('matches supported fields only when their labels start a line', () => {
  const result = analyzeText([
    'Subtask: do not treat this as Task',
    'Other Task: also unrelated',
    'TASK: canonical task',
    'tRiGgEr: canonical trigger'
  ].join('\n'));

  assert.equal(result.fields.Task, 'canonical task');
  assert.equal(result.fields.Trigger, 'canonical trigger');
});

test('does not consume the next line when a field is empty', () => {
  const result = analyzeText([
    'Task:',
    'Trigger: deploy',
    'Inputs:   ',
    'Constraints: remain local'
  ].join('\n'));

  assert.equal(result.fields.Task, 'Not found');
  assert.equal(result.fields.Trigger, 'deploy');
  assert.equal(result.fields.Inputs, 'Not found');
  assert.equal(result.fields.Constraints, 'remain local');
});

test('parses every populated canonical field', () => {
  const result = analyzeText([
    'Task: prepare release',
    'Trigger: maintainer request',
    'Inputs: repository',
    'Constraints: remain local',
    'Tools: npm',
    'Verification: release check',
    'Outcome: ready'
  ].join('\n'));

  assert.deepEqual(result.fields, {
    Task: 'prepare release',
    Trigger: 'maintainer request',
    Inputs: 'repository',
    Constraints: 'remain local',
    Tools: 'npm',
    Verification: 'release check',
    Outcome: 'ready'
  });
});

test('parses a populated JSON object like equivalent labeled text', () => {
  const values = {
    Task: 'prepare release',
    Trigger: 'maintainer request',
    Inputs: 'repository',
    Constraints: 'remain local',
    Tools: 'npm',
    Verification: 'release check',
    Outcome: 'ready'
  };

  assert.deepEqual(analyzeText(JSON.stringify(values)).fields, values);
});

test('reports missing and empty JSON properties as Not found', () => {
  const result = analyzeText(JSON.stringify({ Task: '', Trigger: 'run', Inputs: null }));

  assert.equal(result.fields.Task, 'Not found');
  assert.equal(result.fields.Trigger, 'run');
  assert.equal(result.fields.Inputs, 'Not found');
  assert.equal(result.fields.Outcome, 'Not found');
});

test('malformed JSON input produces a clear nonzero CLI error', () => {
  const directory = mkdtempSync(join(tmpdir(), 'skill-example-miner-test-'));
  const file = join(directory, 'run-note.json');
  writeFileSync(file, '{"Task": "broken"');

  const result = spawnSync(process.execPath, ['bin/cli.js', file], { encoding: 'utf8' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid JSON input/i);
  assert.equal(result.stdout, '');
});

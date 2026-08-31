import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cli = new URL('../bin/cli.js', import.meta.url);

function run(args) {
  return spawnSync(process.execPath, [cli.pathname, ...args], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });
}

test('prints Markdown by default', () => {
  const result = run(['fixtures/run-note.md']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /^# Skill Example Candidate/m);
  assert.equal(result.stderr, '');
});

test('prints JSON with equals, split, and alias format arguments', () => {
  for (const args of [
    ['fixtures/run-note.md', '--format=json'],
    ['--format', 'json', 'fixtures/run-note.md'],
    ['--json', 'fixtures/run-note.md']
  ]) {
    const result = run(args);
    assert.equal(result.status, 0);
    assert.equal(JSON.parse(result.stdout).title, 'Skill Example Candidate');
    assert.equal(result.stderr, '');
  }
});

test('preserves labeled terminal quotes and commas in JSON output', () => {
  const directory = mkdtempSync(join(tmpdir(), 'skill-example-miner-cli-test-'));
  const file = join(directory, 'punctuation.md');
  writeFileSync(file, [
    'Task: Preserve a quoted phrase "hello"',
    'Trigger: ship this,',
    'Inputs: "alpha",'
  ].join('\n'));

  const result = run([file, '--json']);
  const fields = JSON.parse(result.stdout).fields;

  assert.equal(result.status, 0);
  assert.equal(fields.Task, 'Preserve a quoted phrase "hello"');
  assert.equal(fields.Trigger, 'ship this,');
  assert.equal(fields.Inputs, '"alpha",');
  assert.equal(result.stderr, '');
});

test('reports credential-shaped tokens without flagging ordinary sk- substrings', () => {
  const warningResult = run(['fixtures/credential-warning.md', '--json']);
  assert.equal(warningResult.status, 0);
  assert.ok(JSON.parse(warningResult.stdout).warnings.includes('sk-'));

  const ordinaryResult = run(['fixtures/ordinary-hyphens.md', '--json']);
  assert.equal(ordinaryResult.status, 0);
  assert.ok(!JSON.parse(ordinaryResult.stdout).warnings.includes('sk-'));
});

test('accepts an explicit Markdown format', () => {
  const result = run(['--format', 'markdown', 'fixtures/run-note.md']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /^# Skill Example Candidate/m);
  assert.equal(result.stderr, '');
});

test('keeps multiline JSON values inside one Markdown finding', () => {
  const directory = mkdtempSync(join(tmpdir(), 'skill-example-miner-cli-test-'));
  const file = join(directory, 'multiline.json');
  writeFileSync(file, JSON.stringify({
    Task: 'safe\n## Forged section\n- forged item'
  }));

  const result = run([file]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /- Task: safe \\#\\# Forged section \\- forged item/);
  assert.doesNotMatch(result.stdout, /^## Forged section$/m);
  assert.doesNotMatch(result.stdout, /^- forged item$/m);
  assert.equal(result.stderr, '');
});

test('rejects repeated output format selectors before reading input', () => {
  for (const args of [
    ['missing-input.md', '--format=json', '--format=json'],
    ['missing-input.md', '--format', 'markdown', '--format', 'markdown']
  ]) {
    const result = run(args);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /output format may only be specified once/);
    assert.doesNotMatch(result.stderr, /ENOENT/);
  }
});

test('rejects mixed output format selectors', () => {
  for (const args of [
    ['fixtures/run-note.md', '--json', '--format', 'markdown'],
    ['--format=json', 'fixtures/run-note.md', '--json'],
    ['--format', 'markdown', '--format=json', 'fixtures/run-note.md']
  ]) {
    const result = run(args);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /output format may only be specified once/);
  }
});

test('rejects unknown options with usage on stderr', () => {
  const result = run(['fixtures/run-note.md', '--bogus']);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^skill-example-miner: unknown option --bogus\nUsage:/);
});

test('rejects a missing format value', () => {
  const result = run(['fixtures/run-note.md', '--format']);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /option --format requires a value/);
});

test('rejects extra positional arguments', () => {
  const result = run(['fixtures/run-note.md', 'another.md']);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /unexpected argument another\.md/);
});

test('prints help successfully without requiring a file', () => {
  const result = run(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /^Usage:/);
  assert.equal(result.stderr, '');
});

test('reports unreadable input as a runtime error', () => {
  const result = run(['missing-input.md']);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^skill-example-miner: ENOENT:/);
  assert.doesNotMatch(result.stderr, /Usage:/);
});

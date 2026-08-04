import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

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

test('accepts an explicit Markdown format', () => {
  const result = run(['--format', 'markdown', 'fixtures/run-note.md']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /^# Skill Example Candidate/m);
  assert.equal(result.stderr, '');
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

import { execFileSync } from 'node:child_process';

const output = execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' });
const [pack] = JSON.parse(output);
const files = new Set(pack.files.map((file) => file.path));
const required = [
  'bin/cli.js',
  'src/index.js',
  'fixtures/run-note.md',
  'examples/sample-output.md',
  'docs/RELEASE_CANDIDATE.md',
  'SKILL.md',
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'LICENSE'
];

const missing = required.filter((file) => !files.has(file));
if (missing.length > 0) {
  console.error('Package smoke missing files: ' + missing.join(', '));
  process.exit(1);
}

console.log(`package smoke ok: ${pack.files.length} files`);

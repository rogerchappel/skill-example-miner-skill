import fs from 'node:fs';

const required = ['README.md', 'SKILL.md', 'docs/PRD.md', 'docs/TASKS.md', 'docs/ORCHESTRATION.md', 'docs/RELEASE_CANDIDATE.md', 'src/index.js', 'bin/cli.js', 'package-lock.json'];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length > 0) {
  console.error('Missing required files: ' + missing.join(', '));
  process.exit(1);
}

const workflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
if (!/^\s*run:\s+npm ci\s*$/m.test(workflow)) {
  console.error('CI must run npm ci before the release check');
  process.exit(1);
}
console.log('check ok');

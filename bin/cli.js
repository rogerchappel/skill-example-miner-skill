#!/usr/bin/env node
import { mineExamples, toMarkdown } from '../src/index.js';

const args = process.argv.slice(2);
const file = args.find((arg) => !arg.startsWith('--'));
const format = args.includes('--format=json') || args.includes('--json') ? 'json' : 'markdown';

if (!file || args.includes('--help')) {
  console.log('Usage: skill-example-miner <file> [--format=json]');
  process.exit(file ? 0 : 1);
}

try {
  const result = mineExamples(file);
  console.log(format === 'json' ? JSON.stringify(result, null, 2) : toMarkdown(result));
} catch (error) {
  console.error('skill-example-miner: ' + error.message);
  process.exit(1);
}

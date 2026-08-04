#!/usr/bin/env node
import { mineExamples, toMarkdown } from '../src/index.js';

const usage = 'Usage: skill-example-miner <file> [--format <markdown|json>]';

function fail(message) {
  console.error(`skill-example-miner: ${message}\n${usage}`);
  process.exit(1);
}

function parseArgs(args) {
  let file;
  let format = 'markdown';

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--help') {
      return { help: true };
    }

    if (arg === '--json') {
      format = 'json';
      continue;
    }

    if (arg === '--format') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        fail('option --format requires a value');
      }
      format = value;
      index += 1;
      continue;
    }

    if (arg.startsWith('--format=')) {
      format = arg.slice('--format='.length);
      if (!format) {
        fail('option --format requires a value');
      }
      continue;
    }

    if (arg.startsWith('-')) {
      fail(`unknown option ${arg}`);
    }

    if (file) {
      fail(`unexpected argument ${arg}`);
    }
    file = arg;
  }

  if (!file) {
    fail('missing input file');
  }
  if (!['markdown', 'json'].includes(format)) {
    fail(`unsupported format ${format}`);
  }

  return { file, format, help: false };
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  console.log(usage);
  process.exit(0);
}

try {
  const result = mineExamples(options.file);
  console.log(options.format === 'json' ? JSON.stringify(result, null, 2) : toMarkdown(result));
} catch (error) {
  console.error('skill-example-miner: ' + error.message);
  process.exit(1);
}

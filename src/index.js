import fs from 'node:fs';

const ROWS = [
  [
    "Task",
    "^[ \\t]*task:[ \\t]*(.*)$",
    "im"
  ],
  [
    "Trigger",
    "^[ \\t]*trigger:[ \\t]*(.*)$",
    "im"
  ],
  [
    "Inputs",
    "^[ \\t]*inputs:[ \\t]*(.*)$",
    "im"
  ],
  [
    "Constraints",
    "^[ \\t]*constraints:[ \\t]*(.*)$",
    "im"
  ],
  [
    "Tools",
    "^[ \\t]*tools:[ \\t]*(.*)$",
    "im"
  ],
  [
    "Verification",
    "^[ \\t]*verification:[ \\t]*(.*)$",
    "im"
  ],
  [
    "Outcome",
    "^[ \\t]*outcome:[ \\t]*(.*)$",
    "im"
  ]
];
const WARNING_TERMS = [
  "PRIVATE",
  "token_",
  "@example.com"
];
const SK_CREDENTIAL_PATTERN = /(?:^|[^a-z0-9])sk-[a-z0-9_-]{8,}(?=$|[^a-z0-9_-])/i;

export function readInput(file) {
  return fs.readFileSync(file, 'utf8');
}

export function analyzeText(text) {
  const fields = parseFields(text);
  const warnings = WARNING_TERMS.filter((term) => text.toLowerCase().includes(term.toLowerCase()));
  if (SK_CREDENTIAL_PATTERN.test(text)) warnings.push('sk-');
  return {
    title: 'Skill Example Candidate',
    fields,
    warnings,
    risk: warnings.length === 0 ? 'low' : warnings.length < 3 ? 'review' : 'high',
    nextSteps: [
      'Review warnings before reuse',
      'Confirm fixture coverage',
      'Keep external side effects behind approval'
    ]
  };
}

function parseFields(text) {
  const trimmed = text.trimStart();
  if (looksLikeJson(trimmed)) {
    let input;
    try {
      input = JSON.parse(text);
    } catch (error) {
      throw new Error(`invalid JSON input: ${error.message}`);
    }

    if (input === null || Array.isArray(input) || typeof input !== 'object') {
      throw new Error('JSON input must be a non-null, non-array object');
    }

    const supportedLabels = new Map(ROWS.map(([label]) => [label.toLowerCase(), label]));
    const entries = new Map();
    const originalKeys = new Map();
    for (const [key, value] of Object.entries(input)) {
      const normalizedKey = key.toLowerCase();
      const label = supportedLabels.get(normalizedKey);
      if (!label) continue;
      if (entries.has(normalizedKey)) {
        throw new Error(`duplicate JSON property for ${label}: ${originalKeys.get(normalizedKey)}, ${key}`);
      }
      entries.set(normalizedKey, value);
      originalKeys.set(normalizedKey, key);
    }
    return Object.fromEntries(ROWS.map(([label]) => {
      const value = entries.get(label.toLowerCase());
      return [label, normalizeJsonValue(value)];
    }));
  }

  return Object.fromEntries(ROWS.map(([label, source, flags]) => {
    const match = text.match(new RegExp(source, flags));
    return [label, match && match[1] ? clean(match[1]) : 'Not found'];
  }));
}

function looksLikeJson(text) {
  return /^[{["\d-]/.test(text) || /^(?:null|true|false)(?:\s|$)/.test(text);
}

function normalizeJsonValue(value) {
  if (value === null || value === undefined || typeof value === 'object') {
    return 'Not found';
  }
  const normalized = normalizeFieldValue(value);
  return normalized || 'Not found';
}

export function mineExamples(file) {
  return analyzeText(readInput(file));
}

export function toMarkdown(result) {
  const lines = ['# ' + result.title, '', 'Risk: ' + result.risk, '', '## Findings'];
  for (const [key, value] of Object.entries(result.fields)) {
    lines.push('- ' + key + ': ' + escapeMarkdownInline(value));
  }
  lines.push('', '## Warnings');
  if (result.warnings.length === 0) {
    lines.push('- None');
  } else {
    for (const warning of result.warnings) lines.push('- Review term: ' + warning);
  }
  lines.push('', '## Next Steps');
  for (const step of result.nextSteps) lines.push('- ' + step);
  return lines.join('\n') + '\n';
}

function clean(value) {
  return normalizeFieldValue(String(value).replace(/[",]+$/g, ''));
}

function normalizeFieldValue(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

function escapeMarkdownInline(value) {
  return normalizeFieldValue(value).replace(/([\\`*_[\]{}()<>#+\-.!|])/g, '\\$1');
}

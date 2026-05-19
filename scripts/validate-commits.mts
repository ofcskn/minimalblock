#!/usr/bin/env tsx
/**
 * Validates git commits in a range against the Conventional Commits spec.
 * Runs in CI (triggered by changelog.yml) and can be run locally.
 *
 * Usage:
 *   pnpm changelog:validate [from] [to]
 *   pnpm changelog:validate HEAD~10 HEAD
 *   pnpm changelog:validate v0.6.0 HEAD
 *
 * CI: sets GITHUB_BASE_SHA and GITHUB_SHA automatically.
 */

import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const VALID_TYPES = new Set([
  'feat', 'fix', 'perf', 'refactor', 'docs', 'chore', 'test',
  'style', 'build', 'ci', 'revert', 'security', 'deps', 'infra', 'migration',
]);

// ── Types ────────────────────────────────────────────────────────────────────

interface CommitData {
  hash: string;
  subject: string;
  body: string;
}

interface ValidationResult {
  hash: string;
  subject: string;
  valid: boolean;
  breaking: boolean;
  errors: string[];
  warnings: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function exec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: ROOT }).trim();
  } catch {
    return '';
  }
}

const COMMIT_SEP = '\x1e';
const FIELD_SEP  = '\x1f';

function getCommitsInRange(from: string, to: string): CommitData[] {
  const fmt = `${COMMIT_SEP}%h${FIELD_SEP}%s${FIELD_SEP}%b`;
  const log = exec(`git log "${from}".."${to}" --format="${fmt}" --no-merges`);
  if (!log) return [];

  return log
    .split(COMMIT_SEP)
    .filter((b) => b.includes(FIELD_SEP))
    .map((block) => {
      const [hash = '', subject = '', body = ''] = block.trim().split(FIELD_SEP);
      return { hash: hash.trim(), subject: subject.trim(), body: body.trim() };
    });
}

// ── Validation ───────────────────────────────────────────────────────────────

function validateCommit(data: CommitData): ValidationResult {
  const { hash, subject, body } = data;
  const errors:   string[] = [];
  const warnings: string[] = [];

  // Skip merge commits and WIP
  if (/^Merge\s/i.test(subject) || /^wip\b/i.test(subject)) {
    return { hash, subject, valid: true, breaking: false, errors, warnings };
  }

  const headerRe = /^(\w+)(\(([^)]+)\))?(!)?: (.+)$/;
  const match    = subject.match(headerRe);

  if (!match) {
    errors.push(`Does not follow Conventional Commits format: "${subject}"`);
    errors.push('Expected: type(scope): description  e.g. feat(web): add dark mode');
    return { hash, subject, valid: false, breaking: false, errors, warnings };
  }

  const [, type,, scope,, description] = match;
  const typeLower = type.toLowerCase();

  if (!VALID_TYPES.has(typeLower)) {
    errors.push(`Unknown type "${type}". Valid types: ${Array.from(VALID_TYPES).sort().join(', ')}`);
  }

  if (!description?.trim()) {
    errors.push('Description is empty after the colon');
  } else if (description.trim().length < 5) {
    errors.push(`Description too short (${description.trim().length} chars, min 5)`);
  }

  if ((subject ?? '').length > 100) {
    warnings.push(`Header line too long (${subject.length} chars, max 100)`);
  }

  if (/^[A-Z]/.test(description?.trim() ?? '')) {
    warnings.push('Description should begin with a lowercase letter');
  }

  if (description?.trim().endsWith('.')) {
    warnings.push('Description should not end with a period');
  }

  if (scope && scope.includes(' ')) {
    warnings.push(`Scope "${scope}" contains a space — use kebab-case or comma-separated values`);
  }

  const isBreaking =
    /^.+!:/.test(subject) ||
    body.includes('BREAKING CHANGE:');

  return { hash, subject, valid: errors.length === 0, breaking: isBreaking, errors, warnings };
}

// ── Reporter ─────────────────────────────────────────────────────────────────

function report(results: ValidationResult[]): boolean {
  let hasErrors   = false;
  let hasBreaking = false;

  for (const r of results) {
    const icon        = r.valid ? '✓' : '✗';
    const breakingTag = r.breaking ? '  ⚠ BREAKING' : '';
    console.log(`${icon} [${r.hash}] ${r.subject}${breakingTag}`);

    for (const err of r.errors) {
      console.log(`     ✗ ${err}`);
      hasErrors = true;
    }
    for (const warn of r.warnings) {
      console.log(`     ⚠ ${warn}`);
    }

    if (r.breaking) hasBreaking = true;
  }

  const valid   = results.filter((r) => r.valid).length;
  const invalid = results.filter((r) => !r.valid).length;
  const breaking = results.filter((r) => r.breaking).length;

  console.log(`\nResults: ${valid} valid, ${invalid} invalid, ${breaking} breaking`);

  if (hasBreaking) {
    console.log('\n⚠  Breaking changes found — ensure migration notes are in the PR description.');
  }

  if (hasErrors) {
    console.log('\n✗ Commit validation failed.');
    console.log('  Fix messages with: git rebase -i <base> and reword the flagged commits.');
    console.log('  Reference: https://www.conventionalcommits.org/');
  } else {
    console.log('\n✓ All commits are valid.');
  }

  return !hasErrors;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // CI override via environment variables (set by GitHub Actions)
  const ciFrom = process.env['GITHUB_BASE_SHA'];
  const ciTo   = process.env['GITHUB_SHA'];

  const [,, fromArg = 'HEAD~10', toArg = 'HEAD'] = process.argv;
  const from = ciFrom ?? fromArg;
  const to   = ciTo   ?? toArg;

  console.log(`Validating commits: ${from}..${to}\n`);

  const commits = getCommitsInRange(from, to);

  if (!commits.length) {
    console.log('No commits found in range.');
    return;
  }

  const results = commits.map(validateCommit);
  const ok = report(results);

  if (!ok) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });

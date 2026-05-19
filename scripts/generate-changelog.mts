#!/usr/bin/env tsx
/**
 * Automated changelog generator for the minimalblock monorepo.
 *
 * Reads git history, parses Conventional Commits, categorises changes,
 * detects breaking / migration / security notices, and prepends a new
 * version entry to CHANGELOG.md.
 *
 * Usage:
 *   pnpm changelog:generate [version] [from-tag] [to-ref]
 *
 * Examples:
 *   pnpm changelog:generate                  # auto-detect version + last tag
 *   pnpm changelog:generate 0.7.0
 *   pnpm changelog:generate 0.7.0 v0.6.0 HEAD
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CHANGELOG_PATH = resolve(ROOT, 'CHANGELOG.md');

// ── Types ────────────────────────────────────────────────────────────────────

interface CommitInfo {
  hash: string;
  shortHash: string;
  type: string;
  scope: string | null;
  breaking: boolean;
  subject: string;
  body: string;
  author: string;
  email: string;
  date: string;
  prNumber: string | null;
  issues: string[];
}

// ── Section configuration ────────────────────────────────────────────────────

const SECTION_HEADINGS: Record<string, string> = {
  breaking:  '### Breaking Changes',
  security:  '### Security',
  migration: '### Migration Notices',
  feat:      '### Features',
  fix:       '### Bug Fixes',
  perf:      '### Performance Improvements',
  refactor:  '### Refactors',
  docs:      '### Documentation',
  deps:      '### Dependencies',
  infra:     '### Infrastructure',
  ci:        '### CI/CD',
  build:     '### Build System',
  chore:     '### Maintenance',
  style:     '### Code Style',
  test:      '### Tests',
  revert:    '### Reverts',
};

const SECTION_ORDER = Object.keys(SECTION_HEADINGS);

// ── Scope → package name mapping ─────────────────────────────────────────────

const SCOPE_MAP: Record<string, string> = {
  web:      'apps/web',
  api:      'apps/api',
  docs:     'apps/docs',
  ui:       '@minimalblock/ui',
  core:     '@minimalblock/core',
  data:     '@minimalblock/data',
  features: '@minimalblock/features',
  ai:       '@minimalblock/ai',
  trendyol: '@minimalblock/trendyol',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function exec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: ROOT }).trim();
  } catch {
    return '';
  }
}

function getLastTag(): string | null {
  return exec('git describe --tags --abbrev=0 2>/dev/null') || null;
}

function getRepoUrl(): string {
  const remote = exec('git remote get-url origin');
  if (!remote) return 'https://github.com/ofcskn/minimalblock';
  return remote
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\.git$/, '');
}

function getRootVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'));
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

// ── Git log parsing ──────────────────────────────────────────────────────────

const COMMIT_SEP = '\x1e'; // ASCII Record Separator — safe in git format
const FIELD_SEP  = '\x1f'; // ASCII Unit Separator

function getCommits(from: string | null, to: string = 'HEAD'): CommitInfo[] {
  const range = from ? `"${from}".."${to}"` : to;
  const fmt   = `${COMMIT_SEP}%H${FIELD_SEP}%h${FIELD_SEP}%s${FIELD_SEP}%b${FIELD_SEP}%aN${FIELD_SEP}%aE${FIELD_SEP}%aI`;

  const log = exec(`git log ${range} --format="${fmt}" --no-merges`);
  if (!log) return [];

  return log
    .split(COMMIT_SEP)
    .filter((block) => block.includes(FIELD_SEP))
    .map((block) => {
      const parts = block.trim().split(FIELD_SEP);
      const [hash = '', shortHash = '', subject = '', body = '', author = '', email = '', date = ''] = parts;
      return parseCommit({ hash, shortHash, subject, body, author, email, date });
    });
}

function parseCommit(raw: {
  hash: string; shortHash: string; subject: string;
  body: string; author: string; email: string; date: string;
}): CommitInfo {
  // Pattern: type(scope)!: subject (#PR)
  const headerRe = /^(\w+)(\(([^)]+)\))?(!)?: (.+?)(?:\s+\(#(\d+)\))?$/;
  const headerMatch = raw.subject.match(headerRe);

  const prRe    = /\(#(\d+)\)$/;
  const prMatch = raw.subject.match(prRe);

  // Extract issue references from subject + body
  const issues: string[] = [];
  const issueRe = /(?:closes?|fixes?|resolves?)\s+#(\d+)/gi;
  let m: RegExpExecArray | null;
  const fullText = `${raw.subject}\n${raw.body}`;
  while ((m = issueRe.exec(fullText)) !== null) issues.push(m[1]);

  const isBreaking =
    raw.body.includes('BREAKING CHANGE:') ||
    /^.+!:/.test(raw.subject);

  if (!headerMatch) {
    return {
      hash: raw.hash, shortHash: raw.shortHash,
      type: 'chore', scope: null, breaking: isBreaking,
      subject: raw.subject.replace(/\s*\(#\d+\)$/, '').trim(),
      body: raw.body, author: raw.author, email: raw.email, date: raw.date,
      prNumber: prMatch?.[1] ?? null, issues,
    };
  }

  const [, type,, scope, breakingBang, subject, prFromHeader] = headerMatch;
  return {
    hash: raw.hash, shortHash: raw.shortHash,
    type: type.toLowerCase(),
    scope: scope ?? null,
    breaking: isBreaking || !!breakingBang,
    subject: subject.trim(),
    body: raw.body, author: raw.author, email: raw.email, date: raw.date,
    prNumber: prFromHeader ?? prMatch?.[1] ?? null, issues,
  };
}

// ── Entry formatting ─────────────────────────────────────────────────────────

function getAffectedPackages(commit: CommitInfo): string[] {
  if (!commit.scope) return [];
  return commit.scope
    .split(',')
    .map((s) => SCOPE_MAP[s.trim()] ?? s.trim())
    .filter(Boolean);
}

function formatEntry(commit: CommitInfo, repoUrl: string): string {
  const packages = getAffectedPackages(commit);
  const pkgStr   = packages.length ? ` **[${packages.join(', ')}]**` : '';
  const prStr    = commit.prNumber
    ? ` ([#${commit.prNumber}](${repoUrl}/pull/${commit.prNumber}))`
    : '';
  const issueStr = commit.issues.length
    ? ` (closes ${commit.issues.map((i) => `[#${i}](${repoUrl}/issues/${i})`).join(', ')})`
    : '';
  const hashStr  = `[\`${commit.shortHash}\`](${repoUrl}/commit/${commit.hash})`;

  let line = `- ${commit.subject}${pkgStr}${prStr}${issueStr} — ${hashStr}`;

  // Append the first meaningful body line as a blockquote
  const bodyLines = commit.body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('BREAKING CHANGE:') && !l.startsWith('Signed-off-by:'));
  if (bodyLines.length) {
    line += `\n  > ${bodyLines[0]}`;
  }

  // Append migration note for breaking changes
  if (commit.breaking) {
    const breakingLine = commit.body.split('\n').find((l) => l.startsWith('BREAKING CHANGE:'));
    if (breakingLine) {
      line += `\n  > **Migration required:** ${breakingLine.replace('BREAKING CHANGE:', '').trim()}`;
    }
  }

  return line;
}

// ── Special pattern detection ─────────────────────────────────────────────────

interface SpecialPatterns {
  hasMigrations: boolean;
  hasSecurity:   boolean;
  hasEnvChanges: boolean;
  breakingCount: number;
}

function detectSpecialPatterns(commits: CommitInfo[]): SpecialPatterns {
  return {
    hasMigrations: commits.some(
      (c) =>
        c.type === 'migration' ||
        c.scope === 'supabase' ||
        c.scope === 'migrations' ||
        c.subject.toLowerCase().includes('migration'),
    ),
    hasSecurity: commits.some(
      (c) =>
        c.type === 'security' ||
        c.subject.toLowerCase().includes('security') ||
        c.subject.toLowerCase().includes('vulnerability') ||
        c.subject.toLowerCase().includes('cve'),
    ),
    hasEnvChanges: commits.some(
      (c) => c.scope === 'env' || c.subject.toLowerCase().includes('env var'),
    ),
    breakingCount: commits.filter((c) => c.breaking).length,
  };
}

// ── Changelog entry generation ────────────────────────────────────────────────

function generateEntry(version: string, commits: CommitInfo[], repoUrl: string): string {
  const date    = new Date().toISOString().split('T')[0];
  const grouped = new Map<string, CommitInfo[]>();

  // Breaking changes always get their own top section
  const breaking = commits.filter((c) => c.breaking);
  if (breaking.length) grouped.set('breaking', breaking);

  // Group remaining commits by type
  for (const commit of commits) {
    if (commit.breaking) continue;
    const key = SECTION_ORDER.find((t) => t === commit.type) ?? 'chore';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(commit);
  }

  const flags = detectSpecialPatterns(commits);

  // ── Header ────────────────────────────────────────────────────────────────
  let entry = `## [${version}] — ${date}\n\n`;

  if (flags.hasSecurity) {
    entry += `> **Security Update:** This release contains security fixes. Immediate upgrade is recommended.\n\n`;
  }
  if (flags.breakingCount > 0) {
    entry += `> **Breaking Changes (${flags.breakingCount}):** Review the Breaking Changes section and migration notes before upgrading.\n\n`;
  }
  if (flags.hasMigrations) {
    entry += `> **Migration Required:** Run \`pnpm supabase db push\` after upgrading to apply pending database migrations.\n\n`;
  }
  if (flags.hasEnvChanges) {
    entry += `> **Environment Variables:** New or modified env vars in this release — see [\`docs/env-variables.md\`](docs/env-variables.md).\n\n`;
  }

  // ── Sections ──────────────────────────────────────────────────────────────
  for (const sectionType of SECTION_ORDER) {
    const items = grouped.get(sectionType);
    if (!items?.length) continue;
    const heading = SECTION_HEADINGS[sectionType] ?? `### ${sectionType}`;
    entry += `${heading}\n\n${items.map((c) => formatEntry(c, repoUrl)).join('\n')}\n\n`;
  }

  // ── Affected packages summary ─────────────────────────────────────────────
  const scopes = new Set(
    commits.flatMap((c) => (c.scope ? c.scope.split(',').map((s) => s.trim()) : [])),
  );
  if (scopes.size) {
    const pkgList = Array.from(scopes).map((s) => `\`${SCOPE_MAP[s] ?? s}\``).join(', ');
    entry += `### Affected Packages\n\n${pkgList}\n\n`;
  }

  // ── Contributors ──────────────────────────────────────────────────────────
  const contributorMap = new Map<string, string>();
  for (const c of commits) {
    if (!contributorMap.has(c.email)) contributorMap.set(c.email, c.author);
  }
  if (contributorMap.size) {
    const names = Array.from(contributorMap.values()).map((n) => `**${n}**`).join(', ');
    entry += `### Contributors\n\nThank you to ${names} for contributing to this release.\n\n`;
  }

  return entry;
}

// ── CHANGELOG.md update ───────────────────────────────────────────────────────

function prependEntry(entry: string): void {
  const existing = existsSync(CHANGELOG_PATH) ? readFileSync(CHANGELOG_PATH, 'utf-8') : '';

  // Insert after header / before the first ## version entry
  const insertionIdx = existing.indexOf('\n## ');
  const content =
    insertionIdx === -1
      ? existing.trimEnd() + '\n\n' + entry
      : existing.slice(0, insertionIdx) + '\n\n' + entry + existing.slice(insertionIdx + 1);

  writeFileSync(CHANGELOG_PATH, content, 'utf-8');
  console.log(`✓ Updated ${CHANGELOG_PATH}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const [,, versionArg, fromArg, toArg = 'HEAD'] = process.argv;

  const version = versionArg ?? getRootVersion();
  const from    = fromArg    ?? getLastTag();
  const repoUrl = getRepoUrl();

  console.log(`Generating changelog entry for v${version}`);
  console.log(`  Range  : ${from ?? '(beginning)'}..${toArg}`);
  console.log(`  Repo   : ${repoUrl}`);

  const commits = getCommits(from, toArg);
  console.log(`  Commits: ${commits.length}`);

  if (!commits.length) {
    console.log('No commits found — nothing to generate.');
    return;
  }

  const entry = generateEntry(version, commits, repoUrl);
  prependEntry(entry);

  // Print summary
  const { breakingCount, hasSecurity, hasMigrations } = detectSpecialPatterns(commits);
  console.log('\nSummary:');
  console.log(`  Features : ${commits.filter((c) => c.type === 'feat').length}`);
  console.log(`  Fixes    : ${commits.filter((c) => c.type === 'fix').length}`);
  console.log(`  Breaking : ${breakingCount}`);
  console.log(`  Security : ${hasSecurity ? 'yes' : 'no'}`);
  console.log(`  Migration: ${hasMigrations ? 'yes' : 'no'}`);
  console.log(`  Total    : ${commits.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

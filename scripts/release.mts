#!/usr/bin/env tsx
/**
 * Release orchestration script for the minimalblock monorepo.
 *
 * Coordinates version bumping (via Changesets), changelog generation,
 * git tagging, and GitHub Release draft creation.
 *
 * Usage:
 *   pnpm tsx scripts/release.mts [options]
 *
 * Options:
 *   --dry-run      Print commands without executing them
 *   --prerelease   Enter the "next" prerelease channel before versioning
 *   --canary       Publish a canary snapshot (no version commit / tag)
 *   --preid=<id>   Custom prerelease identifier (default: next)
 *
 * Prerequisites:
 *   - gh CLI installed and authenticated
 *   - GITHUB_TOKEN in environment (for GitHub Releases)
 *   - Working tree must be clean
 *   - Must be on "main" or "development" branch
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Types ────────────────────────────────────────────────────────────────────

interface ReleaseOptions {
  dryRun:     boolean;
  prerelease: boolean;
  canary:     boolean;
  preid:      string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function exec(cmd: string, dryRun = false): string {
  if (dryRun) {
    console.log(`  [dry-run] ${cmd}`);
    return '';
  }
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: ROOT, stdio: 'pipe' }).trim();
  } catch (e: unknown) {
    const err = e as { message: string; stdout?: string; stderr?: string };
    console.error(`\n✗ Command failed: ${cmd}`);
    if (err.stdout) process.stderr.write(err.stdout);
    if (err.stderr) process.stderr.write(err.stderr);
    process.exit(1);
  }
}

function log(msg: string): void { console.log(msg); }
function step(msg: string): void { console.log(`\n→ ${msg}`); }

function getRootVersion(): string {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'));
  return (pkg.version as string) ?? '0.0.0';
}

function getLastTag(): string | null {
  return exec('git describe --tags --abbrev=0 2>/dev/null') || null;
}

function getCurrentBranch(): string {
  return exec('git symbolic-ref --short HEAD');
}

function hasUncommittedChanges(): boolean {
  return exec('git status --porcelain') !== '';
}

function hasChangesetFiles(): boolean {
  const dir = resolve(ROOT, '.changeset');
  if (!existsSync(dir)) return false;
  const files = exec(`find .changeset -maxdepth 1 -name "*.md" ! -name "README.md"`);
  return files.length > 0;
}

function getChangelogSection(version: string): string {
  const path = resolve(ROOT, 'CHANGELOG.md');
  if (!existsSync(path)) return `Release v${version}`;

  const content = readFileSync(path, 'utf-8');
  const start   = content.indexOf(`## [${version}]`);
  if (start === -1) return `Release v${version}`;

  const end = content.indexOf('\n## [', start + 1);
  return end === -1
    ? content.slice(start).trim()
    : content.slice(start, end).trim();
}

// ── Release steps ─────────────────────────────────────────────────────────────

function preflight(opts: ReleaseOptions): void {
  const branch = getCurrentBranch();
  log(`Branch: ${branch}`);

  if (!opts.dryRun && !['main', 'development'].includes(branch)) {
    console.error(`✗ Releases must be made from "main" or "development". Current: "${branch}"`);
    process.exit(1);
  }

  if (!opts.dryRun && hasUncommittedChanges()) {
    console.error('✗ Uncommitted changes detected. Commit or stash them before releasing.');
    process.exit(1);
  }

  if (!opts.dryRun && !hasChangesetFiles()) {
    log('⚠  No changeset files found. Creating an empty patch changeset for tracking...');
    exec(`pnpm exec changeset add --empty`, opts.dryRun);
  }
}

function bumpVersions(opts: ReleaseOptions): void {
  step('Bumping package versions via Changesets');

  if (opts.prerelease) {
    exec(`pnpm exec changeset pre enter ${opts.preid}`, opts.dryRun);
  }

  exec('pnpm exec changeset version', opts.dryRun);
  exec('pnpm install --lockfile-only', opts.dryRun);
}

function generateChangelog(version: string, opts: ReleaseOptions): void {
  step(`Generating CHANGELOG.md entry for v${version}`);
  const lastTag = getLastTag();
  const fromArg = lastTag ? ` ${lastTag}` : '';
  exec(`pnpm tsx scripts/generate-changelog.mts ${version}${fromArg}`, opts.dryRun);
}

function commitAndTag(version: string, opts: ReleaseOptions): void {
  const tag = `v${version}`;
  step(`Committing release and tagging ${tag}`);

  exec('git add -A', opts.dryRun);

  const commitMsg = `chore(release): version packages ${tag}`;
  exec(`git commit -m "${commitMsg}"`, opts.dryRun);
  exec(`git tag -a "${tag}" -m "Release ${tag}"`, opts.dryRun);
}

function pushRelease(opts: ReleaseOptions): void {
  const branch = getCurrentBranch();
  step(`Pushing ${branch} with tags`);
  exec(`git push origin ${branch} --follow-tags`, opts.dryRun);
}

function createGitHubReleaseDraft(version: string, opts: ReleaseOptions): void {
  step(`Creating GitHub Release draft for v${version}`);

  const tag          = `v${version}`;
  const releaseNotes = getChangelogSection(version);
  const preFlag      = opts.prerelease ? '--prerelease' : '';
  const notesEscaped = releaseNotes.replace(/`/g, '\\`').replace(/"/g, '\\"');

  exec(
    `gh release create "${tag}" --draft ${preFlag} --title "Release ${tag}" --notes "${notesEscaped}"`,
    opts.dryRun,
  );

  log(`✓ Draft release created at https://github.com/ofcskn/minimalblock/releases`);
}

function publishCanary(opts: ReleaseOptions): void {
  step('Publishing canary snapshot');
  const sha = exec('git rev-parse --short HEAD');

  exec('pnpm exec changeset version --snapshot canary', opts.dryRun);
  exec('pnpm exec changeset publish --tag canary --no-git-tag', opts.dryRun);

  log(`✓ Canary published — tag: canary, SHA: ${sha}`);
}

// ── CLI parsing ───────────────────────────────────────────────────────────────

function parseOptions(): ReleaseOptions {
  const args = process.argv.slice(2);
  return {
    dryRun:     args.includes('--dry-run'),
    prerelease: args.includes('--prerelease'),
    canary:     args.includes('--canary'),
    preid:      args.find((a) => a.startsWith('--preid='))?.split('=')[1] ?? 'next',
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const opts = parseOptions();

  if (opts.dryRun) log('🔍  DRY RUN — no changes will be made\n');

  preflight(opts);

  if (opts.canary) {
    publishCanary(opts);
    return;
  }

  bumpVersions(opts);
  const version = opts.dryRun ? getRootVersion() : getRootVersion();

  log(`\nReleasing v${version}`);

  generateChangelog(version, opts);
  commitAndTag(version, opts);
  pushRelease(opts);
  createGitHubReleaseDraft(version, opts);

  log(`\n✅  Release v${version} complete\n`);
  log('Next steps:');
  log(`  1. Review draft at https://github.com/ofcskn/minimalblock/releases`);
  log('  2. Verify the changelog and release notes');
  log('  3. Publish the release when ready');
}

main().catch((e) => { console.error(e); process.exit(1); });

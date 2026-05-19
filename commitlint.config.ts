import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',      // New user-facing feature
        'fix',       // Bug fix
        'perf',      // Performance improvement
        'refactor',  // Code restructuring (no behaviour change)
        'docs',      // Documentation only
        'chore',     // Build system, tooling, maintenance
        'test',      // Test additions or corrections
        'style',     // Formatting, whitespace (no logic change)
        'build',     // Build scripts and configuration
        'ci',        // CI/CD pipeline changes
        'revert',    // Revert a previous commit
        'security',  // Security patch or hardening
        'deps',      // Dependency updates
        'infra',     // Infrastructure / deployment changes
        'migration', // Database or schema migrations
      ],
    ],
    'scope-enum': [
      1, // warn — allow unknown scopes without blocking
      'always',
      [
        // Applications
        'web', 'api', 'docs',
        // Libraries
        'ui', 'core', 'data', 'features', 'ai', 'trendyol',
        // Cross-cutting
        'deps', 'infra', 'ci', 'auth', 'release', 'workspace',
        'supabase', 'migrations', 'env',
      ],
    ],
    // Subject rules
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-min-length': [2, 'always', 5],
    // Header
    'header-max-length': [2, 'always', 100],
    // Body
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 200],
    // Footer
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 200],
    // Type / scope casing
    'scope-case': [2, 'always', 'lower-case'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
  // Skip WIP commits in local dev
  ignores: [(msg) => msg.startsWith('WIP') || msg.startsWith('wip')],
  helpUrl: 'https://github.com/ofcskn/minimalblock/blob/main/CONTRIBUTING.md#commit-convention',
};

export default config;

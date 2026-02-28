#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const SKILLS_DIR = path.join(ROOT_DIR, 'skills', 'skyfire');
const SKILL_FILE = path.join(SKILLS_DIR, 'SKILL.md');
const RULES_DIR = path.join(SKILLS_DIR, 'rules');

function rebuild() {
  try {
    execSync('npm run build:agents', { cwd: ROOT_DIR, stdio: 'inherit' });
  } catch (_) {
    // Build output already printed by child process.
  }
}

console.log('Watching Skyfire skill files...');
rebuild();

fs.watch(SKILL_FILE, (eventType) => {
  if (eventType === 'change') rebuild();
});

fs.watch(RULES_DIR, { recursive: true }, (_, filename) => {
  if (filename && filename.endsWith('.md')) rebuild();
});

process.stdin.resume();

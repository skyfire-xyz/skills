#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills', 'skyfire');
const SKILL_FILE = path.join(SKILLS_DIR, 'SKILL.md');
const RULES_DIR = path.join(SKILLS_DIR, 'rules');
const OUTPUT_FILE = path.join(SKILLS_DIR, 'AGENTS.md');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontmatterRegex);
  if (!match) return { frontmatter: {}, content };

  const frontmatter = {};
  match[1].split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':');
    if (!key || valueParts.length === 0) return;
    frontmatter[key.trim()] = valueParts.join(':').trim();
  });

  return { frontmatter, content: content.slice(match[0].length) };
}

function extractRuleReferences(markdown) {
  const ruleRegex = /\[([^\]]+)\]\(rules\/([^)]+\.md)\)/g;
  const rules = [];
  let match;

  while ((match = ruleRegex.exec(markdown)) !== null) {
    rules.push({ title: match[1], file: match[2] });
  }

  return rules;
}

function readRuleFile(filename) {
  const fullPath = path.join(RULES_DIR, filename);
  if (!fs.existsSync(fullPath)) {
    log(`Missing rule file: ${filename}`, 'yellow');
    return null;
  }
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const parsed = parseFrontmatter(raw);
  return { filename, frontmatter: parsed.frontmatter, content: parsed.content.trim() };
}

function createAnchor(title) {
  return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

function buildSections(skillBody) {
  const sections = [];
  const sectionRegex = /^### (\d+)\. (.+)$/gm;
  let match;

  while ((match = sectionRegex.exec(skillBody)) !== null) {
    sections.push({
      number: match[1],
      title: match[2],
      startIndex: match.index,
      endIndex: skillBody.length,
      anchor: createAnchor(match[2]),
      rules: []
    });
  }

  for (let i = 0; i < sections.length - 1; i++) {
    sections[i].endIndex = sections[i + 1].startIndex;
  }

  sections.forEach((section) => {
    const chunk = skillBody.slice(section.startIndex, section.endIndex);
    section.rules = extractRuleReferences(chunk).map((rule) => ({
      ...rule,
      anchor: createAnchor(rule.title)
    }));
  });

  return sections;
}

function generateTOC(sections) {
  let out = '## Table of Contents\n\n';
  sections.forEach((section, idx) => {
    out += `${idx + 1}. [${section.title}](#${section.anchor})\n`;
    section.rules.forEach((rule, ridx) => {
      out += `   ${idx + 1}.${ridx + 1}. [${rule.title}](#${rule.anchor})\n`;
    });
    out += '\n';
  });
  return out;
}

function build() {
  log('\nBuilding Skyfire AGENTS.md', 'cyan');
  if (!fs.existsSync(SKILL_FILE)) {
    throw new Error(`SKILL.md not found at ${SKILL_FILE}`);
  }

  const rawSkill = fs.readFileSync(SKILL_FILE, 'utf-8');
  const { frontmatter, content: skillBody } = parseFrontmatter(rawSkill);
  const sections = buildSections(skillBody);

  let out = '';
  out += '---\n';
  Object.entries(frontmatter).forEach(([k, v]) => {
    out += `${k}: ${v}\n`;
  });
  out += '---\n\n';
  out += '# skyfire\n\n';
  out += `${frontmatter.description || ''}\n\n`;

  const whenToUse = skillBody.match(/## When to use([\s\S]*?)(?=##|$)/);
  if (whenToUse) {
    out += '## When to use\n';
    out += `${whenToUse[1].trim()}\n\n`;
  }

  out += generateTOC(sections);
  out += '---\n\n';

  sections.forEach((section) => {
    out += `## ${section.number}. ${section.title}\n\n`;
    out += `<a name="${section.anchor}"></a>\n\n`;
    section.rules.forEach((rule, idx) => {
      const ruleData = readRuleFile(rule.file);
      out += `### ${section.number}.${idx + 1}. ${rule.title}\n\n`;
      out += `<a name="${rule.anchor}"></a>\n\n`;
      if (!ruleData) {
        out += `_Rule file not found: ${rule.file}_\n\n---\n\n`;
        return;
      }
      if (ruleData.frontmatter.impact) {
        out += `**Impact:** ${ruleData.frontmatter.impact}\n\n`;
      }
      if (ruleData.frontmatter.description) {
        out += `> ${ruleData.frontmatter.description}\n\n`;
      }
      out += `${ruleData.content}\n\n---\n\n`;
    });
  });

  const refs = skillBody.match(/## References([\s\S]*?)$/);
  if (refs) {
    out += '## References\n\n';
    out += `${refs[1].trim()}\n\n`;
  }

  out += '_This file is auto-generated. Run `npm run build:agents` after modifying skill rules._\n';

  fs.writeFileSync(OUTPUT_FILE, out, 'utf-8');
  log(`Wrote ${OUTPUT_FILE}`, 'green');
}

try {
  build();
} catch (err) {
  log(`Build failed: ${err.message}`, 'red');
  process.exit(1);
}

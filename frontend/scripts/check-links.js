/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', 'src', 'app');

function getFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const res = path.join(dir, entry.name);
    return entry.isDirectory() ? getFiles(res) : [res];
  });
}

function routeExists(link) {
  const parts = link.split('/').filter(Boolean);
  let current = appDir;
  for (const part of parts) {
    const direct = path.join(current, part);
    if (fs.existsSync(direct)) {
      current = direct;
      continue;
    }
    const entries = fs.readdirSync(current);
    const dynamic = entries.find(e => e.startsWith('[') && e.endsWith(']'));
    if (dynamic) {
      current = path.join(current, dynamic);
    } else {
      return false;
    }
  }
  return fs.existsSync(path.join(current, 'page.tsx'));
}

const files = getFiles(appDir).filter(f => f.endsWith('.tsx'));
const linkRegex = /href="(\/[^"#]+)"/g;
const links = new Set();
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const link = match[1];
    if (!link.startsWith('http') && !link.startsWith('mailto:')) {
      links.add(link);
    }
  }
}

const missing = [];
for (const link of links) {
  if (!routeExists(link)) {
    missing.push(link);
  }
}

console.log('Broken internal links:', missing);

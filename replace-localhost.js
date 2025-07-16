// replace-localhost.js
import fs from 'fs';
import path from 'path';

const rootDir = './src'; // Frontend source folder
const target = 'http://localhost:3000';
const replacement = 'https://backend.gitthit.com.ng';

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes(target)) {
    const updated = content.split(target).join(replacement);
    fs.writeFileSync(filePath, updated, 'utf-8');
    console.log(`✅ Updated: ${filePath}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      replaceInFile(fullPath);
    }
  }
}

// Run replacement
walk(rootDir);
console.log('🎉 All localhost references updated.');

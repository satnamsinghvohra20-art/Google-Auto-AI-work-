/**
 * Dashmesh Properties - Zero-Dependency Automated Backup Utility
 * Creates a timestamped JSON snapshot of all ground-truth business data and configurations.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const BACKUPS_DIR = path.join(ROOT_DIR, 'backups');

if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFolder = path.join(BACKUPS_DIR, `snapshot_${timestamp}`);
fs.mkdirSync(backupFolder, { recursive: true });

console.log(`[Backup Engine] Starting snapshot to: ${backupFolder}`);

// 1. Copy all data/*.json files
if (fs.existsSync(DATA_DIR)) {
  const files = fs.readdirSync(DATA_DIR);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const src = path.join(DATA_DIR, file);
      const dest = path.join(backupFolder, file);
      fs.copyFileSync(src, dest);
      console.log(`  ✓ Backed up: data/${file}`);
    }
  });
}

// 2. Generate backup metadata
const metadata = {
  timestamp: new Date().toISOString(),
  business: 'Dashmesh Properties',
  placeId: 'ChIJDxFBTbyV5zsRcHylJmmARG8',
  files: fs.readdirSync(backupFolder)
};

fs.writeFileSync(path.join(backupFolder, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');

console.log(`[Backup Engine] ✅ Backup completed successfully! (${metadata.files.length} items archived)`);

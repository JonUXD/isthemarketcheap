import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAssetPrices } from '../lib/price-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    console.log('🚀 Starting manual data fetch...');
    
    try {
        // Read current assets
        const assetsPath = path.join(__dirname, '../data/assets.json');
        const fileData = fs.readFileSync(assetsPath, 'utf8');
        const assets = JSON.parse(fileData);
        
        console.log(`📋 Found ${assets.length} assets. Fetching latest prices...`);
        
        // Use EXACT SAME logic as production
        const updatedAssets = await fetchAssetPrices(assets);
        
        // Create backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '../data/backups');
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const backupPath = path.join(backupDir, `assets-backup-${timestamp}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(updatedAssets, null, 2));
        
        console.log(`✅ Backup saved to: ${path.relative(process.cwd(), backupPath)}`);
        
        // Optional: Update main file if --update flag is present
        if (process.argv.includes('--update')) {
            fs.writeFileSync(assetsPath, JSON.stringify(updatedAssets, null, 2));
            console.log(`✨ Main assets file updated at: ${path.relative(process.cwd(), assetsPath)}`);
        } else {
            console.log('💡 Tip: Run with --update to overwrite data/assets.json');
        }
        
    } catch (error) {
        console.error('❌ Error during manual fetch:', error.message);
        process.exit(1);
    }
}

run();

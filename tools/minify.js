#!/usr/bin/env node

/**
 * Pixel Defense Minification Tool with Versioning
 * 
 * This script combines all HTML, CSS, and JavaScript files into a single HTML file.
 * Automatically increments version number with each build.
 * Run from the project root directory: node tools/minify.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const VERSION_FILE = path.join(__dirname, 'version.json');

// JavaScript files to combine in order
const JS_FILES = [
    'config.js',
    'utils.js', 
    'Particle.js',
    'Map.js',
    'Enemy.js',
    'SpecialEnemy.js',
    'Tower.js',
    'Projectile.js',
    'UIManager.js',
    'StorageManager.js',
    'GameEngine.js',
    'FakeAds.js',
    'main.js'
];

function getNextVersion() {
    let versionData;
    
    // Read or create version file
    if (fs.existsSync(VERSION_FILE)) {
        versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8'));
    } else {
        versionData = {
            version: 0.0,
            lastBuild: "",
            buildHistory: []
        };
    }
    
    // Increment version
    versionData.version = Math.round((versionData.version + 0.1) * 10) / 10;
    versionData.lastBuild = new Date().toISOString();
    
    // Add to build history
    versionData.buildHistory.push({
        version: versionData.version,
        date: versionData.lastBuild
    });
    
    // Keep only last 10 builds in history
    if (versionData.buildHistory.length > 10) {
        versionData.buildHistory = versionData.buildHistory.slice(-10);
    }
    
    // Save version file
    fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2));
    
    return versionData.version;
}

function minify() {
    console.log('🚀 Starting minification process...\n');
    
    try {
        // Get next version
        const version = getNextVersion();
        console.log(`📌 Version: ${version}\n`);
        // Read HTML file
        console.log('📄 Reading index.html...');
        const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
        
        // Read CSS file
        console.log('🎨 Reading styles.css...');
        const styles = fs.readFileSync(path.join(ROOT_DIR, 'styles.css'), 'utf-8');
        
        // Combine JavaScript files
        console.log('📦 Combining JavaScript files:');
        let combinedJs = '';
        for (const file of JS_FILES) {
            console.log(`   - ${file}`);
            const filePath = path.join(ROOT_DIR, 'js', file);
            if (!fs.existsSync(filePath)) {
                console.error(`   ⚠️  Warning: ${file} not found, skipping...`);
                continue;
            }
            combinedJs += fs.readFileSync(filePath, 'utf-8') + '\n';
        }
        
        // Process HTML
        console.log('\n🔧 Processing HTML...');
        let minifiedHtml = indexHtml
            // Remove external CSS link
            .replace(/<link rel="stylesheet" href="styles.css">/, `<style>${styles}</style>`)
            // Remove all external script tags
            .replace(/<script src="js\/[^"]+"><\/script>\n?/g, '')
            // Add combined script before closing body tag
            .replace('</body>', `<script>${combinedJs}</script>\n</body>`)
            // Update title with version
            .replace('<title>Pixel Defense</title>', `<title>Pixel Defense v${version}</title>`)
            // Add version meta tag
            .replace('<head>', `<head>\n    <meta name="version" content="${version}">`)
            // Add version comment
            .replace('<!DOCTYPE html>', `<!DOCTYPE html>\n<!-- Pixel Defense v${version} - Built on ${new Date().toISOString()} -->`);
        
        // Create output filename with version
        const outputFileName = `pixel-defense-v${version}.html`;
        const outputPath = path.join(ROOT_DIR, outputFileName);
        
        // Write minified version
        fs.writeFileSync(outputPath, minifiedHtml);
        
        // Also create a copy without version for compatibility
        const latestPath = path.join(ROOT_DIR, 'pixel-defense-minified.html');
        fs.writeFileSync(latestPath, minifiedHtml);
        
        // Calculate file size
        const stats = fs.statSync(outputPath);
        const fileSizeKB = (stats.size / 1024).toFixed(2);
        
        console.log('\n✅ Minification complete!');
        console.log('📊 Files created:');
        console.log(`   - ${outputFileName} (versioned)`);
        console.log(`   - pixel-defense-minified.html (latest)`);
        console.log('📏 File size:', fileSizeKB, 'KB');
        console.log(`🎮 Version ${version} is ready to play!\n`);
        
    } catch (error) {
        console.error('\n❌ Error during minification:', error.message);
        process.exit(1);
    }
}

// Run minification
minify();
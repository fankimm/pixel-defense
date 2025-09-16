#!/usr/bin/env node

/**
 * iOS Safari File Protocol Compatible Version Creator
 * Creates a special version that works when opened as a file in iOS Safari
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

// Read all necessary files
const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
const styles = fs.readFileSync(path.join(ROOT_DIR, 'styles.css'), 'utf-8');

const jsFiles = [
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
    'FakeAds.js'
];

console.log('Creating iOS-compatible version...\n');

// Combine JavaScript files
let combinedJs = '';
for (const file of jsFiles) {
    console.log(`Reading ${file}...`);
    combinedJs += fs.readFileSync(path.join(ROOT_DIR, 'js', file), 'utf-8') + '\n';
}

// Special iOS-compatible initialization
const iosMainJs = `
// iOS Safari File Protocol Initialization
(function() {
    let gameEngine = null;
    let fakeAdManager = null;
    let initAttempts = 0;
    
    function initGame() {
        initAttempts++;
        console.log('Init attempt', initAttempts);
        
        try {
            const canvas = document.getElementById('game-canvas');
            if (!canvas) {
                if (initAttempts < 20) {
                    setTimeout(initGame, 100);
                }
                return;
            }
            
            // Set canvas size explicitly
            canvas.width = 800;
            canvas.height = 600;
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            canvas.style.display = 'block';
            canvas.style.maxWidth = '100vw';
            
            // Initialize game
            gameEngine = new GameEngine();
            
            // Force multiple renders
            if (gameEngine && gameEngine.render) {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        if (gameEngine && gameEngine.render) {
                            gameEngine.render();
                        }
                    }, i * 100);
                }
            }
            
            // Initialize ads with delay
            setTimeout(() => {
                try {
                    fakeAdManager = new FakeAdManager();
                } catch (e) {
                    console.warn('Ad init failed:', e);
                }
            }, 500);
            
            console.log('Game initialized successfully');
            
        } catch (error) {
            console.error('Init error:', error);
            if (initAttempts < 20) {
                setTimeout(initGame, 200);
            }
        }
    }
    
    // Try multiple initialization methods
    function startInit() {
        // Method 1: Immediate
        if (document.getElementById('game-canvas')) {
            initGame();
        }
        
        // Method 2: After tiny delay
        setTimeout(initGame, 10);
        
        // Method 3: After DOM ready
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(initGame, 100);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initGame, 100);
            });
        }
        
        // Method 4: After load
        window.addEventListener('load', () => {
            setTimeout(initGame, 200);
        });
    }
    
    // Start immediately
    startInit();
    
    // iOS-specific touch handling
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // Handle resize
    function handleResize() {
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.width = 800;
            canvas.height = 600;
            if (gameEngine && gameEngine.render) {
                gameEngine.render();
            }
        }
    }
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100);
    });
    
    // Expose for debugging
    window.gameEngine = () => gameEngine;
    window.restartGame = () => {
        initGame();
    };
})();
`;

// iOS-optimized CSS additions
const iosStyles = `
/* iOS Safari File Protocol Fixes */
html, body {
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    position: fixed;
    width: 100%;
    height: 100%;
}

* {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
}

button, .tower-option, .speed-btn {
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    touch-action: manipulation;
}

#game-canvas {
    image-rendering: auto !important;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
}

@supports (-webkit-touch-callout: none) {
    /* iOS-specific styles */
    #game-area {
        -webkit-transform: translate3d(0,0,0);
    }
}
`;

// Process HTML
let iosHtml = indexHtml
    .replace(/<link rel="stylesheet" href="styles.css">/, '')
    .replace(/<script src="js\/[^"]+"><\/script>\n?/g, '')
    .replace('</head>', `
    <style>
        ${styles}
        ${iosStyles}
    </style>
    </head>`)
    .replace('</body>', `
    <script>
        ${combinedJs}
        ${iosMainJs}
    </script>
    </body>`)
    .replace('<title>Pixel Defense</title>', '<title>Pixel Defense (iOS)</title>')
    .replace('<head>', `<head>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="format-detection" content="telephone=no">`);

// Write iOS version
const outputPath = path.join(ROOT_DIR, 'pixel-defense-ios.html');
fs.writeFileSync(outputPath, iosHtml);

const stats = fs.statSync(outputPath);
const fileSizeKB = (stats.size / 1024).toFixed(2);

console.log('\n✅ iOS version created successfully!');
console.log('📱 File: pixel-defense-ios.html');
console.log('📏 Size:', fileSizeKB, 'KB');
console.log('\n📤 Transfer this file to your iOS device via:');
console.log('   - AirDrop');
console.log('   - Email');
console.log('   - iCloud Drive');
console.log('   - Files app');
console.log('\nThen open it directly in Safari!');
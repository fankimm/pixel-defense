#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

console.log('Creating standalone version with inline everything...\n');

// Create a completely self-contained version
const standaloneHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>Pixel Defense Standalone</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { 
            background: #1a1a2e; 
            font-family: -apple-system, sans-serif;
            overflow: hidden;
            position: fixed;
            width: 100%;
            height: 100%;
        }
        #loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 24px;
            text-align: center;
        }
        .hidden { display: none !important; }
    </style>
</head>
<body>
    <div id="loading">
        <div>🎮 Pixel Defense</div>
        <div style="font-size: 14px; margin-top: 10px;">Loading...</div>
        <button onclick="startGame()" style="margin-top: 20px; padding: 10px 20px; font-size: 16px; background: #4ade80; border: none; border-radius: 5px; color: #1a1a2e; font-weight: bold;">
            Start Game
        </button>
    </div>
    
    <div id="game-container" class="hidden">
        <canvas id="game-canvas" width="800" height="600" style="display: block; margin: 0 auto; max-width: 100vw; background: #000;"></canvas>
        <div style="position: fixed; top: 10px; left: 10px; color: white;">
            <div>HP: <span id="hp-display">20</span></div>
            <div>Coins: <span id="coins-display">100</span></div>
            <div>Wave: <span id="wave-display">0</span></div>
        </div>
        <div style="position: fixed; bottom: 10px; width: 100%; text-align: center;">
            <button onclick="gameStart()" style="padding: 10px 20px; margin: 5px; background: #4ade80; border: none; border-radius: 5px; color: #1a1a2e; font-weight: bold;">Start Wave</button>
            <button onclick="setSpeed(1)" style="padding: 10px 20px; margin: 5px; background: #3b82f6; border: none; border-radius: 5px; color: white;">1x</button>
            <button onclick="setSpeed(2)" style="padding: 10px 20px; margin: 5px; background: #3b82f6; border: none; border-radius: 5px; color: white;">2x</button>
            <button onclick="setSpeed(4)" style="padding: 10px 20px; margin: 5px; background: #3b82f6; border: none; border-radius: 5px; color: white;">4x</button>
        </div>
    </div>
    
    <script>
        // Minimal game implementation for iOS file protocol
        let canvas, ctx;
        let gameRunning = false;
        let hp = 20, coins = 100, wave = 0;
        let speedMultiplier = 1;
        let enemies = [];
        let towers = [];
        let path = [
            {x: 0, y: 200},
            {x: 100, y: 200},
            {x: 100, y: 100},
            {x: 300, y: 100},
            {x: 300, y: 400},
            {x: 500, y: 400},
            {x: 500, y: 300},
            {x: 700, y: 300},
            {x: 800, y: 300}
        ];
        
        function startGame() {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('game-container').classList.remove('hidden');
            
            canvas = document.getElementById('game-canvas');
            ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = 800;
            canvas.height = 600;
            
            // Start game loop
            gameLoop();
            
            // Add click handler for tower placement
            canvas.addEventListener('click', handleCanvasClick);
            canvas.addEventListener('touchstart', handleCanvasTouch);
        }
        
        function gameLoop() {
            update();
            render();
            requestAnimationFrame(gameLoop);
        }
        
        function update() {
            // Update enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                enemy.pathIndex = enemy.pathIndex || 0;
                
                if (enemy.pathIndex < path.length - 1) {
                    const target = path[enemy.pathIndex + 1];
                    const dx = target.x - enemy.x;
                    const dy = target.y - enemy.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist > 2) {
                        enemy.x += (dx / dist) * enemy.speed * speedMultiplier;
                        enemy.y += (dy / dist) * enemy.speed * speedMultiplier;
                    } else {
                        enemy.pathIndex++;
                    }
                } else {
                    // Enemy reached end
                    hp--;
                    document.getElementById('hp-display').textContent = hp;
                    enemies.splice(i, 1);
                    
                    if (hp <= 0) {
                        alert('Game Over! Wave: ' + wave);
                        location.reload();
                    }
                }
            }
            
            // Update towers
            towers.forEach(tower => {
                tower.cooldown = tower.cooldown || 0;
                if (tower.cooldown > 0) {
                    tower.cooldown -= speedMultiplier;
                    return;
                }
                
                // Find nearest enemy
                let nearest = null;
                let nearestDist = tower.range;
                
                enemies.forEach(enemy => {
                    const dx = enemy.x - tower.x;
                    const dy = enemy.y - tower.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < nearestDist) {
                        nearest = enemy;
                        nearestDist = dist;
                    }
                });
                
                if (nearest) {
                    // Shoot
                    nearest.hp -= tower.damage;
                    tower.cooldown = 60 / tower.fireRate;
                    
                    if (nearest.hp <= 0) {
                        coins += 10;
                        document.getElementById('coins-display').textContent = coins;
                        enemies.splice(enemies.indexOf(nearest), 1);
                    }
                }
            });
        }
        
        function render() {
            // Clear canvas
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, 800, 600);
            
            // Draw path
            ctx.strokeStyle = '#2a2a3e';
            ctx.lineWidth = 40;
            ctx.beginPath();
            path.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
            
            // Draw towers
            towers.forEach(tower => {
                ctx.fillStyle = tower.color;
                ctx.fillRect(tower.x - 15, tower.y - 15, 30, 30);
                
                // Draw range
                ctx.strokeStyle = tower.color + '33';
                ctx.beginPath();
                ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
                ctx.stroke();
            });
            
            // Draw enemies
            enemies.forEach(enemy => {
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
                ctx.fill();
                
                // Health bar
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(enemy.x - 10, enemy.y - 20, 20, 3);
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(enemy.x - 10, enemy.y - 20, 20 * (enemy.hp / enemy.maxHp), 3);
            });
        }
        
        function gameStart() {
            wave++;
            document.getElementById('wave-display').textContent = wave;
            
            // Spawn enemies
            const enemyCount = 5 + wave * 2;
            for (let i = 0; i < enemyCount; i++) {
                setTimeout(() => {
                    enemies.push({
                        x: path[0].x,
                        y: path[0].y,
                        hp: 50 + wave * 10,
                        maxHp: 50 + wave * 10,
                        speed: 1,
                        color: '#22c55e',
                        pathIndex: 0
                    });
                }, i * 1000 / speedMultiplier);
            }
        }
        
        function handleCanvasClick(e) {
            handleClick(e.offsetX, e.offsetY);
        }
        
        function handleCanvasTouch(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            handleClick(x, y);
        }
        
        function handleClick(x, y) {
            if (coins >= 50) {
                // Place tower
                towers.push({
                    x: x,
                    y: y,
                    damage: 10,
                    range: 100,
                    fireRate: 1,
                    color: '#3b82f6'
                });
                coins -= 50;
                document.getElementById('coins-display').textContent = coins;
            }
        }
        
        function setSpeed(speed) {
            speedMultiplier = speed;
        }
        
        // Auto-start for iOS
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadingDiv = document.getElementById('loading');
                if (loadingDiv && !loadingDiv.classList.contains('hidden')) {
                    // Auto start after 1 second if not started
                    const btn = loadingDiv.querySelector('button');
                    if (btn) {
                        btn.textContent = 'Tap to Start';
                        btn.style.animation = 'pulse 1s infinite';
                    }
                }
            }, 1000);
        });
        
        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }';
        document.head.appendChild(style);
    </script>
</body>
</html>`;

// Write standalone version
const outputPath = path.join(ROOT_DIR, 'pixel-defense-standalone.html');
fs.writeFileSync(outputPath, standaloneHtml);

const stats = fs.statSync(outputPath);
const fileSizeKB = (stats.size / 1024).toFixed(2);

console.log('✅ Standalone version created!');
console.log('📱 File: pixel-defense-standalone.html');
console.log('📏 Size:', fileSizeKB, 'KB');
console.log('\nThis is a simplified version that should work on ANY device,');
console.log('including iOS Safari when opened as a file.');
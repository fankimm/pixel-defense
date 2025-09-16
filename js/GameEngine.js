class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Cannot get 2D context!');
            return;
        }
        
        // Set canvas internal resolution
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        
        // Force canvas to be visible
        this.canvas.style.display = 'block';
        
        this.map = new Map(this.canvas);
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.particleSystem = new ParticleSystem();
        
        this.coins = CONFIG.STARTING_COINS;
        this.playerHp = CONFIG.STARTING_HP;
        this.currentWave = 0;
        this.waveInProgress = false;
        this.gameOver = false;
        
        this.enemySpawnQueue = [];
        this.lastSpawnTime = 0;
        this.speedMultiplier = 1;
        
        // Score and combo system
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.lastKillTime = 0;
        this.COMBO_TIMEOUT = 2000; // 2 seconds to maintain combo
        
        this.storageManager = new StorageManager();
        this.uiManager = new UIManager(this);
        
        this.lastTime = 0;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        // Initial render to ensure canvas is visible
        this.render();
        this.gameLoop(0);
    }
    
    gameLoop(currentTime) {
        if (this.gameOver) return;
        
        const deltaTime = (currentTime - this.lastTime) * this.speedMultiplier;
        this.lastTime = currentTime;
        
        this.update(deltaTime, currentTime);
        this.render();
        
        this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(deltaTime, currentTime) {
        this.spawnEnemies(currentTime);
        
        // Update particle system
        this.particleSystem.update(deltaTime);
        
        this.enemies.forEach(enemy => {
            if (enemy instanceof SpecialEnemy) {
                enemy.update(deltaTime, this.enemies);
            } else {
                enemy.update(deltaTime);
            }
        });
        
        const newProjectiles = [];
        this.towers.forEach(tower => {
            const projectile = tower.update(this.enemies, currentTime, this.speedMultiplier);
            if (projectile) {
                newProjectiles.push(new Projectile(projectile));
            }
        });
        this.projectiles.push(...newProjectiles);
        
        this.projectiles.forEach(projectile => {
            projectile.update(deltaTime, this.enemies);
        });
        
        // Handle combo timeout
        if (this.combo > 0 && Date.now() - this.lastKillTime > this.COMBO_TIMEOUT) {
            this.combo = 0;
        }
        
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.isAlive()) {
                // Enemy killed - update combo and score
                const now = Date.now();
                if (now - this.lastKillTime < this.COMBO_TIMEOUT) {
                    this.combo++;
                } else {
                    this.combo = 1;
                }
                this.lastKillTime = now;
                
                const comboMultiplier = Math.min(this.combo, 10);
                const scoreGain = enemy.reward * comboMultiplier;
                this.score += scoreGain;
                this.coins += enemy.reward;
                
                // Create particle effects
                this.particleSystem.createExplosion(enemy.x, enemy.y, enemy.color);
                this.particleSystem.createCoinEffect(enemy.x, enemy.y);
                this.particleSystem.createDamageText(enemy.x, enemy.y - 20, enemy.reward);
                
                // Handle enemy death special effects (like splitter)
                if (enemy.type === 'splitter') {
                    for (let i = 0; i < enemy.config.splitCount; i++) {
                        const splitEnemy = new Enemy(enemy.config.splitInto, this.map.getPath());
                        splitEnemy.pathIndex = enemy.pathIndex;
                        splitEnemy.x = enemy.x + (Math.random() - 0.5) * 20;
                        splitEnemy.y = enemy.y + (Math.random() - 0.5) * 20;
                        this.enemies.push(splitEnemy);
                    }
                }
                
                return false;
            }
            if (enemy.hasReachedEnd()) {
                this.playerHp--;
                this.combo = 0; // Reset combo on life lost
                if (this.playerHp <= 0) {
                    this.endGame();
                }
                return false;
            }
            return true;
        });
        
        this.projectiles = this.projectiles.filter(proj => proj.isActive());
        
        if (this.waveInProgress && this.enemies.length === 0 && this.enemySpawnQueue.length === 0) {
            this.waveInProgress = false;
        }
        
        this.uiManager.updateDisplay();
    }
    
    render() {
        this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.map.draw();
        
        this.towers.forEach(tower => tower.draw(this.ctx));
        
        if (this.uiManager.selectedTower) {
            this.uiManager.selectedTower.drawSelected(this.ctx);
        }
        
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        
        this.particleSystem.draw(this.ctx);
    }
    
    startWave() {
        if (this.waveInProgress) return;
        
        this.currentWave++;
        this.waveInProgress = true;
        
        const waveConfig = this.getWaveConfig(this.currentWave);
        
        waveConfig.enemies.forEach(group => {
            for (let i = 0; i < group.count; i++) {
                this.enemySpawnQueue.push({
                    type: group.type,
                    spawnTime: Date.now() + (i * group.delay) / this.speedMultiplier,
                    hpMultiplier: group.hpMultiplier,
                    rewardMultiplier: group.rewardMultiplier
                });
            }
        });
        
        this.storageManager.saveHighScore(this.currentWave);
    }
    
    getWaveConfig(waveNumber) {
        const enemies = [];
        const difficulty = Math.floor((waveNumber - 1) / 5);
        const isBoSSWave = waveNumber % 10 === 0;
        
        // Progressive difficulty with variety
        if (waveNumber <= 3) {
            // Early waves - simple enemies
            enemies.push({ 
                type: 'grunt', 
                count: 3 + waveNumber * 2, 
                delay: 1000 
            });
        } else if (waveNumber <= 6) {
            // Introduce fast enemies
            enemies.push({ 
                type: 'grunt', 
                count: 5 + waveNumber, 
                delay: 800 
            });
            enemies.push({ 
                type: 'fast', 
                count: 2 + waveNumber, 
                delay: 600 
            });
        } else if (waveNumber <= 10) {
            // Add tanks and flying
            enemies.push({ 
                type: 'grunt', 
                count: 8 + waveNumber, 
                delay: 700 
            });
            enemies.push({ 
                type: 'fast', 
                count: 4 + waveNumber, 
                delay: 500 
            });
            enemies.push({ 
                type: 'tank', 
                count: 1 + Math.floor(waveNumber / 3), 
                delay: 1200 
            });
            if (waveNumber >= 8) {
                enemies.push({ 
                    type: 'flying', 
                    count: 3 + difficulty, 
                    delay: 800 
                });
            }
        } else {
            // Advanced waves with special enemies
            const baseCount = 10 + waveNumber * 1.5;
            
            enemies.push({ 
                type: 'grunt', 
                count: Math.floor(baseCount * 0.4), 
                delay: Math.max(400, 800 - waveNumber * 5) 
            });
            enemies.push({ 
                type: 'fast', 
                count: Math.floor(baseCount * 0.3), 
                delay: Math.max(300, 600 - waveNumber * 4) 
            });
            enemies.push({ 
                type: 'tank', 
                count: Math.floor(baseCount * 0.15), 
                delay: 1000 
            });
            enemies.push({ 
                type: 'flying', 
                count: Math.floor(baseCount * 0.15), 
                delay: 700 
            });
            
            // Special enemies appear after wave 15
            if (waveNumber >= 15) {
                enemies.push({ 
                    type: 'healer', 
                    count: 1 + Math.floor(difficulty / 2), 
                    delay: 1500 
                });
                enemies.push({ 
                    type: 'stealth', 
                    count: 2 + difficulty, 
                    delay: 900 
                });
            }
            
            if (waveNumber >= 20) {
                enemies.push({ 
                    type: 'splitter', 
                    count: 2 + Math.floor(difficulty / 3), 
                    delay: 1100 
                });
            }
        }
        
        // Boss waves
        if (isBoSSWave) {
            enemies.unshift({ 
                type: 'boss', 
                count: 1 + Math.floor(waveNumber / 20), 
                delay: 2000 
            });
        }
        
        // Scale HP and reward with wave number
        enemies.forEach(group => {
            group.hpMultiplier = 1 + (waveNumber - 1) * 0.1;
            group.rewardMultiplier = 1 + (waveNumber - 1) * 0.05;
        });
        
        return { enemies };
    }
    
    spawnEnemies(currentTime) {
        const toSpawn = [];
        const now = Date.now();
        this.enemySpawnQueue = this.enemySpawnQueue.filter(spawn => {
            if (now >= spawn.spawnTime) {
                toSpawn.push(spawn);
                return false;
            }
            return true;
        });
        
        toSpawn.forEach(spawn => {
            const specialTypes = ['healer', 'splitter', 'stealth', 'boss', 'flying'];
            let enemy;
            
            if (specialTypes.includes(spawn.type)) {
                enemy = new SpecialEnemy(spawn.type, this.map.getPath());
            } else {
                enemy = new Enemy(spawn.type, this.map.getPath());
            }
            
            // Apply HP and reward multipliers
            if (spawn.hpMultiplier) {
                enemy.maxHp = Math.floor(enemy.maxHp * spawn.hpMultiplier);
                enemy.hp = enemy.maxHp;
            }
            if (spawn.rewardMultiplier) {
                enemy.reward = Math.floor(enemy.reward * spawn.rewardMultiplier);
            }
            
            this.enemies.push(enemy);
        });
    }
    
    placeTower(type, gridX, gridY) {
        if (!this.map.isBuildable(gridX, gridY)) return false;
        
        const cost = CONFIG.TOWER_TYPES[type].cost;
        if (this.coins < cost) return false;
        
        if (this.getTowerAt(gridX, gridY)) return false;
        
        const tower = new Tower(type, gridX, gridY);
        this.towers.push(tower);
        this.coins -= cost;
        this.map.setBuildable(gridX, gridY, false);
        
        this.uiManager.deselectTowerType();
        return true;
    }
    
    getTowerAt(gridX, gridY) {
        return this.towers.find(tower => tower.gridX === gridX && tower.gridY === gridY);
    }
    
    sellTower(tower) {
        const index = this.towers.indexOf(tower);
        if (index > -1) {
            this.towers.splice(index, 1);
            this.coins += tower.getSellValue();
            this.map.setBuildable(tower.gridX, tower.gridY, true);
        }
    }
    
    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }
    
    endGame() {
        this.gameOver = true;
        this.storageManager.saveHighScore(this.currentWave);
        this.uiManager.showGameOver();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    setSpeedMultiplier(speed) {
        this.speedMultiplier = speed;
    }
}
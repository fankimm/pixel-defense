class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.selectedTowerType = null;
        this.selectedTower = null;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        document.getElementById('start-wave-btn').addEventListener('click', () => {
            this.gameEngine.startWave();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            location.reload();
        });
        
        // Speed control buttons - add touch support for mobile
        const speedButtons = document.querySelectorAll('.speed-btn');
        speedButtons.forEach(btn => {
            const handleSpeedChange = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const speed = parseFloat(btn.dataset.speed);
                this.gameEngine.setSpeedMultiplier(speed);
                
                // Update button states
                speedButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
            
            // Add both click and touch events
            btn.addEventListener('click', handleSpeedChange);
            btn.addEventListener('touchstart', handleSpeedChange, { passive: false });
        });
        
        // Set initial active state for 1x speed
        document.querySelector('.speed-btn[data-speed="1"]').classList.add('active');
        
        const towerOptions = document.querySelectorAll('.tower-option');
        towerOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectTowerType(option.dataset.towerType);
                towerOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
        
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        
        document.getElementById('upgrade-btn').addEventListener('click', () => {
            this.upgradeTower();
        });
        
        document.getElementById('sell-btn').addEventListener('click', () => {
            this.sellTower();
        });
        
        document.getElementById('close-upgrade-btn').addEventListener('click', () => {
            this.closeUpgradePanel();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeUpgradePanel();
                this.deselectTowerType();
            }
        });
    }
    
    handleCanvasClick(event) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
        const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;
        
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;
        
        this.handleGameClick(canvasX, canvasY);
    }
    
    handleTouch(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = event.target.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
        const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;
        
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;
        
        this.handleGameClick(canvasX, canvasY);
    }
    
    handleGameClick(x, y) {
        const gridPos = Utils.pixelToGrid(x, y);
        
        const clickedTower = this.gameEngine.getTowerAt(gridPos.x, gridPos.y);
        if (clickedTower) {
            this.selectTower(clickedTower);
            return;
        }
        
        if (this.selectedTowerType) {
            this.gameEngine.placeTower(this.selectedTowerType, gridPos.x, gridPos.y);
        } else {
            this.closeUpgradePanel();
        }
    }
    
    selectTowerType(type) {
        this.selectedTowerType = type;
        this.closeUpgradePanel();
    }
    
    deselectTowerType() {
        this.selectedTowerType = null;
        document.querySelectorAll('.tower-option').forEach(opt => {
            opt.classList.remove('selected');
        });
    }
    
    selectTower(tower) {
        this.selectedTower = tower;
        this.showUpgradePanel(tower);
    }
    
    showUpgradePanel(tower) {
        const panel = document.getElementById('upgrade-panel');
        panel.classList.remove('hidden');
        
        document.getElementById('tower-level').textContent = tower.level;
        document.getElementById('tower-damage').textContent = tower.damage;
        document.getElementById('tower-range').textContent = Math.floor(tower.range);
        document.getElementById('upgrade-cost').textContent = tower.getUpgradeCost();
        document.getElementById('sell-value').textContent = tower.getSellValue();
        
        const upgradeBtn = document.getElementById('upgrade-btn');
        if (this.gameEngine.coins >= tower.getUpgradeCost()) {
            upgradeBtn.disabled = false;
        } else {
            upgradeBtn.disabled = true;
        }
    }
    
    closeUpgradePanel() {
        document.getElementById('upgrade-panel').classList.add('hidden');
        this.selectedTower = null;
    }
    
    upgradeTower() {
        if (!this.selectedTower) return;
        
        const cost = this.selectedTower.getUpgradeCost();
        if (this.gameEngine.spendCoins(cost)) {
            this.selectedTower.upgrade();
            this.showUpgradePanel(this.selectedTower);
        }
    }
    
    sellTower() {
        if (!this.selectedTower) return;
        
        this.gameEngine.sellTower(this.selectedTower);
        this.closeUpgradePanel();
    }
    
    updateDisplay() {
        const waveDisplay = document.getElementById('wave-display');
        if (waveDisplay) waveDisplay.textContent = this.gameEngine.currentWave;
        
        // Update HP bar
        const maxHp = 20; // Starting HP
        const currentHp = this.gameEngine.playerHp;
        const hpPercentage = Math.max(0, (currentHp / maxHp) * 100);
        
        const hpDisplay = document.getElementById('hp-display');
        const hpText = document.getElementById('hp-text');
        const hpFill = document.getElementById('hp-fill');
        
        if (hpDisplay) hpDisplay.textContent = currentHp;
        if (hpText) hpText.innerHTML = `HP: ${currentHp}/${maxHp}`;
        if (hpFill) {
            hpFill.style.width = hpPercentage + '%';
            
            // Change color based on HP level
            if (hpPercentage > 50) {
                hpFill.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
            } else if (hpPercentage > 25) {
                hpFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
            } else {
                hpFill.style.background = 'linear-gradient(90deg, #dc2626, #ef4444)';
            }
        }
        
        const coinsDisplay = document.getElementById('coins-display');
        const scoreDisplay = document.getElementById('score-display');
        
        if (coinsDisplay) coinsDisplay.textContent = this.gameEngine.coins;
        if (scoreDisplay) scoreDisplay.textContent = this.gameEngine.score.toLocaleString();
        
        // Update combo display
        const comboDisplay = document.getElementById('combo-display');
        if (this.gameEngine.combo > 1) {
            comboDisplay.style.display = 'flex';
            document.getElementById('combo-multiplier').textContent = Math.min(this.gameEngine.combo, 10);
        } else {
            comboDisplay.style.display = 'none';
        }
        
        const startBtn = document.getElementById('start-wave-btn');
        if (this.gameEngine.waveInProgress) {
            startBtn.disabled = true;
            startBtn.textContent = 'Wave in Progress';
        } else {
            startBtn.disabled = false;
            startBtn.textContent = 'Start Wave';
        }
    }
    
    showGameOver() {
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('final-wave').textContent = this.gameEngine.currentWave;
        document.getElementById('high-score').textContent = this.gameEngine.storageManager.getHighScore();
    }
}
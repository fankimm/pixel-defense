class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.selectedTowerType = null;
        this.selectedTower = null;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Initial affordability update
        this.updateTowerAffordability();

        document.getElementById('start-wave-btn').addEventListener('click', () => {
            this.gameEngine.startWave();
        });

        // Auto wave toggle
        const autoWaveCheckbox = document.getElementById('auto-wave-checkbox');
        autoWaveCheckbox.addEventListener('change', (e) => {
            this.gameEngine.setAutoWave(e.target.checked);
        });
        // Restore auto wave state
        autoWaveCheckbox.checked = this.gameEngine.autoWaveEnabled;

        // Hamburger menu functionality
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileNewGameBtn = document.getElementById('mobile-new-game-btn');
        const mobileLanguageSelector = document.getElementById('mobile-language-selector');

        if (hamburgerBtn && mobileMenu) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                hamburgerBtn.classList.toggle('active');
                mobileMenu.classList.toggle('active');

                // Force style update for file:// protocol compatibility
                if (mobileMenu.classList.contains('active')) {
                    mobileMenu.style.display = 'block';
                    const rect = mobileMenu.getBoundingClientRect();
                    console.log('Menu position:', {
                        top: rect.top,
                        right: rect.right,
                        bottom: rect.bottom,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        visible: rect.width > 0 && rect.height > 0,
                        inViewport: rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth
                    });
                    console.log('Menu computed styles:', {
                        display: window.getComputedStyle(mobileMenu).display,
                        visibility: window.getComputedStyle(mobileMenu).visibility,
                        opacity: window.getComputedStyle(mobileMenu).opacity,
                        zIndex: window.getComputedStyle(mobileMenu).zIndex,
                        position: window.getComputedStyle(mobileMenu).position,
                        backgroundColor: window.getComputedStyle(mobileMenu).backgroundColor
                    });
                } else {
                    mobileMenu.style.display = 'none';
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    hamburgerBtn.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    mobileMenu.style.display = 'none';
                }
            });
        }

        // Mobile new game button
        if (mobileNewGameBtn) {
            mobileNewGameBtn.addEventListener('click', () => {
                if (confirm(i18n.t('confirmNewGame') || 'Start a new game? Current progress will be lost.')) {
                    this.gameEngine.restartGame();
                    // Close menu after action
                    hamburgerBtn.classList.remove('active');
                    mobileMenu.classList.remove('active');
                }
            });
        }

        // Mobile language selector
        if (mobileLanguageSelector) {
            // Set current language
            mobileLanguageSelector.value = i18n.currentLang;

            mobileLanguageSelector.addEventListener('change', (e) => {
                i18n.changeLanguage(e.target.value);
                // Update desktop selector too
                const desktopSelector = document.getElementById('language-selector');
                if (desktopSelector) {
                    desktopSelector.value = e.target.value;
                }
                // Update mobile menu text
                mobileNewGameBtn.textContent = i18n.t('newGame');
                document.querySelector('.mobile-menu-label').textContent = i18n.t('language') + ':';
            });
        }
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            location.reload();
        });

        // New game button - remove old listener first to prevent duplicates
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            // Store handler as a property to be able to remove it
            if (this.newGameHandler) {
                newGameBtn.removeEventListener('click', this.newGameHandler);
            }
            this.newGameHandler = () => {
                if (confirm(i18n.t('confirmNewGame') || 'Start a new game? Current progress will be lost.')) {
                    this.gameEngine.restartGame();
                }
            };
            newGameBtn.addEventListener('click', this.newGameHandler);
        }
        
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

        // Update title
        panel.querySelector('h4').textContent = i18n.t('towerUpgrade');

        // Update labels in upgrade info
        const upgradeInfo = panel.querySelector('.upgrade-info');
        upgradeInfo.innerHTML = `
            <div>${i18n.t('level')}: <span id="tower-level">${tower.level}</span></div>
            <div>${i18n.t('damage')}: <span id="tower-damage">${tower.damage}</span></div>
            <div>${i18n.t('range')}: <span id="tower-range">${Math.floor(tower.range)}</span></div>
        `;

        // Update buttons
        document.getElementById('upgrade-btn').innerHTML = `${i18n.t('upgrade')} (💰 <span id="upgrade-cost">${tower.getUpgradeCost()}</span>)`;
        document.getElementById('sell-btn').innerHTML = `${i18n.t('sell')} (💰 <span id="sell-value">${tower.getSellValue()}</span>)`;
        document.getElementById('close-upgrade-btn').textContent = i18n.t('close');
        
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
        if (hpText) hpText.innerHTML = `${i18n.t('hp')}: ${currentHp}/${maxHp}`;
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

        if (coinsDisplay) coinsDisplay.textContent = this.gameEngine.coins;

        // Update tower panel affordability
        this.updateTowerAffordability();

        const startBtn = document.getElementById('start-wave-btn');
        if (this.gameEngine.waveInProgress) {
            startBtn.disabled = true;
            startBtn.textContent = i18n.t('waveInProgress');
        } else {
            startBtn.disabled = false;
            startBtn.textContent = i18n.t('startWave');
        }
    }
    
    showGameOver() {
        const gameOverScreen = document.getElementById('game-over-screen');
        gameOverScreen.classList.remove('hidden');

        // Update game over text
        gameOverScreen.querySelector('h2').textContent = i18n.t('gameOver');

        // Update wave reached message
        const finalWaveP = gameOverScreen.querySelector('p:nth-of-type(1)');
        finalWaveP.innerHTML = `${i18n.t('youReachedWave')} <span id="final-wave">${this.gameEngine.currentWave}</span>`;

        // Update high score message
        const highScoreP = gameOverScreen.querySelector('p:nth-of-type(2)');
        highScoreP.innerHTML = `${i18n.t('highScore')} <span id="high-score">${this.gameEngine.storageManager.getHighScore()}</span>`;

        // Update play again button
        document.getElementById('restart-btn').textContent = i18n.t('playAgain');
    }

    updateTowerAffordability() {
        const towerOptions = document.querySelectorAll('.tower-option');
        towerOptions.forEach(option => {
            const towerType = option.dataset.towerType;
            const cost = CONFIG.TOWER_TYPES[towerType].cost;

            if (this.gameEngine.coins >= cost) {
                option.classList.remove('unaffordable');
                option.classList.add('affordable');
            } else {
                option.classList.remove('affordable');
                option.classList.add('unaffordable');
            }
        });
    }
}
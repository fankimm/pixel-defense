class ComboSystem {
    constructor() {
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboTimeout = 2000; // 2 seconds to maintain combo
        this.lastKillTime = 0;
        this.maxCombo = 0;
        this.totalCombos = 0;

        // Combo multipliers
        this.comboMultipliers = {
            5: { bonus: 1.2, message: 'Nice!' },
            10: { bonus: 1.5, message: 'Great!' },
            15: { bonus: 2.0, message: 'Amazing!' },
            20: { bonus: 2.5, message: 'Incredible!' },
            30: { bonus: 3.0, message: 'UNSTOPPABLE!' },
            50: { bonus: 5.0, message: 'GODLIKE!!!' }
        };

        this.comboEffects = [];
        this.initUI();
    }

    initUI() {
        // Add combo display to UI
        const comboDisplay = document.createElement('div');
        comboDisplay.id = 'combo-display';
        comboDisplay.style.cssText = `
            position: absolute;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 24px;
            font-weight: bold;
            color: #ffd700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            z-index: 1000;
            display: none;
            animation: pulse 0.5s ease-in-out;
        `;

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(comboDisplay);
        }

        // Add CSS animation
        if (!document.getElementById('combo-styles')) {
            const style = document.createElement('style');
            style.id = 'combo-styles';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: translateX(-50%) scale(1); }
                    50% { transform: translateX(-50%) scale(1.2); }
                    100% { transform: translateX(-50%) scale(1); }
                }

                @keyframes comboFloat {
                    0% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                }

                .combo-popup {
                    position: absolute;
                    font-size: 18px;
                    font-weight: bold;
                    color: #ffff00;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                    pointer-events: none;
                    animation: comboFloat 1s ease-out forwards;
                    z-index: 999;
                }
            `;
            document.head.appendChild(style);
        }
    }

    addKill(enemyX, enemyY, baseReward) {
        const now = Date.now();

        // Check if combo continues
        if (now - this.lastKillTime < this.comboTimeout) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }

        this.lastKillTime = now;
        this.comboTimer = this.comboTimeout;

        // Update max combo
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }

        // Calculate bonus
        let bonusMultiplier = 1;
        let comboMessage = '';

        for (const [threshold, data] of Object.entries(this.comboMultipliers).reverse()) {
            if (this.comboCount >= parseInt(threshold)) {
                bonusMultiplier = data.bonus;
                comboMessage = data.message;
                break;
            }
        }

        // Update display
        this.updateDisplay(comboMessage);

        // Create visual effect at enemy position
        if (this.comboCount > 1) {
            this.createComboEffect(enemyX, enemyY, this.comboCount);
        }

        // Return bonus coins
        const bonusCoins = Math.floor(baseReward * (bonusMultiplier - 1));
        if (bonusCoins > 0) {
            this.totalCombos += bonusCoins;
        }

        return bonusCoins;
    }

    update(deltaTime) {
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;

            if (this.comboTimer <= 0) {
                this.comboCount = 0;
                this.hideDisplay();
            }
        }

        // Update combo effects
        this.comboEffects = this.comboEffects.filter(effect => {
            effect.lifetime -= deltaTime;
            return effect.lifetime > 0;
        });
    }

    updateDisplay(message) {
        const display = document.getElementById('combo-display');
        if (!display) return;

        if (this.comboCount > 1) {
            display.style.display = 'block';
            display.innerHTML = `
                <div style="font-size: 32px;">COMBO x${this.comboCount}</div>
                ${message ? `<div style="font-size: 20px; color: #ff6b6b;">${message}</div>` : ''}
            `;

            // Trigger animation
            display.style.animation = 'none';
            setTimeout(() => {
                display.style.animation = 'pulse 0.5s ease-in-out';
            }, 10);
        }
    }

    hideDisplay() {
        const display = document.getElementById('combo-display');
        if (display) {
            display.style.display = 'none';
        }
    }

    createComboEffect(x, y, count) {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        const popup = document.createElement('div');
        popup.className = 'combo-popup';
        popup.textContent = `+COMBO x${count}`;
        popup.style.left = (x * rect.width / CONFIG.CANVAS_WIDTH) + 'px';
        popup.style.top = (y * rect.height / CONFIG.CANVAS_HEIGHT) + 'px';

        if (count >= 20) {
            popup.style.fontSize = '24px';
            popup.style.color = '#ff00ff';
        } else if (count >= 10) {
            popup.style.fontSize = '20px';
            popup.style.color = '#00ffff';
        }

        canvas.parentElement.appendChild(popup);

        // Remove after animation
        setTimeout(() => {
            popup.remove();
        }, 1000);

        // Add to effects array for canvas rendering
        this.comboEffects.push({
            x: x,
            y: y,
            count: count,
            lifetime: 1000
        });
    }

    draw(ctx) {
        // Draw combo effects on canvas
        this.comboEffects.forEach(effect => {
            const alpha = effect.lifetime / 1000;
            ctx.save();
            ctx.globalAlpha = alpha;

            // Draw combo ring effect
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, 30 * (1 - alpha), 0, Math.PI * 2);
            ctx.stroke();

            // Draw combo text
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`x${effect.count}`, effect.x, effect.y - 20 * (1 - alpha));

            ctx.restore();
        });
    }

    getStats() {
        return {
            maxCombo: this.maxCombo,
            currentCombo: this.comboCount,
            totalBonusCoins: this.totalCombos
        };
    }

    reset() {
        this.comboCount = 0;
        this.comboTimer = 0;
        this.lastKillTime = 0;
        this.comboEffects = [];
        this.hideDisplay();
    }
}
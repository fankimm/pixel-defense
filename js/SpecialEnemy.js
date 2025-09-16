class SpecialEnemy extends Enemy {
    constructor(type, path) {
        super(type, path);
        
        // Special enemy properties
        this.isFlying = this.config.flying || false;
        this.isStealthed = false;
        this.isPoisoned = false;
        this.isFrozen = false;
        this.shield = 0;
        
        // Initialize special abilities
        this.initSpecialAbilities();
    }
    
    initSpecialAbilities() {
        switch(this.type) {
            case 'healer':
                this.lastHealTime = Date.now();
                break;
            case 'stealth':
                this.lastStealthToggle = Date.now();
                this.isStealthed = true;
                break;
            case 'boss':
                this.shield = this.config.shieldHp;
                this.isEnraged = false;
                break;
        }
    }
    
    update(deltaTime, enemies) {
        if (!this.alive || this.reachedEnd) return;
        
        // Handle special abilities
        this.handleSpecialAbilities(enemies);
        
        // Apply status effects
        this.applyStatusEffects(deltaTime);
        
        // Normal movement (with speed modifiers)
        const speedModifier = this.isFrozen ? 0.5 : 1;
        const effectiveSpeed = this.speed * speedModifier;
        
        // Move along path with better handling for high speeds (same as Enemy)
        const moveDistance = effectiveSpeed * deltaTime / 1000;
        let remainingDistance = moveDistance;

        while (remainingDistance > 0 && this.pathIndex < this.path.length) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= remainingDistance || distance < 2) {
                // Move to target and continue to next point
                this.x = this.targetX;
                this.y = this.targetY;
                remainingDistance -= distance;

                this.pathIndex++;
                if (this.pathIndex >= this.path.length) {
                    this.reachedEnd = true;
                    return;
                }

                this.targetX = this.path[this.pathIndex].x;
                this.targetY = this.path[this.pathIndex].y;
            } else {
                // Move partial distance towards target
                const ratio = remainingDistance / distance;
                this.x += dx * ratio;
                this.y += dy * ratio;
                remainingDistance = 0;
            }
        }
    }
    
    handleSpecialAbilities(enemies) {
        const now = Date.now();
        
        switch(this.type) {
            case 'healer':
                if (now - this.lastHealTime >= this.config.healInterval) {
                    this.healNearbyEnemies(enemies);
                    this.lastHealTime = now;
                }
                break;
                
            case 'stealth':
                const timeSinceToggle = now - this.lastStealthToggle;
                if (this.isStealthed && timeSinceToggle >= this.config.stealthDuration) {
                    this.isStealthed = false;
                    this.lastStealthToggle = now;
                } else if (!this.isStealthed && timeSinceToggle >= this.config.visibleDuration) {
                    this.isStealthed = true;
                    this.lastStealthToggle = now;
                }
                break;
                
            case 'boss':
                if (!this.isEnraged && this.hp <= this.maxHp * this.config.rageThreshold) {
                    this.enterRageMode();
                }
                break;
        }
    }
    
    healNearbyEnemies(enemies) {
        enemies.forEach(enemy => {
            if (enemy === this || !enemy.isAlive()) return;
            
            const distance = Utils.distance(this.x, this.y, enemy.x, enemy.y);
            if (distance <= this.config.healRadius) {
                enemy.hp = Math.min(enemy.hp + this.config.healAmount, enemy.maxHp);
            }
        });
    }
    
    enterRageMode() {
        this.isEnraged = true;
        this.speed *= 2;
        this.color = '#dc2626';
    }
    
    applyStatusEffects(deltaTime) {
        if (this.isPoisoned && this.poisonEndTime) {
            if (Date.now() < this.poisonEndTime) {
                this.hp -= this.poisonDamage * deltaTime / 1000;
                if (this.hp <= 0) {
                    this.alive = false;
                }
            } else {
                this.isPoisoned = false;
            }
        }
        
        if (this.isFrozen && this.freezeEndTime) {
            if (Date.now() >= this.freezeEndTime) {
                this.isFrozen = false;
            }
        }
    }
    
    takeDamage(damage, damageType = 'normal') {
        // Shield absorbs damage first (boss only)
        if (this.shield > 0) {
            const shieldDamage = Math.min(damage, this.shield);
            this.shield -= shieldDamage;
            damage -= shieldDamage;
        }
        
        // Stealth enemies take reduced damage when stealthed
        if (this.isStealthed) {
            damage *= 0.5;
        }
        
        // Apply damage
        this.hp -= damage;
        if (this.hp <= 0) {
            this.alive = false;
            
            // Splitter enemies spawn smaller enemies on death
            if (this.type === 'splitter') {
                return {
                    shouldSplit: true,
                    splitType: this.config.splitInto,
                    splitCount: this.config.splitCount,
                    position: { x: this.x, y: this.y },
                    pathIndex: this.pathIndex
                };
            }
            
            return true;
        }
        return false;
    }
    
    applyFreeze(duration, slowEffect) {
        this.isFrozen = true;
        this.freezeEndTime = Date.now() + duration;
        this.freezeSlowEffect = slowEffect;
    }
    
    applyPoison(damage, duration) {
        this.isPoisoned = true;
        this.poisonDamage = damage;
        this.poisonEndTime = Date.now() + duration;
    }
    
    draw(ctx) {
        if (!this.alive) return;
        
        // Stealth effect
        if (this.isStealthed) {
            ctx.globalAlpha = 0.3;
        }
        
        // Draw shield for boss
        if (this.shield > 0) {
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2 * (this.shield / this.config.shieldHp));
            ctx.stroke();
        }
        
        // Draw healing aura
        if (this.type === 'healer') {
            ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.config.healRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Main enemy body
        ctx.fillStyle = this.color;
        if (this.isPoisoned) {
            ctx.fillStyle = '#84cc16';
        }
        if (this.isFrozen) {
            ctx.fillStyle = '#93c5fd';
        }
        
        ctx.beginPath();
        if (this.isFlying) {
            // Draw as diamond for flying enemies
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
            ctx.restore();
        } else {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Health bar
        if (this.hp < this.maxHp) {
            Utils.drawHealthBar(ctx, this.x, this.y - this.size - 10, 30, 4, this.hp, this.maxHp);
        }
        
        // Boss crown
        if (this.type === 'boss') {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(this.x - 10, this.y - this.size - 5);
            ctx.lineTo(this.x - 5, this.y - this.size - 12);
            ctx.lineTo(this.x, this.y - this.size - 8);
            ctx.lineTo(this.x + 5, this.y - this.size - 12);
            ctx.lineTo(this.x + 10, this.y - this.size - 5);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
    
    canBeTargeted() {
        return this.alive && !this.isStealthed;
    }
}
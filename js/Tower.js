class Tower {
    constructor(type, gridX, gridY) {
        this.type = type;
        this.gridX = gridX;
        this.gridY = gridY;
        
        const pixelPos = Utils.gridToPixel(gridX, gridY);
        this.x = pixelPos.x;
        this.y = pixelPos.y;
        
        this.level = 1;
        this.config = { ...CONFIG.TOWER_TYPES[type] };
        
        this.range = this.config.range;
        this.damage = this.config.damage;
        this.fireRate = this.config.fireRate;
        this.color = this.config.color;
        
        this.target = null;
        this.lastFireTime = 0;
        this.rotation = 0;

        // Special tower properties
        this.laserBeamActive = false;
        this.poisonTargets = [];
        this.freezeTargets = [];
        this.chainTargets = [];
    }
    
    update(enemies, gameTime, deltaTime, weatherEffects) {
        this.findTarget(enemies, weatherEffects);

        if (this.target && this.target.isAlive()) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            this.rotation = Math.atan2(dy, dx);

            // Use game time for consistent firing regardless of speed
            const fireDelay = 1000 / this.fireRate;
            if (gameTime - this.lastFireTime >= fireDelay) {
                const projectile = this.createProjectile(weatherEffects);
                this.lastFireTime = gameTime;
                return projectile;
            }
        }
        
        return null;
    }
    
    findTarget(enemies, weatherEffects = {}) {
        let targetEnemy = null;
        let lowestHp = Infinity;

        const validEnemies = [];
        const effectiveRange = this.range * (weatherEffects.towerRangeMultiplier || 1);

        for (const enemy of enemies) {
            if (!enemy.isAlive()) continue;

            // Check if enemy can be targeted (handles stealth)
            if (enemy.canBeTargeted && !enemy.canBeTargeted()) continue;

            // Flying enemies can only be hit by certain towers
            if (enemy.isFlying && !this.canHitFlying()) continue;

            const distance = Utils.distance(this.x, this.y, enemy.x, enemy.y);
            if (distance <= effectiveRange) {
                validEnemies.push(enemy);
            }
        }

        // Target enemy with lowest HP
        for (const enemy of validEnemies) {
            if (enemy.hp < lowestHp) {
                lowestHp = enemy.hp;
                targetEnemy = enemy;
            }
        }

        this.target = targetEnemy;
    }
    
    canHitFlying() {
        // Only sniper, laser, and chain towers can hit flying enemies
        return ['sniper', 'laser', 'chain'].includes(this.type);
    }
    
    createProjectile(weatherEffects = {}) {
        if (!this.target) return null;

        const damageMultiplier = weatherEffects.towerDamageMultiplier || 1;

        return {
            x: this.x,
            y: this.y,
            targetEnemy: this.target,
            damage: Math.round(this.damage * damageMultiplier),
            speed: this.config.projectileSpeed,
            color: this.color,
            type: this.type,
            splashRadius: this.config.splashRadius || 0
        };
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw range indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.arc(0, 0, this.range, 0, Math.PI * 2);
        ctx.fill();

        // Draw special effects based on tower type
        this.drawSpecialEffects(ctx);

        // Draw tower base
        ctx.fillStyle = this.color;
        ctx.fillRect(-15, -15, 30, 30);

        // Draw tower barrel/weapon
        ctx.rotate(this.rotation);
        if (this.type === 'laser') {
            // Laser tower has a crystal instead of barrel
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(10, -5);
            ctx.lineTo(10, 5);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(10, -3, 20, 6);
        }

        ctx.restore();

        // Draw level indicator
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${this.level}`, this.x, this.y - 20);

        // Draw laser beam if active
        if (this.type === 'laser' && this.target && this.target.isAlive()) {
            this.drawLaserBeam(ctx);
        }
    }

    drawSpecialEffects(ctx) {
        switch(this.type) {
            case 'poison':
                // Draw poison aura
                ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
                ctx.beginPath();
                ctx.arc(0, 0, this.range * 0.8, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'freeze':
                // Draw ice crystals
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
                ctx.lineWidth = 1;
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(angle) * 20, Math.sin(angle) * 20);
                    ctx.stroke();
                }
                break;

            case 'splash':
                // Draw explosion indicator
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(0, 0, this.config.splashRadius || 50, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                break;
        }
    }

    drawLaserBeam(ctx) {
        if (!this.target) return;

        ctx.save();

        // Create gradient for laser beam
        const gradient = ctx.createLinearGradient(this.x, this.y, this.target.x, this.target.y);
        gradient.addColorStop(0, 'rgba(236, 72, 153, 0.8)');
        gradient.addColorStop(0.5, 'rgba(236, 72, 153, 1)');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.8)');

        // Draw main beam
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.target.x, this.target.y);
        ctx.stroke();

        // Draw beam glow
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.target.x, this.target.y);
        ctx.stroke();

        // Draw impact point
        ctx.fillStyle = 'rgba(236, 72, 153, 0.8)';
        ctx.beginPath();
        ctx.arc(this.target.x, this.target.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
    
    drawSelected(ctx) {
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        ctx.strokeRect(
            this.gridX * CONFIG.GRID_SIZE,
            this.gridY * CONFIG.GRID_SIZE,
            CONFIG.GRID_SIZE,
            CONFIG.GRID_SIZE
        );
        
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    upgrade() {
        this.level++;
        this.damage = Math.floor(this.damage * 1.3);
        this.range = Math.floor(this.range * 1.1);
        this.fireRate = this.fireRate * 1.15;
    }
    
    getUpgradeCost() {
        return this.config.upgradeCost * this.level;
    }
    
    getSellValue() {
        return this.config.sellValue + (this.level - 1) * Math.floor(this.config.upgradeCost * 0.5);
    }
}
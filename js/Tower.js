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
    }
    
    update(enemies, currentTime, speedMultiplier = 1) {
        this.findTarget(enemies);
        
        if (this.target && this.target.isAlive()) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            this.rotation = Math.atan2(dy, dx);
            
            const fireDelay = (1000 / this.fireRate) / speedMultiplier;
            if (currentTime - this.lastFireTime >= fireDelay) {
                const projectile = this.createProjectile();
                this.lastFireTime = currentTime;
                return projectile;
            }
        }
        
        return null;
    }
    
    findTarget(enemies) {
        let closestEnemy = null;
        let closestDistance = this.range;
        
        for (const enemy of enemies) {
            if (!enemy.isAlive()) continue;
            
            // Check if enemy can be targeted (handles stealth)
            if (enemy.canBeTargeted && !enemy.canBeTargeted()) continue;
            
            // Flying enemies can only be hit by certain towers
            if (enemy.isFlying && !this.canHitFlying()) continue;
            
            const distance = Utils.distance(this.x, this.y, enemy.x, enemy.y);
            if (distance <= this.range && distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }
        
        this.target = closestEnemy;
    }
    
    canHitFlying() {
        // Only sniper, laser, and chain towers can hit flying enemies
        return ['sniper', 'laser', 'chain'].includes(this.type);
    }
    
    createProjectile() {
        if (!this.target) return null;
        
        return {
            x: this.x,
            y: this.y,
            targetEnemy: this.target,
            damage: this.damage,
            speed: this.config.projectileSpeed,
            color: this.color,
            type: this.type,
            splashRadius: this.config.splashRadius || 0
        };
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, this.range, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.color;
        ctx.fillRect(-15, -15, 30, 30);
        
        ctx.rotate(this.rotation);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(10, -3, 20, 6);
        
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${this.level}`, this.x, this.y - 20);
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
class Projectile {
    constructor(data) {
        this.x = data.x;
        this.y = data.y;
        this.targetEnemy = data.targetEnemy;
        this.damage = data.damage;
        this.speed = data.speed;
        this.color = data.color;
        this.type = data.type;
        this.splashRadius = data.splashRadius || 0;
        this.active = true;
    }
    
    update(deltaTime, enemies) {
        if (!this.active) return false;
        
        if (!this.targetEnemy || !this.targetEnemy.isAlive()) {
            this.active = false;
            return false;
        }
        
        const dx = this.targetEnemy.x - this.x;
        const dy = this.targetEnemy.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            if (this.splashRadius > 0) {
                this.applySplashDamage(enemies);
            } else {
                this.targetEnemy.takeDamage(this.damage);
            }
            this.active = false;
            return true;
        }
        
        const moveDistance = this.speed * deltaTime / 1000;
        const ratio = moveDistance / distance;
        
        this.x += dx * ratio;
        this.y += dy * ratio;
        
        return false;
    }
    
    applySplashDamage(enemies) {
        for (const enemy of enemies) {
            if (!enemy.isAlive()) continue;
            
            const distance = Utils.distance(this.x, this.y, enemy.x, enemy.y);
            if (distance <= this.splashRadius) {
                const damageRatio = 1 - (distance / this.splashRadius) * 0.5;
                enemy.takeDamage(Math.floor(this.damage * damageRatio));
            }
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    isActive() {
        return this.active;
    }
}
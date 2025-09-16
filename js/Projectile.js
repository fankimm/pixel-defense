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

        // Laser doesn't use projectiles, it's instant
        if (this.type === 'laser') {
            this.active = false;
            return false;
        }

        if (!this.targetEnemy || !this.targetEnemy.isAlive()) {
            this.active = false;
            return false;
        }

        const dx = this.targetEnemy.x - this.x;
        const dy = this.targetEnemy.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            if (this.type === 'splash') {
                this.applySplashDamage(enemies);
            } else if (this.type === 'poison') {
                this.applyPoisonEffect();
            } else if (this.type === 'freeze') {
                this.applyFreezeEffect();
            } else if (this.type === 'chain') {
                this.applyChainEffect(enemies);
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

    applyPoisonEffect() {
        this.targetEnemy.takeDamage(this.damage);
        // Apply poison DOT
        if (!this.targetEnemy.poisonStacks) {
            this.targetEnemy.poisonStacks = 0;
        }
        this.targetEnemy.poisonStacks = Math.min(5, this.targetEnemy.poisonStacks + 1);
        this.targetEnemy.poisonDamage = this.damage * 0.3;
        this.targetEnemy.poisonDuration = 3000; // 3 seconds
    }

    applyFreezeEffect() {
        this.targetEnemy.takeDamage(this.damage);
        // Slow the enemy
        this.targetEnemy.freezeDuration = 1500; // 1.5 seconds
        this.targetEnemy.freezeSlowFactor = 0.5; // 50% slow
    }

    applyChainEffect(enemies) {
        this.targetEnemy.takeDamage(this.damage);

        // Find nearby enemies for chain
        let chainTargets = [];
        for (const enemy of enemies) {
            if (enemy === this.targetEnemy || !enemy.isAlive()) continue;

            const distance = Utils.distance(this.targetEnemy.x, this.targetEnemy.y, enemy.x, enemy.y);
            if (distance <= 100) { // Chain radius
                chainTargets.push({enemy, distance});
            }
        }

        // Sort by distance and chain to closest 2
        chainTargets.sort((a, b) => a.distance - b.distance);
        chainTargets.slice(0, 2).forEach((target, index) => {
            target.enemy.takeDamage(Math.floor(this.damage * (0.7 - index * 0.2)));
        });
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

        // Don't draw projectiles for laser towers
        if (this.type === 'laser') return;

        ctx.save();

        switch(this.type) {
            case 'poison':
                // Draw poison blob
                ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
                ctx.fill();

                // Add toxic bubbles
                for (let i = 0; i < 3; i++) {
                    const angle = (Date.now() / 200 + i * 120) % 360;
                    const offsetX = Math.cos(angle) * 3;
                    const offsetY = Math.sin(angle) * 3;
                    ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
                    ctx.beginPath();
                    ctx.arc(this.x + offsetX, this.y + offsetY, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;

            case 'freeze':
                // Draw ice shard
                ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
                ctx.translate(this.x, this.y);
                ctx.rotate(Date.now() / 100);
                for (let i = 0; i < 6; i++) {
                    ctx.rotate(Math.PI / 3);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(8, 0);
                    ctx.lineTo(4, 4);
                    ctx.closePath();
                    ctx.fill();
                }
                break;

            case 'chain':
                // Draw electric orb
                ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
                ctx.fill();

                // Add electric sparks
                ctx.strokeStyle = 'rgba(139, 92, 246, 1)';
                ctx.lineWidth = 1;
                for (let i = 0; i < 4; i++) {
                    const angle = (Date.now() / 50 + i * 90) % 360;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    const sparkX = this.x + Math.cos(angle * Math.PI / 180) * 10;
                    const sparkY = this.y + Math.sin(angle * Math.PI / 180) * 10;
                    ctx.lineTo(sparkX, sparkY);
                    ctx.stroke();
                }
                break;

            case 'splash':
                // Draw explosive projectile
                ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
                ctx.fill();

                // Add flame effect
                ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
                ctx.beginPath();
                ctx.arc(this.x, this.y - 2, 3, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'sniper':
                // Draw bullet
                const dx = this.targetEnemy.x - this.x;
                const dy = this.targetEnemy.y - this.y;
                const angle = Math.atan2(dy, dx);

                ctx.translate(this.x, this.y);
                ctx.rotate(angle);
                ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
                ctx.fillRect(-6, -2, 12, 4);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(4, -1, 4, 2);
                break;

            default:
                // Basic projectile
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
        }

        ctx.restore();
    }
    
    isActive() {
        return this.active;
    }
}
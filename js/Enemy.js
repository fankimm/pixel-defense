class Enemy {
    constructor(type, path) {
        this.type = type;
        this.config = CONFIG.ENEMY_TYPES[type];
        this.maxHp = this.config.hp;
        this.hp = this.maxHp;
        this.speed = this.config.speed;
        this.reward = this.config.reward;
        this.color = this.config.color;
        this.size = this.config.size;
        
        this.path = path;
        this.pathIndex = 0;
        this.alive = true;
        this.reachedEnd = false;
        
        if (path && path.length > 0) {
            this.x = path[0].x;
            this.y = path[0].y;
            
            if (path.length > 1) {
                this.targetX = path[1].x;
                this.targetY = path[1].y;
            } else {
                this.targetX = this.x;
                this.targetY = this.y;
                this.reachedEnd = true;
            }
        }
    }
    
    update(deltaTime) {
        if (!this.alive || this.reachedEnd) return;

        // Handle poison damage over time
        if (this.poisonDuration && this.poisonDuration > 0) {
            this.poisonDuration -= deltaTime;
            if (this.poisonDamage) {
                this.hp -= this.poisonDamage * deltaTime / 1000;
                if (this.hp <= 0) {
                    this.alive = false;
                    return;
                }
            }
        }

        // Calculate speed with freeze effect
        let currentSpeed = this.speed;
        if (this.freezeDuration && this.freezeDuration > 0) {
            this.freezeDuration -= deltaTime;
            currentSpeed *= this.freezeSlowFactor || 0.5;
        }

        // Move along path with better handling for high speeds
        const moveDistance = currentSpeed * deltaTime / 1000;
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
    
    draw(ctx) {
        if (!this.alive) return;

        // Draw poison effect
        if (this.poisonDuration && this.poisonDuration > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw poison bubbles
            for (let i = 0; i < 3; i++) {
                const angle = (Date.now() / 300 + i * 120) * Math.PI / 180;
                const offsetX = Math.cos(angle) * (this.size + 8);
                const offsetY = Math.sin(angle) * (this.size + 8);
                ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x + offsetX, this.y + offsetY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Draw freeze effect
        if (this.freezeDuration && this.freezeDuration > 0) {
            ctx.save();
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw ice crystals
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI / 2) + Date.now() / 1000;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(
                    this.x + Math.cos(angle) * (this.size + 5),
                    this.y + Math.sin(angle) * (this.size + 5)
                );
                ctx.stroke();
            }
            ctx.restore();
        }

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (this.hp < this.maxHp) {
            Utils.drawHealthBar(ctx, this.x, this.y - this.size - 10, 30, 4, this.hp, this.maxHp);
        }
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.alive = false;
            return true;
        }
        return false;
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    isAlive() {
        return this.alive;
    }
    
    hasReachedEnd() {
        return this.reachedEnd;
    }
}
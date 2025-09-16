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
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 2) {
            this.pathIndex++;
            if (this.pathIndex >= this.path.length) {
                this.reachedEnd = true;
                return;
            }
            
            this.targetX = this.path[this.pathIndex].x;
            this.targetY = this.path[this.pathIndex].y;
        } else {
            const moveDistance = this.speed * deltaTime / 1000;
            const ratio = moveDistance / distance;
            
            this.x += dx * ratio;
            this.y += dy * ratio;
        }
    }
    
    draw(ctx) {
        if (!this.alive) return;
        
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
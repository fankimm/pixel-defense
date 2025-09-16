class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || (Math.random() - 0.5) * 2;
        this.vy = options.vy || (Math.random() - 0.5) * 2;
        this.size = options.size || Math.random() * 3 + 1;
        this.color = options.color || '#ffffff';
        this.life = options.life || 1;
        this.decay = options.decay || 0.02;
        this.gravity = options.gravity || 0;
        this.active = true;
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        this.x += this.vx * deltaTime / 16;
        this.y += this.vy * deltaTime / 16;
        this.vy += this.gravity * deltaTime / 16;
        this.life -= this.decay * deltaTime / 16;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    createExplosion(x, y, color = '#ff6b6b', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 3 + 2;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: Math.random() * 4 + 2,
                decay: 0.03
            }));
        }
    }
    
    createDamageText(x, y, damage, color = '#fbbf24') {
        this.particles.push(new DamageText(x, y, damage, color));
    }
    
    createHitEffect(x, y, color = '#ffffff') {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: color,
                size: Math.random() * 2 + 1,
                life: 0.5,
                decay: 0.05
            }));
        }
    }
    
    createCoinEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 3 - 1,
                color: '#fbbf24',
                size: 3,
                gravity: 0.2,
                decay: 0.02
            }));
        }
    }
    
    update(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.active;
        });
    }
    
    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
}

class DamageText extends Particle {
    constructor(x, y, damage, color) {
        super(x, y, {
            vx: 0,
            vy: -1,
            color: color,
            life: 1,
            decay: 0.02
        });
        this.damage = damage;
        this.fontSize = 16;
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`-${this.damage}`, this.x, this.y);
        
        // Add outline for better visibility
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(`-${this.damage}`, this.x, this.y);
        
        ctx.restore();
    }
}
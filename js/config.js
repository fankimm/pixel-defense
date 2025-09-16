const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    GRID_SIZE: 50,
    FPS: 60,
    STARTING_COINS: 100,
    STARTING_HP: 20,
    
    TOWER_TYPES: {
        basic: {
            cost: 50,
            range: 100,
            damage: 10,
            fireRate: 1.0,
            color: '#3b82f6',
            projectileSpeed: 300,
            upgradeCost: 50,
            sellValue: 25
        },
        sniper: {
            cost: 100,
            range: 200,
            damage: 30,
            fireRate: 0.5,
            color: '#ef4444',
            projectileSpeed: 500,
            upgradeCost: 75,
            sellValue: 50
        },
        splash: {
            cost: 150,
            range: 80,
            damage: 20,
            fireRate: 0.8,
            color: '#f59e0b',
            projectileSpeed: 250,
            splashRadius: 50,
            upgradeCost: 100,
            sellValue: 75
        },
        freeze: {
            cost: 120,
            range: 90,
            damage: 5,
            fireRate: 1.5,
            color: '#06b6d4',
            projectileSpeed: 400,
            slowEffect: 0.5,
            slowDuration: 2000,
            upgradeCost: 80,
            sellValue: 60
        },
        laser: {
            cost: 200,
            range: 150,
            damage: 50,
            fireRate: 0.1,
            color: '#ec4899',
            isLaser: true,
            upgradeCost: 150,
            sellValue: 100
        },
        poison: {
            cost: 140,
            range: 100,
            damage: 8,
            fireRate: 1.2,
            color: '#10b981',
            projectileSpeed: 350,
            poisonDamage: 3,
            poisonDuration: 3000,
            upgradeCost: 90,
            sellValue: 70
        },
        chain: {
            cost: 180,
            range: 120,
            damage: 15,
            fireRate: 0.8,
            color: '#8b5cf6',
            projectileSpeed: 400,
            chainCount: 3,
            chainRange: 80,
            upgradeCost: 120,
            sellValue: 90
        }
    },
    
    ENEMY_TYPES: {
        grunt: {
            hp: 50,
            speed: 50,
            reward: 10,
            color: '#22c55e',
            size: 15
        },
        fast: {
            hp: 30,
            speed: 100,
            reward: 15,
            color: '#a855f7',
            size: 12
        },
        tank: {
            hp: 150,
            speed: 30,
            reward: 30,
            color: '#dc2626',
            size: 20
        },
        healer: {
            hp: 80,
            speed: 40,
            reward: 25,
            color: '#06b6d4',
            size: 16,
            healRadius: 60,
            healAmount: 5,
            healInterval: 2000
        },
        splitter: {
            hp: 100,
            speed: 60,
            reward: 20,
            color: '#f97316',
            size: 18,
            splitInto: 'fast',
            splitCount: 3
        },
        stealth: {
            hp: 60,
            speed: 70,
            reward: 35,
            color: '#6b7280',
            size: 14,
            stealthDuration: 3000,
            visibleDuration: 1000
        },
        boss: {
            hp: 500,
            speed: 25,
            reward: 100,
            color: '#7c3aed',
            size: 30,
            shieldHp: 200,
            rageThreshold: 0.3
        },
        flying: {
            hp: 40,
            speed: 80,
            reward: 20,
            color: '#0ea5e9',
            size: 13,
            flying: true
        }
    },
    
    WAVE_CONFIGS: [
        { enemies: [{ type: 'grunt', count: 5, delay: 1000 }] },
        { enemies: [{ type: 'grunt', count: 8, delay: 800 }] },
        { enemies: [{ type: 'grunt', count: 5, delay: 800 }, { type: 'fast', count: 3, delay: 600 }] },
        { enemies: [{ type: 'grunt', count: 10, delay: 700 }, { type: 'fast', count: 5, delay: 500 }] },
        { enemies: [{ type: 'tank', count: 2, delay: 1500 }, { type: 'grunt', count: 8, delay: 600 }] },
        { enemies: [{ type: 'grunt', count: 15, delay: 500 }, { type: 'fast', count: 8, delay: 400 }, { type: 'tank', count: 3, delay: 1200 }] }
    ],
    
    MAP_PATH: [
        { x: 0, y: 4 },
        { x: 2, y: 4 },
        { x: 2, y: 2 },
        { x: 5, y: 2 },
        { x: 5, y: 6 },
        { x: 8, y: 6 },
        { x: 8, y: 4 },
        { x: 11, y: 4 },
        { x: 11, y: 9 },
        { x: 13, y: 9 },
        { x: 13, y: 6 },
        { x: 15, y: 6 }
    ]
};
class WeatherSystem {
    constructor() {
        this.currentWeather = 'sunny';
        this.currentTime = 'day';
        this.weatherDuration = 30000; // 30 seconds per weather
        this.timeDuration = 60000; // 60 seconds per time cycle
        this.weatherTimer = 0;
        this.timeTimer = 0;
        this.transitionProgress = 0;
        this.isTransitioning = false;
        this.nextWeather = null;
        this.nextTime = null;

        // Weather types and their effects
        this.weatherTypes = {
            sunny: {
                name: '☀️ Sunny',
                towerDamageMultiplier: 1.1, // 10% damage boost
                enemySpeedMultiplier: 1.0,
                visibilityMultiplier: 1.2, // 20% range boost
                color: 'rgba(255, 255, 100, 0.1)',
                particles: null
            },
            rainy: {
                name: '🌧️ Rainy',
                towerDamageMultiplier: 0.9, // 10% damage reduction
                enemySpeedMultiplier: 0.8, // Enemies slow down
                visibilityMultiplier: 0.9, // 10% range reduction
                color: 'rgba(100, 100, 200, 0.2)',
                particles: 'rain'
            },
            foggy: {
                name: '🌫️ Foggy',
                towerDamageMultiplier: 1.0,
                enemySpeedMultiplier: 1.0,
                visibilityMultiplier: 0.7, // 30% range reduction
                color: 'rgba(200, 200, 200, 0.3)',
                particles: 'fog'
            },
            stormy: {
                name: '⛈️ Stormy',
                towerDamageMultiplier: 1.3, // Electric damage boost
                enemySpeedMultiplier: 0.7,
                visibilityMultiplier: 0.8,
                color: 'rgba(50, 50, 100, 0.3)',
                particles: 'lightning'
            },
            snowy: {
                name: '❄️ Snowy',
                towerDamageMultiplier: 0.8,
                enemySpeedMultiplier: 0.6, // Heavy slow
                visibilityMultiplier: 0.85,
                color: 'rgba(230, 230, 255, 0.2)',
                particles: 'snow'
            }
        };

        // Time of day effects
        this.timeTypes = {
            day: {
                name: '🌞 Day',
                damageMultiplier: 1.0,
                speedMultiplier: 1.0,
                rewardMultiplier: 1.0,
                brightness: 1.0
            },
            dusk: {
                name: '🌅 Dusk',
                damageMultiplier: 1.1,
                speedMultiplier: 1.1,
                rewardMultiplier: 1.2,
                brightness: 0.7
            },
            night: {
                name: '🌙 Night',
                damageMultiplier: 0.9,
                speedMultiplier: 1.2, // Enemies faster at night
                rewardMultiplier: 1.5, // Higher rewards for night battles
                brightness: 0.4
            },
            dawn: {
                name: '🌄 Dawn',
                damageMultiplier: 1.05,
                speedMultiplier: 0.95,
                rewardMultiplier: 1.1,
                brightness: 0.6
            }
        };

        this.particles = [];
        this.initUI();
        this.startWeatherCycle();
    }

    initUI() {
        // Create weather display
        const weatherDisplay = document.createElement('div');
        weatherDisplay.id = 'weather-display';
        weatherDisplay.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 100;
            min-width: 150px;
        `;

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(weatherDisplay);
        }

        this.updateDisplay();
    }

    startWeatherCycle() {
        // Randomly change weather
        this.weatherTimer = this.weatherDuration;
        this.timeTimer = this.timeDuration;
    }

    update(deltaTime) {
        // Update weather timer
        this.weatherTimer -= deltaTime;
        if (this.weatherTimer <= 0) {
            this.changeWeather();
            this.weatherTimer = this.weatherDuration;
        }

        // Update time timer
        this.timeTimer -= deltaTime;
        if (this.timeTimer <= 0) {
            this.changeTime();
            this.timeTimer = this.timeDuration;
        }

        // Update particles
        this.updateParticles(deltaTime);

        // Handle transitions
        if (this.isTransitioning) {
            this.transitionProgress = Math.min(1, this.transitionProgress + deltaTime / 3000);
            if (this.transitionProgress >= 1) {
                this.isTransitioning = false;
                if (this.nextWeather) {
                    this.currentWeather = this.nextWeather;
                    this.nextWeather = null;
                }
                if (this.nextTime) {
                    this.currentTime = this.nextTime;
                    this.nextTime = null;
                }
            }
        }
    }

    changeWeather() {
        const weathers = Object.keys(this.weatherTypes);
        let newWeather;
        do {
            newWeather = weathers[Math.floor(Math.random() * weathers.length)];
        } while (newWeather === this.currentWeather);

        this.nextWeather = newWeather;
        this.isTransitioning = true;
        this.transitionProgress = 0;
        this.updateDisplay();
        this.showNotification(`Weather changing to ${this.weatherTypes[newWeather].name}`);

        // Track weather for achievements
        if (window.gameEngine && window.gameEngine.achievementSystem) {
            window.gameEngine.achievementSystem.updateStats('weather', newWeather);
        }
    }

    changeTime() {
        const times = ['day', 'dusk', 'night', 'dawn'];
        const currentIndex = times.indexOf(this.currentTime);
        const nextIndex = (currentIndex + 1) % times.length;

        this.nextTime = times[nextIndex];
        this.isTransitioning = true;
        this.transitionProgress = 0;
        this.updateDisplay();
        this.showNotification(`Time changing to ${this.timeTypes[this.nextTime].name}`);
    }

    updateParticles(deltaTime) {
        const weather = this.weatherTypes[this.currentWeather];

        // Spawn new particles based on weather
        if (weather.particles === 'rain' && Math.random() < 0.3) {
            this.particles.push({
                type: 'rain',
                x: Math.random() * CONFIG.CANVAS_WIDTH,
                y: -10,
                vx: Math.random() * 2 - 1,
                vy: 200 + Math.random() * 100,
                life: 3000
            });
        } else if (weather.particles === 'snow' && Math.random() < 0.2) {
            this.particles.push({
                type: 'snow',
                x: Math.random() * CONFIG.CANVAS_WIDTH,
                y: -10,
                vx: Math.random() * 20 - 10,
                vy: 30 + Math.random() * 20,
                life: 5000
            });
        } else if (weather.particles === 'lightning' && Math.random() < 0.01) {
            this.particles.push({
                type: 'lightning',
                x: Math.random() * CONFIG.CANVAS_WIDTH,
                y: 0,
                life: 100,
                targetY: CONFIG.CANVAS_HEIGHT * 0.7
            });
        }

        // Update existing particles
        this.particles = this.particles.filter(particle => {
            particle.life -= deltaTime;

            if (particle.type !== 'lightning') {
                particle.x += particle.vx * deltaTime / 1000;
                particle.y += particle.vy * deltaTime / 1000;
            }

            return particle.life > 0 && particle.y < CONFIG.CANVAS_HEIGHT + 20;
        });
    }

    draw(ctx) {
        // Draw weather overlay
        const weather = this.weatherTypes[this.currentWeather];
        const time = this.timeTypes[this.currentTime];

        ctx.save();

        // Apply time-based darkness
        if (time.brightness < 1) {
            ctx.fillStyle = `rgba(0, 0, 0, ${1 - time.brightness})`;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        }

        // Apply weather color overlay
        ctx.fillStyle = weather.color;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        // Draw weather particles
        this.particles.forEach(particle => {
            ctx.globalAlpha = particle.life / (particle.type === 'lightning' ? 100 : 3000);

            if (particle.type === 'rain') {
                ctx.strokeStyle = 'rgba(150, 150, 255, 0.6)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(particle.x - particle.vx, particle.y - 10);
                ctx.stroke();
            } else if (particle.type === 'snow') {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (particle.type === 'lightning') {
                ctx.strokeStyle = 'rgba(255, 255, 100, 1)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);

                // Create zigzag pattern
                let currentY = particle.y;
                while (currentY < particle.targetY) {
                    currentY += 20;
                    const offsetX = (Math.random() - 0.5) * 30;
                    ctx.lineTo(particle.x + offsetX, currentY);
                }
                ctx.stroke();

                // Add glow effect
                ctx.shadowBlur = 20;
                ctx.shadowColor = 'yellow';
                ctx.stroke();
            }
        });

        // Draw fog effect
        if (weather.particles === 'fog') {
            ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
            for (let i = 0; i < 5; i++) {
                const x = (Date.now() / 100 + i * 100) % (CONFIG.CANVAS_WIDTH + 200) - 100;
                ctx.beginPath();
                ctx.arc(x, CONFIG.CANVAS_HEIGHT / 2 + Math.sin(Date.now() / 1000 + i) * 50, 100, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    updateDisplay() {
        const display = document.getElementById('weather-display');
        if (!display) return;

        const weather = this.weatherTypes[this.currentWeather];
        const time = this.timeTypes[this.currentTime];

        display.innerHTML = `
            <div><strong>Weather:</strong> ${weather.name}</div>
            <div><strong>Time:</strong> ${time.name}</div>
            <div style="font-size: 12px; margin-top: 5px; color: #aaa;">
                DMG: ${Math.round((weather.towerDamageMultiplier * time.damageMultiplier - 1) * 100)}%
                ${weather.towerDamageMultiplier * time.damageMultiplier > 1 ? '↑' : '↓'}
            </div>
        `;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 18px;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out;
        `;
        notification.textContent = message;

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    }

    getEffects() {
        const weather = this.weatherTypes[this.currentWeather];
        const time = this.timeTypes[this.currentTime];

        return {
            towerDamageMultiplier: weather.towerDamageMultiplier * time.damageMultiplier,
            towerRangeMultiplier: weather.visibilityMultiplier,
            enemySpeedMultiplier: weather.enemySpeedMultiplier * time.speedMultiplier,
            rewardMultiplier: time.rewardMultiplier
        };
    }
}
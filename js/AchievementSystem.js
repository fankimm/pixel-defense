class AchievementSystem {
    constructor() {
        this.achievements = {
            // Kill achievements
            firstBlood: { id: 'firstBlood', name: 'First Blood', desc: 'Kill your first enemy', icon: '🩸', unlocked: false, progress: 0, target: 1, reward: 10 },
            enemySlayer: { id: 'enemySlayer', name: 'Enemy Slayer', desc: 'Kill 100 enemies', icon: '⚔️', unlocked: false, progress: 0, target: 100, reward: 50 },
            enemyDestroyer: { id: 'enemyDestroyer', name: 'Enemy Destroyer', desc: 'Kill 500 enemies', icon: '💀', unlocked: false, progress: 0, target: 500, reward: 100 },
            enemyAnnihilator: { id: 'enemyAnnihilator', name: 'Annihilator', desc: 'Kill 2000 enemies', icon: '☠️', unlocked: false, progress: 0, target: 2000, reward: 250 },

            // Wave achievements
            waveRookie: { id: 'waveRookie', name: 'Wave Rookie', desc: 'Reach wave 5', icon: '🌊', unlocked: false, progress: 0, target: 5, reward: 25 },
            waveSurvivor: { id: 'waveSurvivor', name: 'Wave Survivor', desc: 'Reach wave 10', icon: '🏄', unlocked: false, progress: 0, target: 10, reward: 50 },
            waveVeteran: { id: 'waveVeteran', name: 'Wave Veteran', desc: 'Reach wave 20', icon: '🌪️', unlocked: false, progress: 0, target: 20, reward: 100 },
            waveMaster: { id: 'waveMaster', name: 'Wave Master', desc: 'Reach wave 30', icon: '🌀', unlocked: false, progress: 0, target: 30, reward: 200 },

            // Combo achievements
            comboNovice: { id: 'comboNovice', name: 'Combo Novice', desc: 'Get 5x combo', icon: '🔥', unlocked: false, progress: 0, target: 5, reward: 20 },
            comboExpert: { id: 'comboExpert', name: 'Combo Expert', desc: 'Get 15x combo', icon: '💥', unlocked: false, progress: 0, target: 15, reward: 50 },
            comboMaster: { id: 'comboMaster', name: 'Combo Master', desc: 'Get 30x combo', icon: '⚡', unlocked: false, progress: 0, target: 30, reward: 100 },

            // Tower achievements
            builder: { id: 'builder', name: 'Builder', desc: 'Build 10 towers', icon: '🏗️', unlocked: false, progress: 0, target: 10, reward: 30 },
            architect: { id: 'architect', name: 'Architect', desc: 'Build 25 towers', icon: '🏰', unlocked: false, progress: 0, target: 25, reward: 75 },
            towerTycoon: { id: 'towerTycoon', name: 'Tower Tycoon', desc: 'Fully upgrade 5 towers', icon: '🏛️', unlocked: false, progress: 0, target: 5, reward: 150 },

            // Special achievements
            weatherman: { id: 'weatherman', name: 'Weatherman', desc: 'Experience all weather types', icon: '🌈', unlocked: false, progress: 0, target: 5, reward: 100 },
            nightOwl: { id: 'nightOwl', name: 'Night Owl', desc: 'Survive 5 night cycles', icon: '🦉', unlocked: false, progress: 0, target: 5, reward: 75 },
            perfectWave: { id: 'perfectWave', name: 'Perfect Wave', desc: 'Complete a wave without losing HP', icon: '✨', unlocked: false, progress: 0, target: 1, reward: 50 },
            richKing: { id: 'richKing', name: 'Rich King', desc: 'Save 1000 coins', icon: '👑', unlocked: false, progress: 0, target: 1000, reward: 200 }
        };

        this.quests = [
            { id: 'quest1', name: 'Tower Defense 101', desc: 'Build 3 towers and survive wave 3', completed: false, reward: 30,
              conditions: [{ type: 'towers', count: 3 }, { type: 'wave', count: 3 }] },
            { id: 'quest2', name: 'Combo Starter', desc: 'Achieve 10x combo in a single game', completed: false, reward: 40,
              conditions: [{ type: 'combo', count: 10 }] },
            { id: 'quest3', name: 'Economic Victory', desc: 'Save 500 coins', completed: false, reward: 50,
              conditions: [{ type: 'coins', count: 500 }] },
            { id: 'quest4', name: 'Variety Pack', desc: 'Build at least one of each tower type', completed: false, reward: 100,
              conditions: [{ type: 'towerVariety', count: 7 }] },
            { id: 'quest5', name: 'Weather Warrior', desc: 'Win a wave during stormy weather', completed: false, reward: 60,
              conditions: [{ type: 'weatherWin', weather: 'stormy' }] }
        ];

        this.notifications = [];
        this.stats = {
            totalKills: 0,
            maxWave: 0,
            maxCombo: 0,
            towersBuilt: 0,
            towersUpgraded: 0,
            weathersExperienced: new Set(),
            nightsSurvived: 0,
            perfectWaves: 0,
            maxCoins: 0,
            towerTypesBuilt: new Set()
        };

        this.loadProgress();
        this.initUI();
    }

    initUI() {
        // Achievement panel
        const achievementPanel = document.createElement('div');
        achievementPanel.id = 'achievement-panel';
        achievementPanel.style.cssText = `
            position: absolute;
            top: 60px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 99;
            max-width: 200px;
            max-height: 300px;
            overflow-y: auto;
            display: none;
        `;

        // Achievement button
        const achievementBtn = document.createElement('button');
        achievementBtn.id = 'achievement-btn';
        achievementBtn.innerHTML = '🏆';
        achievementBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 180px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: 2px solid #ffd700;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
            z-index: 100;
        `;

        achievementBtn.addEventListener('click', () => {
            const panel = document.getElementById('achievement-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            if (panel.style.display === 'block') {
                this.updatePanelDisplay();
            }
        });

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(achievementPanel);
            gameContainer.appendChild(achievementBtn);
        }

        // Notification container
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'achievement-notifications';
        notificationContainer.style.cssText = `
            position: absolute;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            pointer-events: none;
        `;
        if (gameContainer) {
            gameContainer.appendChild(notificationContainer);
        }
    }

    updateStats(type, value) {
        switch(type) {
            case 'kill':
                this.stats.totalKills++;
                this.updateAchievement('firstBlood', this.stats.totalKills);
                this.updateAchievement('enemySlayer', this.stats.totalKills);
                this.updateAchievement('enemyDestroyer', this.stats.totalKills);
                this.updateAchievement('enemyAnnihilator', this.stats.totalKills);
                break;
            case 'wave':
                this.stats.maxWave = Math.max(this.stats.maxWave, value);
                this.updateAchievement('waveRookie', this.stats.maxWave);
                this.updateAchievement('waveSurvivor', this.stats.maxWave);
                this.updateAchievement('waveVeteran', this.stats.maxWave);
                this.updateAchievement('waveMaster', this.stats.maxWave);
                this.checkQuests();
                break;
            case 'combo':
                this.stats.maxCombo = Math.max(this.stats.maxCombo, value);
                this.updateAchievement('comboNovice', this.stats.maxCombo);
                this.updateAchievement('comboExpert', this.stats.maxCombo);
                this.updateAchievement('comboMaster', this.stats.maxCombo);
                this.checkQuests();
                break;
            case 'tower':
                this.stats.towersBuilt++;
                this.updateAchievement('builder', this.stats.towersBuilt);
                this.updateAchievement('architect', this.stats.towersBuilt);
                if (value) this.stats.towerTypesBuilt.add(value);
                this.checkQuests();
                break;
            case 'upgrade':
                this.stats.towersUpgraded++;
                this.updateAchievement('towerTycoon', this.stats.towersUpgraded);
                break;
            case 'weather':
                this.stats.weathersExperienced.add(value);
                this.updateAchievement('weatherman', this.stats.weathersExperienced.size);
                break;
            case 'night':
                this.stats.nightsSurvived++;
                this.updateAchievement('nightOwl', this.stats.nightsSurvived);
                break;
            case 'perfectWave':
                this.stats.perfectWaves++;
                this.updateAchievement('perfectWave', this.stats.perfectWaves);
                break;
            case 'coins':
                this.stats.maxCoins = Math.max(this.stats.maxCoins, value);
                this.updateAchievement('richKing', this.stats.maxCoins);
                this.checkQuests();
                break;
        }
        this.saveProgress();
    }

    updateAchievement(id, progress) {
        const achievement = this.achievements[id];
        if (!achievement || achievement.unlocked) return;

        achievement.progress = progress;

        if (progress >= achievement.target) {
            achievement.unlocked = true;
            this.showNotification(achievement);
            return achievement.reward;
        }
        return 0;
    }

    checkQuests() {
        this.quests.forEach(quest => {
            if (quest.completed) return;

            let allConditionsMet = true;
            quest.conditions.forEach(condition => {
                switch(condition.type) {
                    case 'towers':
                        if (this.stats.towersBuilt < condition.count) allConditionsMet = false;
                        break;
                    case 'wave':
                        if (this.stats.maxWave < condition.count) allConditionsMet = false;
                        break;
                    case 'combo':
                        if (this.stats.maxCombo < condition.count) allConditionsMet = false;
                        break;
                    case 'coins':
                        if (this.stats.maxCoins < condition.count) allConditionsMet = false;
                        break;
                    case 'towerVariety':
                        if (this.stats.towerTypesBuilt.size < condition.count) allConditionsMet = false;
                        break;
                }
            });

            if (allConditionsMet) {
                quest.completed = true;
                this.showQuestComplete(quest);
            }
        });
    }

    showNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.style.cssText = `
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #000;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
            animation: achievementSlide 4s ease-in-out;
            font-weight: bold;
        `;
        notification.innerHTML = `
            <div style="font-size: 20px; margin-bottom: 5px;">${achievement.icon} Achievement Unlocked!</div>
            <div style="font-size: 16px;">${achievement.name}</div>
            <div style="font-size: 12px; opacity: 0.8;">${achievement.desc}</div>
            <div style="font-size: 14px; margin-top: 5px;">Reward: 💰 ${achievement.reward}</div>
        `;

        const container = document.getElementById('achievement-notifications');
        if (container) {
            container.appendChild(notification);
            setTimeout(() => notification.remove(), 4000);
        }
    }

    showQuestComplete(quest) {
        const notification = document.createElement('div');
        notification.className = 'quest-notification';
        notification.style.cssText = `
            background: linear-gradient(135deg, #4ade80, #22c55e);
            color: #fff;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.5);
            animation: achievementSlide 4s ease-in-out;
            font-weight: bold;
        `;
        notification.innerHTML = `
            <div style="font-size: 20px; margin-bottom: 5px;">📜 Quest Complete!</div>
            <div style="font-size: 16px;">${quest.name}</div>
            <div style="font-size: 14px; margin-top: 5px;">Reward: 💰 ${quest.reward}</div>
        `;

        const container = document.getElementById('achievement-notifications');
        if (container) {
            container.appendChild(notification);
            setTimeout(() => notification.remove(), 4000);
        }
    }

    updatePanelDisplay() {
        const panel = document.getElementById('achievement-panel');
        if (!panel) return;

        let html = '<h3 style="margin: 0 0 10px 0; color: #ffd700;">🏆 Achievements</h3>';

        // Show unlocked achievements
        let unlockedCount = 0;
        Object.values(this.achievements).forEach(achievement => {
            if (achievement.unlocked) {
                unlockedCount++;
                html += `<div style="margin-bottom: 5px; color: #4ade80;">
                    ${achievement.icon} ${achievement.name} ✓
                </div>`;
            }
        });

        // Show progress on locked achievements
        Object.values(this.achievements).forEach(achievement => {
            if (!achievement.unlocked) {
                const percentage = Math.round((achievement.progress / achievement.target) * 100);
                html += `<div style="margin-bottom: 5px; opacity: 0.7;">
                    ${achievement.icon} ${achievement.name}
                    <div style="font-size: 10px;">${achievement.progress}/${achievement.target} (${percentage}%)</div>
                </div>`;
            }
        });

        html += '<h3 style="margin: 10px 0 10px 0; color: #4ade80;">📜 Quests</h3>';
        this.quests.forEach(quest => {
            if (!quest.completed) {
                html += `<div style="margin-bottom: 5px; font-size: 11px;">
                    • ${quest.name}
                    <div style="font-size: 10px; opacity: 0.7;">${quest.desc}</div>
                </div>`;
            }
        });

        panel.innerHTML = html;
    }

    saveProgress() {
        localStorage.setItem('achievements', JSON.stringify({
            achievements: this.achievements,
            quests: this.quests,
            stats: {
                ...this.stats,
                weathersExperienced: Array.from(this.stats.weathersExperienced),
                towerTypesBuilt: Array.from(this.stats.towerTypesBuilt)
            }
        }));
    }

    loadProgress() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            const data = JSON.parse(saved);
            this.achievements = data.achievements || this.achievements;
            this.quests = data.quests || this.quests;
            if (data.stats) {
                this.stats = {
                    ...data.stats,
                    weathersExperienced: new Set(data.stats.weathersExperienced || []),
                    towerTypesBuilt: new Set(data.stats.towerTypesBuilt || [])
                };
            }
        }
    }

    getTotalRewards() {
        let total = 0;
        Object.values(this.achievements).forEach(achievement => {
            if (achievement.unlocked) total += achievement.reward;
        });
        this.quests.forEach(quest => {
            if (quest.completed) total += quest.reward;
        });
        return total;
    }
}

// Add animation CSS
if (!document.getElementById('achievement-styles')) {
    const style = document.createElement('style');
    style.id = 'achievement-styles';
    style.textContent = `
        @keyframes achievementSlide {
            0% { transform: translateY(20px); opacity: 0; }
            20% { transform: translateY(0); opacity: 1; }
            80% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-20px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
class StorageManager {
    constructor() {
        this.storageKey = 'pixelDefenseData';
    }
    
    saveHighScore(wave) {
        const currentHighScore = this.getHighScore();
        if (wave > currentHighScore) {
            localStorage.setItem(this.storageKey + '_highScore', wave.toString());
        }
    }
    
    getHighScore() {
        const score = localStorage.getItem(this.storageKey + '_highScore');
        return score ? parseInt(score) : 0;
    }
    
    saveGameState(gameState) {
        localStorage.setItem(this.storageKey + '_gameState', JSON.stringify(gameState));
    }
    
    loadGameState() {
        const state = localStorage.getItem(this.storageKey + '_gameState');
        return state ? JSON.parse(state) : null;
    }
    
    clearGameState() {
        localStorage.removeItem(this.storageKey + '_gameState');
    }
    
    saveSettings(settings) {
        localStorage.setItem(this.storageKey + '_settings', JSON.stringify(settings));
    }
    
    loadSettings() {
        const settings = localStorage.getItem(this.storageKey + '_settings');
        return settings ? JSON.parse(settings) : {
            soundEnabled: true,
            musicEnabled: true,
            particlesEnabled: true
        };
    }
}
let gameEngine;
let fakeAdManager;

function initGame() {
    try {
        // Initialize internationalization first
        i18n.init();

        // Ensure canvas exists
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error('Canvas not found, retrying...');
            setTimeout(initGame, 100);
            return;
        }

        // Initialize game engine
        gameEngine = new GameEngine();
        
        // Force initial render multiple times for mobile
        if (gameEngine && gameEngine.render) {
            gameEngine.render();
            requestAnimationFrame(() => {
                gameEngine.render();
            });
        }
        
        // Initialize ads after a delay
        setTimeout(() => {
            fakeAdManager = new FakeAdManager();
        }, 200);
        
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

// Multiple initialization strategies for compatibility
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initGame, 0);
    });
} else {
    // DOM is already loaded (for file:// protocol)
    setTimeout(initGame, 0);
}

// Also try on window load as fallback
window.addEventListener('load', () => {
    if (!gameEngine) {
        initGame();
    }
});

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize);

function handleResize() {
    // Keep canvas internal resolution correct
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        // Always reset canvas dimensions
        canvas.width = CONFIG.CANVAS_WIDTH || 800;
        canvas.height = CONFIG.CANVAS_HEIGHT || 600;
        
        // Force re-render after resize
        if (gameEngine && gameEngine.render) {
            gameEngine.render();
        }
    }
}
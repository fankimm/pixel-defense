const Utils = {
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    angleToTarget(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    gridToPixel(gridX, gridY) {
        return {
            x: gridX * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2,
            y: gridY * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2
        };
    },
    
    pixelToGrid(pixelX, pixelY) {
        return {
            x: Math.floor(pixelX / CONFIG.GRID_SIZE),
            y: Math.floor(pixelY / CONFIG.GRID_SIZE)
        };
    },
    
    isPointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },
    
    drawHealthBar(ctx, x, y, width, height, current, max) {
        const healthPercent = current / max;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - width/2, y - height/2, width, height);
        
        if (healthPercent > 0.5) {
            ctx.fillStyle = '#22c55e';
        } else if (healthPercent > 0.25) {
            ctx.fillStyle = '#f59e0b';
        } else {
            ctx.fillStyle = '#ef4444';
        }
        
        ctx.fillRect(x - width/2, y - height/2, width * healthPercent, height);
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
};
class Map {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridWidth = Math.floor(CONFIG.CANVAS_WIDTH / CONFIG.GRID_SIZE);
        this.gridHeight = Math.floor(CONFIG.CANVAS_HEIGHT / CONFIG.GRID_SIZE);
        this.path = this.createPath();
        this.buildableGrid = this.createBuildableGrid();
    }
    
    createPath() {
        const path = [];
        const pathPoints = CONFIG.MAP_PATH;
        
        // Convert grid coordinates to pixel coordinates for smooth movement
        for (let i = 0; i < pathPoints.length; i++) {
            const point = pathPoints[i];
            path.push({
                x: point.x * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2,
                y: point.y * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2
            });
        }
        
        // Create smooth path with more points for better movement
        const smoothPath = [];
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            const steps = Math.ceil(distance / 5); // Create a point every 5 pixels
            
            for (let step = 0; step < steps; step++) {
                const t = step / steps;
                smoothPath.push({
                    x: start.x + (end.x - start.x) * t,
                    y: start.y + (end.y - start.y) * t
                });
            }
        }
        // Add the last point
        smoothPath.push(path[path.length - 1]);
        
        return smoothPath;
    }
    
    createBuildableGrid() {
        const grid = [];
        const pathCells = new Set();
        
        CONFIG.MAP_PATH.forEach((point, index) => {
            if (index < CONFIG.MAP_PATH.length - 1) {
                const next = CONFIG.MAP_PATH[index + 1];
                
                if (point.x === next.x) {
                    const minY = Math.min(point.y, next.y);
                    const maxY = Math.max(point.y, next.y);
                    for (let y = minY; y <= maxY; y++) {
                        pathCells.add(`${point.x},${y}`);
                    }
                } else if (point.y === next.y) {
                    const minX = Math.min(point.x, next.x);
                    const maxX = Math.max(point.x, next.x);
                    for (let x = minX; x <= maxX; x++) {
                        pathCells.add(`${x},${point.y}`);
                    }
                }
            }
        });
        
        for (let y = 0; y < this.gridHeight; y++) {
            grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                grid[y][x] = !pathCells.has(`${x},${y}`);
            }
        }
        
        return grid;
    }
    
    isBuildable(gridX, gridY) {
        if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
            return false;
        }
        return this.buildableGrid[gridY][gridX];
    }
    
    setBuildable(gridX, gridY, buildable) {
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            this.buildableGrid[gridY][gridX] = buildable;
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.ctx.strokeStyle = '#2a2a3e';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CONFIG.GRID_SIZE, 0);
            this.ctx.lineTo(x * CONFIG.GRID_SIZE, CONFIG.CANVAS_HEIGHT);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CONFIG.GRID_SIZE);
            this.ctx.lineTo(CONFIG.CANVAS_WIDTH, y * CONFIG.GRID_SIZE);
            this.ctx.stroke();
        }
        
        this.drawPath();
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.buildableGrid[y][x]) {
                    this.ctx.fillStyle = 'rgba(100, 100, 255, 0.1)';
                    this.ctx.fillRect(
                        x * CONFIG.GRID_SIZE,
                        y * CONFIG.GRID_SIZE,
                        CONFIG.GRID_SIZE,
                        CONFIG.GRID_SIZE
                    );
                }
            }
        }
    }
    
    drawPath() {
        const pathCells = new Set();
        
        CONFIG.MAP_PATH.forEach((point, index) => {
            if (index < CONFIG.MAP_PATH.length - 1) {
                const next = CONFIG.MAP_PATH[index + 1];
                
                if (point.x === next.x) {
                    const minY = Math.min(point.y, next.y);
                    const maxY = Math.max(point.y, next.y);
                    for (let y = minY; y <= maxY; y++) {
                        pathCells.add(`${point.x},${y}`);
                    }
                } else if (point.y === next.y) {
                    const minX = Math.min(point.x, next.x);
                    const maxX = Math.max(point.x, next.x);
                    for (let x = minX; x <= maxX; x++) {
                        pathCells.add(`${x},${point.y}`);
                    }
                }
            }
        });
        
        this.ctx.fillStyle = '#4a5568';
        pathCells.forEach(cell => {
            const [x, y] = cell.split(',').map(Number);
            this.ctx.fillRect(
                x * CONFIG.GRID_SIZE,
                y * CONFIG.GRID_SIZE,
                CONFIG.GRID_SIZE,
                CONFIG.GRID_SIZE
            );
        });
        
        // Draw spawn point with pulsing effect
        const start = CONFIG.MAP_PATH[0];
        const spawnX = start.x * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
        const spawnY = start.y * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;

        // Pulsing spawn indicator
        const pulseScale = 1 + Math.sin(Date.now() / 300) * 0.2;

        // Outer glow
        this.ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(spawnX, spawnY, 25 * pulseScale, 0, Math.PI * 2);
        this.ctx.fill();

        // Middle ring
        this.ctx.strokeStyle = '#22c55e';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(spawnX, spawnY, 18 * pulseScale, 0, Math.PI * 2);
        this.ctx.stroke();

        // Inner circle
        this.ctx.fillStyle = '#22c55e';
        this.ctx.beginPath();
        this.ctx.arc(spawnX, spawnY, 12, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw arrow showing enemy movement direction
        this.ctx.save();

        // Calculate initial movement direction
        const firstPoint = CONFIG.MAP_PATH[0];
        const secondPoint = CONFIG.MAP_PATH[1];
        const dx = secondPoint.x - firstPoint.x;
        const dy = secondPoint.y - firstPoint.y;

        // Determine arrow direction
        let arrowAngle = 0;
        if (dx > 0) arrowAngle = 0; // Right
        else if (dx < 0) arrowAngle = Math.PI; // Left
        else if (dy > 0) arrowAngle = Math.PI / 2; // Down
        else if (dy < 0) arrowAngle = -Math.PI / 2; // Up

        // Position arrow slightly offset from spawn in movement direction
        const arrowOffset = 25;
        const arrowX = spawnX + Math.cos(arrowAngle) * arrowOffset;
        const arrowY = spawnY + Math.sin(arrowAngle) * arrowOffset;

        this.ctx.translate(arrowX, arrowY);
        this.ctx.rotate(arrowAngle);

        // Animate arrow pulse
        const pulseSize = 1 + Math.sin(Date.now() / 300) * 0.2;
        this.ctx.scale(pulseSize, pulseSize);

        // Draw arrow
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.fillStyle = '#ffff00';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Arrow body
        this.ctx.beginPath();
        this.ctx.moveTo(-10, 0);
        this.ctx.lineTo(5, 0);
        this.ctx.stroke();

        // Arrow head (filled triangle)
        this.ctx.beginPath();
        this.ctx.moveTo(5, -5);
        this.ctx.lineTo(15, 0);
        this.ctx.lineTo(5, 5);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
        
        this.ctx.fillStyle = '#ef4444';
        const end = CONFIG.MAP_PATH[CONFIG.MAP_PATH.length - 1];
        this.ctx.beginPath();
        this.ctx.arc(
            end.x * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2,
            end.y * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2,
            15, 0, Math.PI * 2
        );
        this.ctx.fill();
    }
    
    getPath() {
        return this.path;
    }
}
class Spew2Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.board = this.createEmptyBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.startLevel = 0;
        this.level = 0;
        this.lines = 0;
        this.gameRunning = false;
        this.paused = false;
        this.gameOver = false;
        
        this.dropTime = 0;
        this.lastDropTime = 0;
        this.dropInterval = GAME_CONFIG.BASE_SPEED;
        
        this.rotationAngle = 0;
        this.rotationSpeed = 0;
        this.rotationDirection = 1;
        this.lastRotationTime = 0;
        
        this.zoomLevel = 1;
        this.zoomTime = 0;
        
        this.sounds = {};
        this.audioContext = null;
        this.initSounds();
        this.initEventListeners();
        this.initUI();
        
        this.spawnPiece();
        this.spawnNextPiece();
        this.gameRunning = true;
        this.lastDropTime = Date.now();
        this.lastRotationTime = Date.now();
        this.lastZoomTime = Date.now();
        this.gameLoop();
    }
    
    createEmptyBoard() {
        const board = [];
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            board[y] = [];
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                board[y][x] = 0;
            }
        }
        return board;
    }
    
    initSounds() {
        if (!SOUND_CONFIG.enabled) return;
        
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        this.sounds = {
            move: this.createBeep(this.audioContext, 200, 0.1),
            rotate: this.createBeep(this.audioContext, 300, 0.1),
            drop: this.createBeep(this.audioContext, 150, 0.2),
            lineClear: this.createBeep(this.audioContext, 400, 0.3),
            tetris: this.createBeep(this.audioContext, 600, 0.5),
            gameOver: this.createBeep(this.audioContext, 100, 1.0)
        };
    }
    
    createBeep(audioContext, frequency, duration) {
        return () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(SOUND_CONFIG.volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }
    
    initEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('quitBtn').addEventListener('click', () => this.quit());
        
        document.getElementById('levelUp').addEventListener('click', () => this.changeStartLevel(1));
        document.getElementById('levelDown').addEventListener('click', () => this.changeStartLevel(-1));
        
        // Touch-based mobile controls
        this.initTouchControls();
    }
    
    initTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let isSwiping = false;
        
        const gameContainer = document.querySelector('.game-container');
        
        gameContainer.addEventListener('touchstart', (e) => {
            if (this.gameOver || this.paused) return;
            
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
            isSwiping = false;
            
            e.preventDefault();
        }, { passive: false });
        
        gameContainer.addEventListener('touchmove', (e) => {
            if (this.gameOver || this.paused) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;
            
            // Detect swipe gesture
            if (deltaTime > 100 && Math.abs(deltaY) > 30) {
                isSwiping = true;
            }
            
            e.preventDefault();
        }, { passive: false });
        
        gameContainer.addEventListener('touchend', (e) => {
            if (this.gameOver || this.paused) return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;
            
            // If it's a quick tap (less than 200ms and small movement)
            if (deltaTime < 200 && Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
                const screenWidth = window.innerWidth;
                const touchX = touch.clientX;
                const touchY = touch.clientY;
                
                // Check if touch is in the bottom area of the game grid
                const canvas = this.canvas;
                const canvasRect = canvas.getBoundingClientRect();
                const bottomAreaHeight = 100; // Height of the bottom area for drop control
                
                // If touch is in the bottom area of the canvas, drop the piece
                if (touchY >= canvasRect.bottom - bottomAreaHeight && touchY <= canvasRect.bottom) {
                    this.movePiece(0, 1);
                    this.flashTouchZone('bottom');
                    e.preventDefault();
                    return;
                }
                
                // Left third of screen - move left
                if (touchX < screenWidth / 3) {
                    this.movePiece(-1, 0);
                    this.flashTouchZone('left');
                }
                // Right third of screen - move right
                else if (touchX > (screenWidth * 2) / 3) {
                    this.movePiece(1, 0);
                    this.flashTouchZone('right');
                }
                // Middle third - rotate piece
                else {
                    this.rotatePiece();
                    this.flashTouchZone('center');
                }
            }
            
            e.preventDefault();
        }, { passive: false });
        
        // Prevent default touch behaviors that might interfere
        gameContainer.addEventListener('touchcancel', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    flashTouchZone(zone) {
        const touchZone = document.querySelector(`.touch-zone.${zone}`);
        if (touchZone) {
            touchZone.style.opacity = '0.5';
            setTimeout(() => {
                touchZone.style.opacity = '0.1';
            }, 150);
        }
    }
    
    initUI() {
        this.updateScore();
        this.updateLevel();
        this.updateLines();
        this.updateStartLevelDisplay();
    }
    
    handleKeyPress(e) {
        if (this.gameOver) {
            if (e.code === 'Space') {
                this.restart();
            }
            return;
        }
        
        if (e.code === 'Escape') {
            this.showMenu();
            return;
        }
        
        if (this.paused) return;
        
        switch (e.code) {
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case 'Space':
                this.togglePause();
                break;
        }
    }
    
    spawnPiece() {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
        } else {
            this.currentPiece = this.createRandomPiece();
        }
        
        if (!this.isValidPosition(this.currentPiece)) {
            this.gameOver = true;
            this.gameRunning = false;
            this.showGameOver();
            this.playSound('gameOver');
        }
    }
    
    spawnNextPiece() {
        this.nextPiece = this.createRandomPiece();
        this.drawNextPiece();
    }
    
    createRandomPiece() {
        const pieceTypes = Object.keys(PIECES);
        const type = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        const piece = PIECES[type];
        
        return {
            type: type,
            shape: piece.shape,
            color: piece.color,
            x: Math.floor(GAME_CONFIG.BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
            y: 0,
            rotation: 0
        };
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.isValidPosition({ ...this.currentPiece, x: newX, y: newY })) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            if (dx !== 0 || dy !== 1) {
                this.playSound('move');
            }
            return true;
        }
        
        if (dy > 0) {
            this.placePiece();
            this.clearLines();
            this.spawnPiece();
            this.spawnNextPiece();
        }
        
        return false;
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        if (this.isValidPosition({ ...this.currentPiece, shape: rotated })) {
            this.currentPiece.shape = rotated;
            this.currentPiece.rotation = (this.currentPiece.rotation + 1) % 4;
            this.playSound('rotate');
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];
        
        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = 0; j < rows; j++) {
                rotated[i][j] = matrix[rows - 1 - j][i];
            }
        }
        
        return rotated;
    }
    
    isValidPosition(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = piece.x + x;
                    const boardY = piece.y + y;
                    
                    if (boardX < 0 || boardX >= GAME_CONFIG.BOARD_WIDTH ||
                        boardY >= GAME_CONFIG.BOARD_HEIGHT ||
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece() {
        if (!this.currentPiece) return;
        
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        this.playSound('drop');
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = GAME_CONFIG.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.isLineFull(y)) {
                this.removeLine(y);
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += GAME_CONFIG.SCORE_MULTIPLIERS[linesCleared] * (this.level + 1);
            
            if (linesCleared === 4) {
                this.playSound('tetris');
                this.triggerTetrisEffect();
            } else {
                this.playSound('lineClear');
            }
            
            this.updateScore();
            this.updateLevel();
            this.updateLines();
            this.updateDropSpeed();
        }
    }
    
    isLineFull(y) {
        return this.board[y].every(cell => cell !== 0);
    }
    
    removeLine(y) {
        this.board.splice(y, 1);
        this.board.unshift(new Array(GAME_CONFIG.BOARD_WIDTH).fill(0));
    }
    
    updateDropSpeed() {
        this.dropInterval = Math.max(
            GAME_CONFIG.MIN_SPEED,
            GAME_CONFIG.BASE_SPEED - (this.level * GAME_CONFIG.SPEED_INCREASE_PER_LEVEL)
        );
    }
    
    updateRotationSpeed() {
        if (this.level >= GAME_CONFIG.ROTATION_START_LEVEL) {
            this.rotationSpeed = GAME_CONFIG.BASE_ROTATION_SPEED + 
                (this.level - GAME_CONFIG.ROTATION_START_LEVEL) * GAME_CONFIG.ROTATION_SPEED_INCREASE;
        } else {
            this.rotationSpeed = 0;
        }
    }
    
    updateZoom() {
        if (this.level >= GAME_CONFIG.ZOOM_START_LEVEL) {
            this.zoomTime += 16; // Smooth 60fps animation
            const zoomStep = (this.zoomTime / GAME_CONFIG.ZOOM_CYCLE_TIME) * 2 * Math.PI;
            const zoomRange = (GAME_CONFIG.ZOOM_MAX - GAME_CONFIG.ZOOM_MIN) / 2;
            const zoomCenter = (GAME_CONFIG.ZOOM_MAX + GAME_CONFIG.ZOOM_MIN) / 2;
            this.zoomLevel = zoomCenter + zoomRange * Math.sin(zoomStep);
        } else {
            this.zoomLevel = 1;
            this.zoomTime = 0;
        }
    }
    
    updateRotation() {
        const now = Date.now();
        const timeDiff = now - this.lastRotationTime;
        
        if (timeDiff > 16) {
            let direction = this.rotationDirection;
            let speed = 0;
            
            if (this.level >= GAME_CONFIG.ROTATION_START_LEVEL) {
                speed = this.rotationSpeed;
                
                if (this.level >= GAME_CONFIG.RANDOM_ROTATION_START_LEVEL) {
                    if (Math.random() < 0.01) {
                        direction *= -1;
                    }
                }
            }
            
            this.rotationAngle += (direction * speed * timeDiff) / 1000;
            this.lastRotationTime = now;
        }
    }
    
    triggerTetrisEffect() {
        this.canvas.classList.add('tetris-flash');
        setTimeout(() => {
            this.canvas.classList.remove('tetris-flash');
        }, 500);
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    

    
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(this.zoomLevel, this.zoomLevel);
        this.ctx.rotate(this.rotationAngle * Math.PI / 180);
        this.ctx.translate(-centerX, -centerY);
        
        // Calculate board position to center it
        const boardWidth = GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE;
        const boardHeight = GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE;
        const boardX = (this.canvas.width - boardWidth) / 2;
        const boardY = (this.canvas.height - boardHeight) / 2;
        
        for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
                const cellX = boardX + x * GAME_CONFIG.CELL_SIZE;
                const cellY = boardY + y * GAME_CONFIG.CELL_SIZE;
                
                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.board[y][x];
                    this.ctx.fillRect(cellX, cellY, GAME_CONFIG.CELL_SIZE, GAME_CONFIG.CELL_SIZE);
                    
                    this.ctx.strokeStyle = '#333333';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(cellX, cellY, GAME_CONFIG.CELL_SIZE, GAME_CONFIG.CELL_SIZE);
                }
            }
        }
        
        this.drawCurrentPiece(boardX, boardY);
        this.drawGrid(boardX, boardY);
        
        this.ctx.restore();
    }
    
    drawCurrentPiece(boardX, boardY) {
        if (!this.currentPiece) return;
        
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const cellX = boardX + (this.currentPiece.x + x) * GAME_CONFIG.CELL_SIZE;
                    const cellY = boardY + (this.currentPiece.y + y) * GAME_CONFIG.CELL_SIZE;
                    
                    this.ctx.fillStyle = this.currentPiece.color;
                    this.ctx.fillRect(cellX, cellY, GAME_CONFIG.CELL_SIZE, GAME_CONFIG.CELL_SIZE);
                    
                    this.ctx.strokeStyle = '#333333';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(cellX, cellY, GAME_CONFIG.CELL_SIZE, GAME_CONFIG.CELL_SIZE);
                }
            }
        }
    }
    
    drawGrid(boardX, boardY) {
        this.ctx.strokeStyle = UI_COLORS.gridLines;
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= GAME_CONFIG.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(boardX + x * GAME_CONFIG.CELL_SIZE, boardY);
            this.ctx.lineTo(boardX + x * GAME_CONFIG.CELL_SIZE, boardY + GAME_CONFIG.BOARD_HEIGHT * GAME_CONFIG.CELL_SIZE);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= GAME_CONFIG.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(boardX, boardY + y * GAME_CONFIG.CELL_SIZE);
            this.ctx.lineTo(boardX + GAME_CONFIG.BOARD_WIDTH * GAME_CONFIG.CELL_SIZE, boardY + y * GAME_CONFIG.CELL_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (!this.nextPiece) return;
        
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * 20) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * 20) / 2;
        
        for (let y = 0; y < this.nextPiece.shape.length; y++) {
            for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                if (this.nextPiece.shape[y][x]) {
                    const cellX = offsetX + x * 20;
                    const cellY = offsetY + y * 20;
                    
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(cellX, cellY, 20, 20);
                    
                    this.nextCtx.strokeStyle = '#333333';
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.strokeRect(cellX, cellY, 20, 20);
                }
            }
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score.toLocaleString();
    }
    
    updateLevel() {
        this.level = Math.floor(this.lines / GAME_CONFIG.LINES_PER_LEVEL);
        document.getElementById('level').textContent = this.level;
        this.updateDropSpeed();
        this.updateRotationSpeed();
        console.log(`Level: ${this.level}, Drop Speed: ${this.dropInterval}ms, Rotation Speed: ${this.rotationSpeed}, Rotation Angle: ${this.rotationAngle}`);
    }
    
    updateLines() {
        document.getElementById('lines').textContent = this.lines;
    }
    
    changeStartLevel(delta) {
        this.startLevel = Math.max(0, Math.min(20, this.startLevel + delta));
        this.updateStartLevelDisplay();
    }
    
    updateStartLevelDisplay() {
        document.getElementById('startLevelDisplay').textContent = this.startLevel;
    }
    
    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.showPauseOverlay();
            document.body.classList.add('game-paused');
        } else {
            this.hideOverlay();
            document.body.classList.remove('game-paused');
        }
    }
    
    showPauseOverlay() {
        const overlay = document.getElementById('gameOverlay');
        const title = document.getElementById('overlayTitle');
        const message = document.getElementById('overlayMessage');
        
        title.textContent = 'PAUSED';
        title.style.color = UI_COLORS.pauseText;
        message.textContent = 'Press SPACE to resume';
        overlay.classList.remove('hidden');
    }
    
    showGameOver() {
        const overlay = document.getElementById('gameOverlay');
        const title = document.getElementById('overlayTitle');
        const message = document.getElementById('overlayMessage');
        
        title.textContent = 'GAME OVER';
        title.style.color = UI_COLORS.gameOverText;
        message.textContent = 'Press SPACE to restart';
        overlay.classList.remove('hidden');
        document.body.classList.add('game-over');
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').classList.add('hidden');
    }
    
    showMenu() {
        document.getElementById('menu').classList.remove('hidden');
    }
    
    hideMenu() {
        document.getElementById('menu').classList.add('hidden');
    }
    
    restart() {
        this.board = this.createEmptyBoard();
        this.score = 0;
        this.level = this.startLevel;
        this.lines = this.startLevel * GAME_CONFIG.LINES_PER_LEVEL;
        this.gameOver = false;
        this.paused = false;
        this.rotationAngle = 0;
        this.zoomLevel = 1;
        this.rotationDirection = 1;
        this.zoomTime = 0;
        
        this.updateDropSpeed();
        this.updateRotationSpeed();
        this.lastDropTime = Date.now();
        this.lastRotationTime = Date.now();
        this.zoomTime = 0;
        
        this.spawnPiece();
        this.spawnNextPiece();
        this.hideOverlay();
        this.hideMenu();
        document.body.classList.remove('game-over', 'game-paused');
        this.initUI();
        
        this.gameRunning = true;
    }
    
    quit() {
        this.gameRunning = false;
        this.hideMenu();
        this.showGameOver();
    }
    

    
    gameLoop() {
        const now = Date.now();
        
        if (this.gameRunning && !this.paused && !this.gameOver) {
            if (now - this.lastDropTime > this.dropInterval) {
                this.movePiece(0, 1);
                this.lastDropTime = now;
            }
            
            this.updateRotation();
            this.updateZoom();
        }
        
        this.drawBoard();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new Spew2Game();
}); 
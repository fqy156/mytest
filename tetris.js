// 俄罗斯方块游戏逻辑
class TetrisGame {
    constructor() {
        // 获取画布和上下文
        this.boardCanvas = document.getElementById('game-board');
        this.boardCtx = this.boardCanvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-piece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // 游戏常量
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        // 游戏状态
        this.board = this.createEmptyBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 5;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.dropCounter = 0;
        this.dropInterval = 1000; // 毫秒
        this.lastTime = 0;
        
        // 方块形状
        this.PIECES = [
            // I 形
            {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: '#00f0f0'
            },
            // J 形
            {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#0000f0'
            },
            // L 形
            {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#f0a000'
            },
            // O 形
            {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#f0f000'
            },
            // S 形
            {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                color: '#00f000'
            },
            // T 形
            {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#a000f0'
            },
            // Z 形
            {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ],
                color: '#f00000'
            }
        ];
        
        // 初始化游戏
        this.init();
    }
    
    // 创建空的游戏板
    createEmptyBoard() {
        return Array.from({ length: this.BOARD_HEIGHT }, () => 
            Array.from({ length: this.BOARD_WIDTH }, () => 0)
        );
    }
    
    // 初始化游戏
    init() {
        this.board = this.createEmptyBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.dropInterval = 1000;
        
        // 生成第一个和下一个方块
        this.nextPiece = this.createPiece();
        this.spawnPiece();
        
        // 绑定键盘事件
        this.bindEvents();
        
        // 开始游戏循环
        requestAnimationFrame((time) => this.update(time));
        
        // 更新分数显示
        this.updateScore();
    }
    
    // 生成一个随机方块
    createPiece() {
        const piece = this.PIECES[Math.floor(Math.random() * this.PIECES.length)];
        return {
            shape: piece.shape,
            color: piece.color,
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
            y: 0
        };
    }
    
    // 生成新方块
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        
        // 检查游戏是否结束
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.gameOver = true;
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('game-over').style.display = 'block';
        }
        
        // 更新下一个方块显示
        this.drawNextPiece();
    }
    
    // 绘制下一个方块
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (!this.nextPiece) return;
        
        const piece = this.nextPiece;
        const offsetX = (this.nextCanvas.width - piece.shape[0].length * this.BLOCK_SIZE) / 2;
        const offsetY = (this.nextCanvas.height - piece.shape.length * this.BLOCK_SIZE) / 2;
        
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.nextCtx.fillStyle = piece.color;
                    this.nextCtx.fillRect(
                        offsetX + x * this.BLOCK_SIZE, 
                        offsetY + y * this.BLOCK_SIZE, 
                        this.BLOCK_SIZE - 1, 
                        this.BLOCK_SIZE - 1
                    );
                    
                    // 添加边框效果
                    this.nextCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    this.nextCtx.strokeRect(
                        offsetX + x * this.BLOCK_SIZE, 
                        offsetY + y * this.BLOCK_SIZE, 
                        this.BLOCK_SIZE - 1, 
                        this.BLOCK_SIZE - 1
                    );
                }
            });
        });
    }
    
    // 绑定键盘事件
    bindEvents() {
        document.addEventListener('keydown', (event) => {
            if (this.gameOver) return;
            
            switch (event.keyCode) {
                case 37: // 左箭头
                    this.movePiece(-1, 0);
                    break;
                case 39: // 右箭头
                    this.movePiece(1, 0);
                    break;
                case 40: // 下箭头
                    this.movePiece(0, 1);
                    break;
                case 38: // 上箭头
                    this.rotatePiece();
                    break;
                case 32: // 空格
                    this.hardDrop();
                    break;
                case 80: // P键
                    this.togglePause();
                    break;
            }
        });
    }
    
    // 移动方块
    movePiece(dx, dy) {
        if (this.isPaused) return;
        
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        
        if (this.checkCollision()) {
            // 如果是向下移动且碰撞，则回退移动并锁定方块
            if (dy > 0) {
                this.currentPiece.y -= dy; // 回退Y轴移动
                this.lockPiece();
                this.clearLines();
                this.spawnPiece();
            } else {
                // 否则回退移动
                this.currentPiece.x -= dx;
                this.currentPiece.y -= dy;
            }
        }
        
        this.draw();
    }
    
    // 硬降（瞬间下落）
    hardDrop() {
        if (this.isPaused) return;
        
        while (!this.checkCollision(0, 1)) {
            this.currentPiece.y++;
        }
        
        this.lockPiece();
        this.clearLines();
        this.spawnPiece();
        this.draw();
    }
    
    // 旋转方块
    rotatePiece() {
        if (this.isPaused) return;
        
        const originalShape = this.currentPiece.shape;
        
        // 创建旋转后的形状（转置矩阵）
        const rows = originalShape.length;
        const cols = originalShape[0].length;
        const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - 1 - y] = originalShape[y][x];
            }
        }
        
        const originalShapeBackup = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        // 如果旋转后发生碰撞，则回退
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShapeBackup;
        }
        
        this.draw();
    }
    
    // 检查碰撞
    checkCollision(piece = this.currentPiece, dx = 0, dy = 0) {
        if (!piece) return false;
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;
                    
                    if (
                        newX < 0 || 
                        newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT ||
                        (newY >= 0 && this.board[newY][newX] !== 0)
                    ) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // 锁定方块
    lockPiece() {
        const piece = this.currentPiece;
        
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const boardY = piece.y + y;
                    if (boardY >= 0) { // 只锁定在游戏区域内的部分
                        this.board[boardY][piece.x + x] = piece.color;
                    }
                }
            });
        });
    }
    
    // 清除满行
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(value => value !== 0)) {
                // 移除这一行
                this.board.splice(y, 1);
                // 在顶部添加新的空行
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // 重新检查同一行索引
            }
        }
        
        if (linesCleared > 0) {
            // 更新得分
            const linePoints = [40, 100, 300, 1200]; // 1, 2, 3, 4行的得分
            this.score += linePoints[linesCleared - 1] * this.level;
            this.lines += linesCleared;
            
            // 每清除10行提升一个等级
            this.level = Math.floor(this.lines / 10) + 1;
            
            // 提高速度
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            
            // 更新分数显示
            this.updateScore();
        }
    }
    
    // 更新分数显示
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    // 切换暂停状态
    togglePause() {
        this.isPaused = !this.isPaused;
        this.draw(); // 重新绘制以更新暂停状态显示
    }
    
    // 更新游戏状态
    update(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        if (!this.gameOver && !this.isPaused) {
            this.dropCounter += deltaTime;
            if (this.dropCounter > this.dropInterval) {
                this.movePiece(0, 1);
                this.dropCounter = 0;
            }
        }
        
        this.draw();
        requestAnimationFrame((time) => this.update(time));
    }
    
    // 绘制游戏画面
    draw() {
        // 清除画布
        this.boardCtx.clearRect(0, 0, this.boardCanvas.width, this.boardCanvas.height);
        
        // 绘制游戏板
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x] !== 0) {
                    this.boardCtx.fillStyle = this.board[y][x];
                    this.boardCtx.fillRect(
                        x * this.BLOCK_SIZE, 
                        y * this.BLOCK_SIZE, 
                        this.BLOCK_SIZE - 1, 
                        this.BLOCK_SIZE - 1
                    );
                    
                    // 添加边框效果
                    this.boardCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    this.boardCtx.strokeRect(
                        x * this.BLOCK_SIZE, 
                        y * this.BLOCK_SIZE, 
                        this.BLOCK_SIZE - 1, 
                        this.BLOCK_SIZE - 1
                    );
                }
            }
        }
        
        // 绘制当前方块
        if (this.currentPiece && !this.isPaused) {
            const piece = this.currentPiece;
            piece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.boardCtx.fillStyle = piece.color;
                        this.boardCtx.fillRect(
                            (piece.x + x) * this.BLOCK_SIZE, 
                            (piece.y + y) * this.BLOCK_SIZE, 
                            this.BLOCK_SIZE - 1, 
                            this.BLOCK_SIZE - 1
                        );
                        
                        // 添加边框效果
                        this.boardCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                        this.boardCtx.strokeRect(
                            (piece.x + x) * this.BLOCK_SIZE, 
                            (piece.y + y) * this.BLOCK_SIZE, 
                            this.BLOCK_SIZE - 1, 
                            this.BLOCK_SIZE - 1
                        );
                    }
                });
            });
        }
        
        // 绘制网格线
        this.drawGrid();
        
        // 如果游戏暂停，显示暂停文本
        if (this.isPaused) {
            this.boardCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.boardCtx.fillRect(0, 0, this.boardCanvas.width, this.boardCanvas.height);
            
            this.boardCtx.font = 'bold 24px Arial';
            this.boardCtx.fillStyle = 'white';
            this.boardCtx.textAlign = 'center';
            this.boardCtx.textBaseline = 'middle';
            this.boardCtx.fillText('PAUSED', this.boardCanvas.width / 2, this.boardCanvas.height / 2);
        }
    }
    
    // 绘制网格线
    drawGrid() {
        this.boardCtx.strokeStyle = '#333';
        this.boardCtx.lineWidth = 0.5;
        
        // 垂直线
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.boardCtx.beginPath();
            this.boardCtx.moveTo(x * this.BLOCK_SIZE, 0);
            this.boardCtx.lineTo(x * this.BLOCK_SIZE, this.BOARD_HEIGHT * this.BLOCK_SIZE);
            this.boardCtx.stroke();
        }
        
        // 水平线
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.boardCtx.beginPath();
            this.boardCtx.moveTo(0, y * this.BLOCK_SIZE);
            this.boardCtx.lineTo(this.BOARD_WIDTH * this.BLOCK_SIZE, y * this.BLOCK_SIZE);
            this.boardCtx.stroke();
        }
    }
}

// 重新开始游戏
function restartGame() {
    document.getElementById('game-over').style.display = 'none';
    window.game = new TetrisGame();
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    window.game = new TetrisGame();
});

const WIDTH = 10;
const HEIGHT = 20;
const BLOCK_SIZE = 40; // 格寬
const FALL_SPEED = 1000; // 下降速度 用在 gameloop 循環
const ACCELERATED_FALL_SPEED = 100;
const fixedBlocks = []; // 記錄在底下的方塊

// 同種方塊的顏色定為一樣
const COLORS = [
    0xFF0000, // Red
    0x999999, // Green
    0x0000FF, // Blue
    0xFFFF00, // Yellow
    0xFF00FF, // Purple
];

const app = new PIXI.Application({
    width: WIDTH * BLOCK_SIZE,
    height: HEIGHT * BLOCK_SIZE,
    backgroundColor: 0x000000, // 網格顏色
});
document.body.appendChild(app.view);

// 生成網格
const grid = [];
for (let y = 0; y < HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < WIDTH; x++) {
        grid[y][x] = null;
    }
}

// init piece
const piece = {
    x: 0,
    y: 0,
    shape: [],
    color: 0xFFFFFF, // White
};

// Piece's shapes
const shapes = [
    { shape: [[1, 1, 1, 1]], colorIndex: 0 },        // I
    { shape: [[1, 1], [1, 1]], colorIndex: 1 },      // O
    { shape: [[1, 1, 1], [0, 1, 0]], colorIndex: 2 }, // T
    { shape: [[1, 1, 1], [1, 0, 0]], colorIndex: 3 }, // L
    { shape: [[1, 1, 1], [0, 0, 1]], colorIndex: 4 }, // J
    { shape: [[1, 1, 0], [0, 1, 1]], colorIndex: 5 }, // S
    { shape: [[0, 1, 1], [1, 1, 0]], colorIndex: 6 }, // Z
];

// 格子
function drawGrid() {
    const graphics = new PIXI.Graphics();
    // 白色隔線
    graphics.lineStyle(2, 0xFFFFFF, 1);

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            graphics.drawRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
    app.stage.addChild(graphics);
}

// 生成pieces
function drawPiece() {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(piece.color);
    // 遍歷方塊的每個單元格，並在畫布上繪製相應的矩形
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                graphics.drawRect((piece.x + x) * BLOCK_SIZE, (piece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
    app.stage.addChild(graphics);
}

// 生成方塊
function spawnPiece() {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    piece.shape = randomShape.shape;
    piece.x = Math.floor((WIDTH - randomShape.shape[0].length) / 2);
    piece.y = 0;
    piece.color = COLORS[randomShape.colorIndex]; // 依照COLORS的顏色
}

document.addEventListener('keydown', handleKeyPress);
document.addEventListener('keyup', handleKeyUp);
const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
const UP_KEY = 38;
const SPACE_KEY = 32;
let isAccelerating = false

// 處理鍵盤事件
function handleKeyPress(e) {
    console.log('e', e)
    // 左鍵
    if (e.keyCode === LEFT_KEY) {
        movePiece('left')
    }
    // 右鍵
    else if (e.keyCode === RIGHT_KEY) {
        movePiece('right')
    }
    // 下
    else if (e.keyCode === DOWN_KEY) {
        isAccelerating = true;
    }
    // 上 旋轉
    else if (e.keyCode === UP_KEY) {
        rotatePiece()
    }
    // 空白直接落下
    else if (e.keyCode === SPACE_KEY) {
        while (!doesPieceCollide()) {
            piece.y++;
        }
        // 碰撞將方塊移回原處
        piece.y--;
        // 鎖死方塊
        lockPiece();
    }
}

// keyup 重置
function handleKeyUp(e) {
    if (e.keyCode === DOWN_KEY) {
        isAccelerating = false
    }
}

// 旋轉方塊
function rotatePiece() {
    const originalShape = piece.shape;
    const rotatedShape = [];

    // 進行矩陣旋轉
    for (let y = 0; y < originalShape[0].length; y++) {
        rotatedShape[y] = [];
        for (let x = 0; x < originalShape.length; x++) {
            rotatedShape[y][x] = originalShape[originalShape.length - 1 - x][y];
        }
    }

    // 檢查旋轉後是否與其他方塊或邊界相碰撞
    if (!doesPieceCollide(rotatedShape)) {
        piece.shape = rotatedShape;
    }
}

// 方塊移動
function movePiece(e) {
    if (e === 'right') {
        piece.x++ // X座標向右移
        // 移動碰撞恢復到之前的位置
        if (doesPieceCollide()) {
            piece.x--;
        }
    }
    if (e === 'left') {
        piece.x--
        if (doesPieceCollide()) {
            piece.x++;
        }
    }
    if (e === 'down') {
        // piece.y++
    }
}

// 檢查碰撞
function doesPieceCollide() {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const gridX = piece.x + x;
                const gridY = piece.y + y;

                // 檢查落地與彼此ㄉ碰撞
                if (
                    gridX < 0 ||
                    gridX >= WIDTH ||
                    gridY >= HEIGHT ||
                    (gridY >= 0 && gridY < HEIGHT && grid[gridY][gridX] !== null)
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

// 到底部鎖死
function lockPiece() {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const gridX = piece.x + x;
                const gridY = piece.y + y;
                // 固定方塊在下方
                grid[gridY][gridX] = piece.color;
                // 寫入方塊的座標
                fixedBlocks.push({ x: gridX, y: gridY, color: piece.color });
            }
        }
    }
    // 生成方塊
    spawnPiece();
}

// Initialize the game
function init() {
    drawGrid();
    spawnPiece();
    drawPiece();
}

function gameLoop() {
    app.stage.removeChildren();

    const fallSpeed = isAccelerating ? ACCELERATED_FALL_SPEED : FALL_SPEED;

    // piece下降
    piece.y++;

    if (doesPieceCollide()) {
        // 碰撞將方塊移回原處
        piece.y--;
        // 鎖死方塊
        lockPiece();
    }

    // 繪製與更新元件
    drawGrid();

     // 繪製所有方塊
     for (const block of fixedBlocks) {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(block.color);
        graphics.drawRect(block.x * BLOCK_SIZE, block.y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        app.stage.addChild(graphics);
    }

    drawPiece();

    // 依據參數延遲
    // 使用 requestAnimationFrame 或 setTimeout 設定下一幀的呼叫
    if (isAccelerating) {
        requestAnimationFrame(gameLoop);
    } else if (!doesPieceCollide()) {
        setTimeout(gameLoop, fallSpeed);
    }
}

init();
gameLoop()
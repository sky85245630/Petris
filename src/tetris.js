const WIDTH = 10;
const HEIGHT = 20;
const BLOCK_SIZE = 40; // 格寬
const FALL_SPEED = 1000; // 下降速度 用在 gameloop 循環
const fixedBlocks = []; // 記錄在底下的方塊

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
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
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
    piece.shape = randomShape;
    piece.x = Math.floor((WIDTH - randomShape[0].length) / 2);
    piece.y = 0;
    piece.color = 0xFF0000; // red(hardcode) 
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
    setTimeout(gameLoop, FALL_SPEED);
}

init();
gameLoop()
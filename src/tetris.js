const WIDTH = 10;
const HEIGHT = 20;
const BLOCK_SIZE = 40; // 格寬
const FALL_SPEED = 500; // 下降速度 用在 gameloop 循環
const ACCELERATED_FALL_SPEED = 100;
let fixedBlocks = []; // 記錄在底下的方塊

// 同種方塊的顏色定為一樣
const COLORS = [
    0xFF5733, // Bright Red
    0x33FF77, // Bright Green
    0x3344FF, // Bright Blue
    0xFFFF33, // Bright Yellow
    0xFF33FF, // Bright Purple
];

const app = new PIXI.Application({
    width: WIDTH * BLOCK_SIZE,
    height: HEIGHT * BLOCK_SIZE,
    backgroundColor: 0xEEEEEE, // 網格顏色
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
    color: 0xAAAAAA, // White
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

    // 暫存旋轉前的位置和形狀
    const originalX = piece.x;
    const originalY = piece.y;
    const originalPieceShape = piece.shape;

    // 將方塊旋轉
    piece.shape = rotatedShape;

    // 檢查旋轉後是否與其他方塊或邊界相碰撞
    if (doesPieceCollide()) {
        // 如果碰撞，將方塊恢復到旋轉前的位置和形狀
        piece.x = originalX;
        piece.y = originalY;
        piece.shape = originalPieceShape;

        // 尝试微调以避免卡在边界
        if (!doesPieceCollide()) {
            // 尝试向左移动
            piece.x--;
            if (doesPieceCollide()) {
                // 如果向左移动仍然碰撞，尝试向右移动
                piece.x += 2;
                if (doesPieceCollide()) {
                    // 如果向右移动仍然碰撞，恢复到旋转前的位置和形状
                    piece.x--;
                    piece.shape = originalPieceShape;
                }
            }
        }
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
                    gridY >= HEIGHT
                ) {
                    return true;
                }

                // 检查是否与其他方块发生碰撞
                if (gridY >= 0 && grid[gridY][gridX] !== null) {
                    return true;
                }
            }
        }
    }
    return false;
}

// 到底部鎖死
// 修改 lockPiece 函数，将新方块叠加在已有的方块上
function lockPiece() {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const gridX = piece.x + x;
                const gridY = piece.y + y;

                // 叠加新方块在已有的方块上
                grid[gridY][gridX] = piece.color;
                fixedBlocks.push({ x: gridX, y: gridY, color: piece.color });
            }
        }
    }

    // 调用新的函数来处理行的清除和方块的下落
    handleRowClear();

    // 生成新方块
    spawnPiece();
}

// 新的函数来处理多行的清除和方块的下落
function handleRowClear() {
    let rowsToClear = [];
    
    for (let y = HEIGHT - 1; y >= 0; y--) {
        let rowIsFull = true;
        for (let x = 0; x < WIDTH; x++) {
            if (grid[y][x] === null) {
                rowIsFull = false;
                break;
            }
        }
        if (rowIsFull) {
            rowsToClear.push(y);
        }
    }

    // 清除满行和更新方块颜色信息
    for (const row of rowsToClear) {
        for (let x = 0; x < WIDTH; x++) {
            grid[row][x] = null;
            fixedBlocks = fixedBlocks.filter(block => block.x !== x || block.y !== row);
        }
    }

    // 将上方的方块向下移动并更新颜色信息
    for (let i = rowsToClear[0] - 1; i >= 0; i--) {
        for (let x = 0; x < WIDTH; x++) {
            if (grid[i][x] !== null) {
                // 移动格子内容
                grid[i + rowsToClear.length][x] = grid[i][x];
                grid[i][x] = null;

                // 更新颜色信息
                const color = fixedBlocks.find(block => block.x === x && block.y === i).color;
                fixedBlocks = fixedBlocks.filter(block => !(block.x === x && block.y === i));
                fixedBlocks.push({ x: x, y: i + rowsToClear.length, color: color });
            }
        }
    }
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

    // // 检查并消除已满的行
    // clearFullRows();

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
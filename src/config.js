export const game = {
    cols: 10,
    rows: 20,
    // 隱藏的row
    hiddenRows: 2,
    //速度相關
    fallSpeed: 30,
    fallSpeedMin: 3,
    fallSpeedupStep: 2,
    fallSpeedupDelay: 1800,
    // keyboard "Down"的速度
    dropModifier: 10,
}

const BOX_SIZE = 32;

export const display = {
    blockSize: BOX_SIZE,
    width: game.cols * BOX_SIZE,
    height: game.rows * BOX_SIZE
}

export const controls = {
    repeatDelay: 2,
    initialRepeatDelay: 10,
}

export default {game, display, controls}


// 定义游戏的一些常量和变量
let cols = 10;  // 游戏区列数
let colsOfBelt = 4;  // 游戏区列数
let rows = 20;  // 游戏区行数
let blockSize = 30; // 方块大小
let board = [];  // 游戏区

let currentPiece;  // 当前下落的方块
let nextPiece;     // 下一个方块
let pieceAttachedToMouse = false; // 是否有方块吸附在鼠标上

function setup() {
  createCanvas((cols + colsOfBelt) * blockSize, rows * blockSize);
  frameRate(30);  // 设置帧率
  initBoard();
  generatePiece();
}

function draw() {
  background(0);  // 黑色背景
  drawBoard();
  if (pieceAttachedToMouse) {
    followMouse();
  } else {
    currentPiece.update();
  }
  currentPiece.show();
}

function mousePressed() {
  if (!pieceAttachedToMouse) {
    // 检查鼠标是否点击在当前方块上
    let mouseXInBlocks = floor(mouseX / blockSize);
    let mouseYInBlocks = floor(mouseY / blockSize);

    if (
      mouseXInBlocks >= currentPiece.x &&
      mouseXInBlocks < currentPiece.x + currentPiece.shape[0].length &&
      mouseYInBlocks >= currentPiece.y &&
      mouseYInBlocks < currentPiece.y + currentPiece.shape.length
    ) {
      pieceAttachedToMouse = true;
    }
  } else {
    // 释放方块
    let targetX = floor(mouseX / blockSize);
    let targetY = floor(mouseY / blockSize);

    // 暂存原始位置
    let originalX = currentPiece.x;
    let originalY = currentPiece.y;

    currentPiece.x = targetX;
    currentPiece.y = targetY;

    if (checkCollision(currentPiece) || targetX >= cols) { // 禁止放置在灰色区域
      // 如果发生碰撞或在灰色区域，恢复到原始位置
      currentPiece.x = originalX;
      currentPiece.y = originalY;
    } else {
      // 没有碰撞，方块固定在新的位置
      placePiece(currentPiece);
      pieceAttachedToMouse = false;
    }
  }
}

function keyPressed() {
  if (pieceAttachedToMouse && key === 'r') {
    currentPiece.rotate();
  }
}

function initBoard() {
  for (let y = 0; y < rows; y++) {
    board[y] = [];
    for (let x = 0; x < cols + colsOfBelt; x++) {
      board[y][x] = 0;
    }
  }
}

function drawBoard() {
  // 画网格
  stroke(50);
  strokeWeight(1);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols + colsOfBelt; x++) {
      if (x < cols) {
        noFill();
        rect(x * blockSize, y * blockSize, blockSize, blockSize);
      } else {
        fill(100);
        rect(x * blockSize, y * blockSize, blockSize, blockSize);
      }
    }
  }

  // 绘制已固定的方块
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols + colsOfBelt; x++) {
      if (board[y][x] !== 0) {
        fill(board[y][x]);
        stroke(0);
        strokeWeight(2);
        rect(x * blockSize, y * blockSize, blockSize, blockSize);
      }
    }
  }
}

function generatePiece() {
  let pieces = [
    new Piece([[1, 1, 1], [0, 1, 0]], color(255, 0, 0)), // T
    new Piece([[1, 1], [1, 1]], color(0, 255, 0)),     // O
    new Piece([[1, 1, 0], [0, 1, 1]], color(0, 0, 255)), // S
    new Piece([[0, 1, 1], [1, 1, 0]], color(255, 165, 0)), // Z
    new Piece([[1, 0, 0], [1, 1, 1]], color(0, 255, 255)), // L
    new Piece([[0, 0, 1], [1, 1, 1]], color(255, 255, 0)), // J
    new Piece([[1, 1, 1, 1]], color(128, 0, 128)),     // I
  ];

  currentPiece = nextPiece || random(pieces);
  nextPiece = random(pieces);
}

function followMouse() {
  let mouseXInBlocks = floor(mouseX / blockSize);
  let mouseYInBlocks = floor(mouseY / blockSize);
  currentPiece.x = mouseXInBlocks;
  currentPiece.y = mouseYInBlocks;
}

function checkCollision(piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        let boardX = piece.x + x;
        let boardY = piece.y + y;
        if (
          boardX < 0 ||
          boardX >= cols + colsOfBelt ||
          boardY >= rows ||
          board[boardY][boardX] !== 0
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function placePiece(piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        let boardX = piece.x + x;
        let boardY = piece.y + y;
        board[boardY][boardX] = piece.color;
      }
    }
  }
  clearLines();
  generatePiece();
}

function clearLines() {
  for (let y = rows - 1; y >= 0; y--) {
    let fullLine = true;
    for (let x = 0; x < cols; x++) {
      if (board[y][x] === 0) {
        fullLine = false;
        break;
      }
    }
    if (fullLine) {
      board.splice(y, 1);
      board.unshift(Array(cols + colsOfBelt).fill(0));
    }
  }
}

// 方块类
class Piece {
  constructor(shape, color) {
    this.shape = shape;
    this.color = color;
    this.x = cols + floor(colsOfBelt / 2) - floor(shape[0].length / 2); // 修改为灰色区域中间
    this.y = 0;
  }

  show() {
    fill(this.color);
    stroke(0);
    strokeWeight(2);
    for (let y = 0; y < this.shape.length; y++) {
      for (let x = 0; x < this.shape[y].length; x++) {
        if (this.shape[y][x]) {
          rect((this.x + x) * blockSize, (this.y + y) * blockSize, blockSize, blockSize);
        }
      }
    }
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    if (checkCollision(this)) {
      this.x -= dx;
      this.y -= dy;
    }
  }

  rotate() {
    let tempShape = this.shape;
    this.shape = this.shape[0].map((_, index) =>
      this.shape.map(row => row[index])
    ).reverse();

    if (checkCollision(this)) {
      this.shape = tempShape;
    }
  }

  update() {
    if (!pieceAttachedToMouse) {
      this.move(0, 1);
    }
  }
}

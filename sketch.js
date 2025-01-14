// 定义游戏的一些常量和变量
let cols = 10;  // 游戏区列数
let rows = 20;  // 游戏区行数
let blockSize = 30; // 方块大小
let board = [];  // 游戏区

let currentPiece;  // 当前下落的方块
let nextPiece;     // 下一个方块

function setup() {
  createCanvas(cols * blockSize, rows * blockSize);
  frameRate(10);  // 设置帧率
  initBoard();
  generatePiece();
}

function draw() {
  background(0);  // 黑色背景
  drawBoard();
  currentPiece.update();
  currentPiece.show();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    currentPiece.move(-1, 0);
  } else if (keyCode === RIGHT_ARROW) {
    currentPiece.move(1, 0);
  } else if (keyCode === DOWN_ARROW) {
    currentPiece.move(0, 1);
  } else if (keyCode === UP_ARROW) {
    currentPiece.rotate();
  }
}

function initBoard() {
  for (let y = 0; y < rows; y++) {
    board[y] = [];
    for (let x = 0; x < cols; x++) {
      board[y][x] = 0;
    }
  }
}

function drawBoard() {
  // 画网格
  stroke(50);
  strokeWeight(1);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      noFill();
      rect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
  }

  // 绘制已固定的方块
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
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

function checkCollision(piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        let boardX = piece.x + x;
        let boardY = piece.y + y;
        if (boardX < 0 || boardX >= cols || boardY >= rows || board[boardY][boardX] !== 0) {
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
      board.unshift(Array(cols).fill(0));
    }
  }
}

// 方块类
class Piece {
  constructor(shape, color) {
    this.shape = shape;
    this.color = color;
    this.x = floor(cols / 2) - floor(shape[0].length / 2);
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
      if (dy > 0) {
        placePiece(this);
      }
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
    this.move(0, 1);
  }
}

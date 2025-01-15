let cols = 10;  // 游戏区列数
let rows = 20;  // 游戏区行数
let blockSize = 30; // 方块大小
let board = [];  // 游戏区

let conveyorBelt = [];  // 传送带上方块
let draggingPiece = null;  // 当前正在拖拽的方块
let offsetX = 0;  // 鼠标相对方块的偏移量
let offsetY = 0;  // 鼠标相对方块的偏移量

function setup() {
  createCanvas(2 * cols * blockSize, rows * blockSize + 100);  // 双倍宽度并多出空间给传送带
  frameRate(10);  // 设置帧率
  initBoard();
  initConveyorBelt();
}

function draw() {
  background(0);  // 黑色背景
  drawBoard();
  drawConveyorBelt();
  
  if (draggingPiece) {
    // 拖拽时显示方块，跟随鼠标移动
    draggingPiece.x = Math.floor(mouseX / blockSize) - offsetX;
    draggingPiece.y = Math.floor(mouseY / blockSize) - offsetY;
    draggingPiece.show();
  }
}

function mousePressed() {
  // 检查是否点击了传送带上的方块
  for (let i = 0; i < conveyorBelt.length; i++) {
    let piece = conveyorBelt[i];
    let pieceX = i * (blockSize + 5);  // 计算传送带上方块的x位置
    
    if (mouseX >= pieceX && mouseX <= pieceX + blockSize &&
        mouseY >= rows * blockSize && mouseY <= rows * blockSize + blockSize) {
      draggingPiece = piece;
      offsetX = Math.floor((mouseX - pieceX) / blockSize);
      offsetY = Math.floor((mouseY - (rows * blockSize)) / blockSize);
      conveyorBelt.splice(i, 1);  // 移除传送带上的方块
      break;
    }
  }
}

function mouseReleased() {
  if (draggingPiece) {
    // 放置方块，检查是否在游戏区内
    let gameX = Math.floor(draggingPiece.x);
    let gameY = Math.floor(draggingPiece.y);

    if (gameX >= 0 && gameX < cols && gameY >= 0 && gameY < rows && !checkCollision(draggingPiece)) {
      placePiece(draggingPiece);  // 放置方块
    }

    draggingPiece = null;  // 重置拖拽状态
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

function initConveyorBelt() {
  let pieces = [
    new Piece([[1, 1, 1], [0, 1, 0]], color(255, 0, 0)), // T
    new Piece([[1, 1], [1, 1]], color(0, 255, 0)),     // O
    new Piece([[1, 1, 0], [0, 1, 1]], color(0, 0, 255)), // S
    new Piece([[0, 1, 1], [1, 1, 0]], color(255, 165, 0)), // Z
    new Piece([[1, 0, 0], [1, 1, 1]], color(0, 255, 255)), // L
    new Piece([[0, 0, 1], [1, 1, 1]], color(255, 255, 0)), // J
    new Piece([[1, 1, 1, 1]], color(128, 0, 128)),     // I
  ];
  
  // 初始化传送带
  for (let i = 0; i < 5; i++) {
    let piece = random(pieces);
    piece.x = i * (blockSize + 5);  // 传送带上方块的x位置
    piece.y = rows * blockSize;  // 传送带位置固定
    conveyorBelt.push(piece);
  }
}

function drawConveyorBelt() {
  // 绘制传送带背景
  fill(100);
  noStroke();
  rect(0, rows * blockSize, width, blockSize);  // 绘制传送带的背景
  
  // 绘制传送带上的方块
  for (let i = 0; i < conveyorBelt.length; i++) {
    let piece = conveyorBelt[i];
    piece.show(i * (blockSize + 5), rows * blockSize);  // 方块位置
  }
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
}

// 方块类
class Piece {
  constructor(shape, color) {
    this.shape = shape;
    this.color = color;
    this.x = 0;
    this.y = 0;
  }

  show(xOffset = 0, yOffset = 0) {
    fill(this.color);
    stroke(0);
    strokeWeight(2);
    for (let y = 0; y < this.shape.length; y++) {
      for (let x = 0; x < this.shape[y].length; x++) {
        if (this.shape[y][x]) {
          rect((this.x + x) * blockSize + xOffset, (this.y + y) * blockSize + yOffset, blockSize, blockSize);
        }
      }
    }
  }
}

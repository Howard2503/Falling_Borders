// 定义游戏的一些常量和变量
let cols = 10;  // 游戏区列数
let colsOfBelt = 4;  // 游戏区列数
let rows = 20;  // 游戏区行数
let blockSize = 30; // 方块大小
let board = [];  // 游戏区

let currentPiece;  // 当前下落的方块
let nextPiece;     // 下一个方块
let pieceAttachedToMouse = false; // 是否有方块吸附在鼠标上

let bgm; // 定义BGM变量

let offsetX, offsetY; // 计算游戏区域的偏移量

let bgImage; // 定义背景图片变量

function preload() {
  bgImage = loadImage('BG.png'); // 预加载背景图片
  bgm = loadSound('BGM.mp3');
}

// function draw() {
//   image(bgImage, 0, 0, width, height); // 绘制背景图片
//   drawBoard();

//   if (pieceAttachedToMouse) {
//     followMouse();
//   } else {
//     currentPiece.update();
//   }
//   currentPiece.show();
// }

function draw() {
  image(bgImage, 0, 0, width, height); // 绘制背景图片
  drawBoard();

  // 绘制英语介绍
  drawInstructions();

  if (pieceAttachedToMouse) {
    followMouse();
  } else {
    currentPiece.update();
  }
  currentPiece.show();
}

function drawInstructions() {
  let instructions = "Click on a block to select it.\n" +
                     "Move the block by dragging it with the mouse.\n" +
                     "Press 'R' to rotate the block.\n" +
                     "Click again to place the block.";
  fill(255);  // Text color
  textSize(16);  // Set text size
  textAlign(LEFT, TOP);  // Align text to top-left
  text(instructions, 200, height / 3);  // Position text on the right side
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  initBoard();
  generatePiece();

  offsetX = (width - (cols + colsOfBelt) * blockSize) / 2;
  offsetY = (height - rows * blockSize) / 2;

  if (!bgm.isPlaying()) {
    bgm.loop();
    bgm.setVolume(0.5);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    let fs = fullscreen();
    fullscreen(!fs);
  }

  if (key === 'p' || key === 'P') {
    if (bgm.isPlaying()) {
      bgm.pause(); // 按M暂停音乐
    } else {
      bgm.loop(); // 按M恢复播放
    }
  }

  if (pieceAttachedToMouse && key === 'r') {
    currentPiece.rotate();
  }
}

function mousePressed() {
  let mouseXInBlocks = floor((mouseX - offsetX) / blockSize);
  let mouseYInBlocks = floor((mouseY - offsetY) / blockSize);

  // 如果当前已有拖动的方块，尝试放下
  if (pieceAttachedToMouse) {
    let targetX = mouseXInBlocks;
    let targetY = mouseYInBlocks;

    let originalX = currentPiece.x;
    let originalY = currentPiece.y;

    currentPiece.x = targetX;
    currentPiece.y = targetY;

    // 检查是否有效放置
    if (checkCollision(currentPiece) || targetX >= cols) { 
      // 如果碰撞或者超出界限，恢复原位置
      currentPiece.x = originalX;
      currentPiece.y = originalY;
    } else {
      // 否则放置方块
      placePiece(currentPiece);
      pieceAttachedToMouse = false;
    }
  } else {
    // 检查 `currentPiece` 是否被点击
    if (
      mouseXInBlocks >= currentPiece.x &&
      mouseXInBlocks < currentPiece.x + currentPiece.shape[0].length &&
      mouseYInBlocks >= currentPiece.y &&
      mouseYInBlocks < currentPiece.y + currentPiece.shape.length
    ) {
      pieceAttachedToMouse = true;
      return;
    }

    // 检查 `board` 里的方块是否被点击
    if (board[mouseYInBlocks] && board[mouseYInBlocks][mouseXInBlocks] !== 0) {
      let selectedColor = board[mouseYInBlocks][mouseXInBlocks];

      // 生成新方块对象（默认 1x1 的单方块）
      currentPiece = new Piece([[1]], selectedColor);
      currentPiece.x = mouseXInBlocks;
      currentPiece.y = mouseYInBlocks;
      
      // 从 `board` 里移除该方块
      board[mouseYInBlocks][mouseXInBlocks] = 0;

      pieceAttachedToMouse = true;
    }
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
  stroke(50);
  strokeWeight(1);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols + colsOfBelt; x++) {
      let screenX = offsetX + x * blockSize;
      let screenY = offsetY + y * blockSize;

      if (x < cols) {
        fill(0);
        rect(screenX, screenY, blockSize, blockSize);
      } else {
        fill(100);
        rect(screenX, screenY, blockSize, blockSize);
      }
    }
  }

  // 绘制已固定的方块
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols + colsOfBelt; x++) {
      if (board[y][x] !== 0) {
        let screenX = offsetX + x * blockSize;
        let screenY = offsetY + y * blockSize;
        fill(board[y][x]);
        stroke(0);
        strokeWeight(2);
        rect(screenX, screenY, blockSize, blockSize);
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
  let mouseXInBlocks = floor((mouseX - offsetX) / blockSize);
  let mouseYInBlocks = floor((mouseY - offsetY) / blockSize);
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
          let screenX = offsetX + (this.x + x) * blockSize;
          let screenY = offsetY + (this.y + y) * blockSize;
          rect(screenX, screenY, blockSize, blockSize);
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

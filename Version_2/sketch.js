// 定义游戏的一些常量和变量
let cols = 10;  // 游戏区列数
let colsOfBelt = 4;  // 游戏区列数
let rows = 20;  // 游戏区行数
let blockSize = 30; // 方块大小
let board = [];  // 游戏区

let currentPiece;  // 当前下落的方块
let nextPiece;     // 下一个方块
let pieceAttachedToMouse = false; // 是否有方块吸附在鼠标上
let gameOver = false; // 游戏结束状态
let lastPieceGeneratedTime = 0; // 上次生成方块的时间
let pieceGenerationInterval = 10000; // 10秒生成一个新方块

function setup() {
  createCanvas((cols + colsOfBelt) * blockSize, rows * blockSize);
  frameRate(30);  // 设置帧率
  initBoard();
  generatePiece();
}

function draw() {
  if (gameOver) {
    background(0);
    fill(255, 0, 0);
    textSize(50);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2);
    noLoop();
    return;
  }

  background(0);  // 黑色背景
  drawBoard();

  if (pieceAttachedToMouse) {
    followMouse();
  } else {
    currentPiece.update();
  }
  currentPiece.show();

  // 检查灰色区域是否溢出
  if (checkBeltOverflow()) {
    gameOver = true;
  }

  // 检查是否需要生成新方块
  if (millis() - lastPieceGeneratedTime > pieceGenerationInterval) {
    generatePiece();
    lastPieceGeneratedTime = millis();
  }
}

function mousePressed() {
  if (!pieceAttachedToMouse) {
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
    let targetX = floor(mouseX / blockSize);
    let targetY = floor(mouseY / blockSize);
    let originalX = currentPiece.x;
    let originalY = currentPiece.y;
    
    console.log("Removing piece from board before placing new position...");
    removePieceFromBoard(currentPiece.x, currentPiece.y, currentPiece); // **确保旧位置被清除**
    
    currentPiece.x = targetX;
    currentPiece.y = targetY;

    if (checkCollision(currentPiece) || targetX >= cols) {
      currentPiece.x = originalX;
      currentPiece.y = originalY;
    } else {
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

  let newPiece = random(pieces);
  if (!pieceAttachedToMouse) {
    currentPiece = newPiece;
  } else {
    let startX = cols + floor(colsOfBelt / 2) - floor(newPiece.shape[0].length / 2);
    newPiece.x = startX;
    newPiece.y = 0; // 开始位置为灰色区域顶部
    currentPiece = newPiece;
  }
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
        board[boardY][boardX] = 1;  // **改动: 存储 1 而不是颜色对象**
      }
    }
  }
  clearLines();
}

// function clearLines() {
//   for (let y = rows - 1; y >= 0; y--) {
//     let fullBlackLine = true;
//     let fullGrayLine = true;

//     // **检查黑色区域**
//     for (let x = 0; x < cols; x++) {
//       if (board[y][x] === 0) {
//         fullBlackLine = false;
//         break;
//       }
//     }

//     // **检查灰色区域**
//     for (let x = cols; x < cols + colsOfBelt; x++) {
//       if (board[y][x] !== 1) {  // 只检查被填充的方块
//         fullGrayLine = false;
//         break;
//       }
//     }

//     // **清除黑色区域整行**
//     if (fullBlackLine) {
//       board.splice(y, 1);
//       board.unshift(Array(cols).fill(0).concat(Array(colsOfBelt).fill(-1))); // **改动: 只清除黑色区域**
//     }

//     // **清除灰色区域整行**
//     if (fullGrayLine) {
//       for (let x = cols; x < cols + colsOfBelt; x++) {
//         board[y][x] = -1;  // **改动: 还原灰色背景**
//       }
//     }
//   }
// }

function clearLines() {
  for (let y = rows - 1; y >= 0; y--) {
    let fullBlackLine = true;
    let fullGrayLine = true;

    // 检查黑色区域是否整行填满
    for (let x = 0; x < cols; x++) {
      if (board[y][x] === 0) {
        fullBlackLine = false;
        break;
      }
    }

    // 检查灰色区域是否整行填满
    for (let x = cols; x < cols + colsOfBelt; x++) {
      if (board[y][x] !== 1) {  // 只检查被填充的方块
        fullGrayLine = false;
        break;
      }
    }

    // **只清除整行填满的黑色区域**
    if (fullBlackLine) {
      board.splice(y, 1); // 删除该行
      board.unshift(Array(cols).fill(0).concat(board[0].slice(cols))); // 只重置黑色区域
    }

    // **清除整行填满的灰色区域**
    if (fullGrayLine) {
      for (let x = cols; x < cols + colsOfBelt; x++) {
        board[y][x] = -1;  // 还原灰色背景
      }
    }
  }
}

function checkBeltOverflow() {
  let overflow = false;
  for (let x = cols; x < cols + colsOfBelt; x++) {
    if (board[0][x] !== 0) {
      overflow = true;
      board[0][x] = 0; // **改动: 发现溢出后清除方块**
    }
  }
  return overflow;
}

// function removePieceFromBoard(x, y, piece) {
//   for (let i = 0; i < piece.shape.length; i++) {
//     for (let j = 0; j < piece.shape[i].length; j++) {
//       if (piece.shape[i][j]) {
//         let boardX = x + j;
//         let boardY = y + i;
//         if (boardY >= 0 && boardY < rows && boardX >= 0 && boardX < cols + colsOfBelt) {
//           if (boardX >= cols) {
//             board[boardY][boardX] = -1; // **改动: 还原灰色区域的背景**
//           } else {
//             board[boardY][boardX] = 0; // **改动: 还原黑色区域的背景**
//           }
//         }
//       }
//     }
//   }
// }

function removePieceFromBoard(x, y, piece) {
  for (let i = 0; i < piece.shape.length; i++) {
    for (let j = 0; j < piece.shape[i].length; j++) {
      if (piece.shape[i][j]) {
        let boardX = x + j;
        let boardY = y + i;
        if (boardY >= 0 && boardY < rows && boardX >= 0 && boardX < cols + colsOfBelt) {
          if (boardX >= cols) {
            // 确保是灰色区域才填充 -1
            if (board[boardY][boardX] === 1) {
              board[boardY][boardX] = -1; 
            }
          } else {
            // 确保是黑色区域才填充 0
            if (board[boardY][boardX] === 1) {
              board[boardY][boardX] = 0;
            }
          }
        }
      }
    }
  }
}

class Piece {
  constructor(shape, color) {
    this.shape = shape;
    this.color = color;
    this.x = cols + floor(colsOfBelt / 2) - floor(shape[0].length / 2); // 初始位置在灰色区域中间
    this.y = 0; // 方块顶部开始
    this.dropping = true; // 新增: 是否处于掉落状态
  }

  show() {
    fill(this.color);
    stroke(0);
    strokeWeight(2);
    for (let y = 0; y < this.shape.length; y++) {
      for (let x = 0; x < this.shape[y].length; x++) {
        if (this.shape[y][x]) {
          rect(
            (this.x + x) * blockSize,
            (this.y + y) * blockSize,
            blockSize,
            blockSize
          );
        }
      }
    }
  }

  update() {
    if (this.dropping) {
      this.y++;
      if (this.checkBottomCollision()) {
        this.y--; // 回退一步
        this.dropping = false; // 停止掉落
        placePiece(this); // 固定到板上
      }
    }
  }

  rotate() {
    let newShape = [];
    for (let x = 0; x < this.shape[0].length; x++) {
      let newRow = [];
      for (let y = this.shape.length - 1; y >= 0; y--) {
        newRow.push(this.shape[y][x]);
      }
      newShape.push(newRow);
    }
    this.shape = newShape;
    // 检查旋转后是否会冲突
    if (this.checkBottomCollision() || checkCollision(this)) {
      this.rotateBack();
    }
  }

  rotateBack() {
    let newShape = [];
    for (let x = this.shape[0].length - 1; x >= 0; x--) {
      let newRow = [];
      for (let y = 0; y < this.shape.length; y++) {
        newRow.push(this.shape[y][x]);
      }
      newShape.push(newRow);
    }
    this.shape = newShape;
  }

  checkBottomCollision() {
    for (let y = 0; y < this.shape.length; y++) {
      for (let x = 0; x < this.shape[y].length; x++) {
        if (this.shape[y][x]) {
          let boardX = this.x + x;
          let boardY = this.y + y;
          if (boardY + 1 >= rows || board[boardY + 1][boardX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

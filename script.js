const canvas = document.querySelector('canvas');
const modal = document.querySelector('.modal');
const buttonGame = document.querySelector('.button-game');
const ctx = canvas.getContext('2d');
const widthCanvas = (canvas.width = 250);
const heightCanvas = (canvas.height = 320);

class BreakoutGame {
  //Variables of Paddle
  paddleWidth = 40;
  paddleHeight = 8;
  paddleColor = 'skyblue';
  paddleX = (canvas.width - this.paddleWidth) / 2;
  paddleY = canvas.height - 40;
  initGame = this.initGame.bind(this);
  velocityPaddle = 5;

  //Variables of Keyboard Events
  arrowLeftPressed = false;
  arrowRightPressed = false;
  arrowApressed = false;
  arrowSpressed = false;

  //Variables of Ball
  ballWidth = 8;
  ballHeight = this.ballWidth;
  ballColor = 'DodgerBlue';
  ballX = (canvas.width - this.ballWidth) / 2;
  ballY = this.paddleY - this.ballHeight;
  ballDirX = 3;
  ballDirY = -3;

  //Variables of Bricks
  brickWidth = 29;
  brickHeight = 15;
  brickColors = [
    '#f40752',
    '#fff95b',
    '#f89b29',
    '#0061ff',
    '#07f49e',
    '#ff51eb'
  ];
  bricks = [];
  brickPadding = 2;
  brickCols = 8;
  brickRows = 6;
  STATUS = {
    ACTIVE: 1,
    DESTROYED: 0
  };

  //General Variables
  counterGame = 0;

  constructor() {
    this.initKeyboardEvents();
    this.initTouchEvents();
    this.fillArrayOfBricks();
  }

  fillArrayOfBricks() {
    for (let row = 0; row < this.brickRows; row++) {
      this.bricks[row] = [];
      for (let col = 0; col < this.brickCols; col++) {
        let brickX =
          col * (this.brickPadding + this.brickWidth) + this.brickPadding;
        let brickY =
          row * (this.brickPadding + this.brickHeight) + this.brickPadding;
        let color = this.brickColors[row];
        let status = this.STATUS.ACTIVE;

        this.bricks[row][col] = {
          x: brickX,
          y: brickY,
          colorBrick: color,
          status
        };
      }
    }
  }

  drawBricks() {
    for (let row = 0; row < this.brickRows; row++) {
      for (let col = 0; col < this.brickCols; col++) {
        const currentBrick = this.bricks[row][col];
        const { x, y, colorBrick, status } = currentBrick;
        if (status === this.STATUS.DESTROYED) continue;

        ctx.beginPath();
        ctx.fillStyle = colorBrick;
        ctx.fillRect(x, y, this.brickWidth, this.brickHeight);
        ctx.closePath();
      }
    }
  }

  collisionDetectionBricks() {
    let arrayDeStatus = [];
    for (let row = 0; row < this.brickRows; row++) {
      for (let col = 0; col < this.brickCols; col++) {
        const currentBrick = this.bricks[row][col];
        const { x, y, status } = currentBrick;
        if (status === this.STATUS.DESTROYED) continue;

        if (
          this.ballX > x &&
          this.ballX < x + this.brickWidth &&
          this.ballY > y &&
          this.ballY < y + this.brickHeight
        ) {
          this.ballDirY = -this.ballDirY;
          currentBrick.status = this.STATUS.DESTROYED;
          this.counterGame += 20;
        }
      }
    }

    for (let r = 0; r < this.brickRows; r++) {
      for (let c = 0; c < this.brickCols; c++) {
        arrayDeStatus.push(this.bricks[r][c].status);
      }
    }

    let allBricksDestroyed = arrayDeStatus.every(status => status === 0);
    if (allBricksDestroyed) {
      this.bricks = [];
      this.fillArrayOfBricks();
    }
  }

  drawPaddle() {
    ctx.beginPath();
    ctx.fillStyle = this.paddleColor;
    ctx.fillRect(
      this.paddleX,
      this.paddleY,
      this.paddleWidth,
      this.paddleHeight
    );
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '14px Impact';
    ctx.fillText(`${this.counterGame}`, widthCanvas - 20, heightCanvas - 10);
    ctx.stroke();
  }

  movePaddle() {
    if (this.arrowLeftPressed && this.paddleX > 0) {
      this.paddleX -= this.velocityPaddle;
    } else if (
      this.arrowRightPressed &&
      this.paddleX < widthCanvas - this.paddleWidth
    ) {
      this.paddleX += this.velocityPaddle;
    }
  }

  eventKeboardFunction(boolean, key) {
    if (key === 'ArrowRight' || key === 'd' || key === 'D') {
      this.arrowRightPressed = boolean;
    } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
      this.arrowLeftPressed = boolean;
    }
  }

  initKeyboardEvents() {
    document.addEventListener('keydown', ({ key }) => {
      this.eventKeboardFunction(true, key);
    });

    document.addEventListener('keyup', ({ key }) => {
      this.eventKeboardFunction(false, key);
    });
  }

  initTouchEvents() {
    const passive = { passive: true };
    let lastPosition = 0;

    const handleTouchStart = e => {
      const handleTouchMove = e => {
        const { top, left } = canvas.getBoundingClientRect();
        const currentDeltaX = e.touches[0].clientX;
        const deltaDifference = currentDeltaX - left;
        if (
          deltaDifference > 0 &&
          deltaDifference < widthCanvas - this.paddleWidth
        ) {
          this.paddleX = deltaDifference;
          lastPosition = deltaDifference;
        }
      };

      const handleTouchEnd = () => {
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        this.paddleX = lastPosition;
      };

      canvas.addEventListener('touchmove', handleTouchMove, passive);
      canvas.addEventListener('touchend', handleTouchEnd, passive);
    };

    canvas.addEventListener('touchstart', handleTouchStart, passive);
  }

  drawBall() {
    ctx.beginPath();
    ctx.fillStyle = this.ballColor;
    ctx.fillRect(this.ballX, this.ballY, this.ballWidth, this.ballHeight);
    ctx.closePath();
  }

  moveBall() {
    if (this.ballY < this.ballWidth) {
      this.ballDirY = -this.ballDirY;
    }
    if (this.ballX < this.ballWidth) {
      this.ballDirX = -this.ballDirX;
    }
    if (this.ballX > widthCanvas - this.ballWidth) {
      this.ballDirX = -this.ballDirX;
    }

    if (
      this.ballX > this.paddleX &&
      this.ballX < this.paddleX + this.paddleWidth &&
      this.ballY + this.ballHeight > this.paddleY &&
      this.ballY + this.paddleHeight < this.paddleY + this.paddleHeight
    ) {
      this.ballDirY = -this.ballDirY;
    } else if (
      this.ballX <= this.paddleX + this.paddleWidth &&
      this.ballX >= this.paddleX + this.paddleWidth - 2 &&
      this.ballY + this.ballHeight > this.paddleY &&
      this.ballY + this.ballHeight <= this.paddleY + this.paddleHeight
    ) {
      this.ballDirY = -this.ballDirY;
      this.ballDirX = -this.ballDirX;
    } else if (
      this.ballX + this.ballWidth >= this.paddleX &&
      this.ballX + this.ballWidth <= this.paddleX + 2 &&
      this.ballY + this.ballHeight > this.paddleY &&
      this.ballY + this.ballHeight <= this.paddleY + this.paddleHeight
    ) {
      this.ballDirY = -this.ballDirY;
      this.ballDirX = -this.ballDirX;
    } else if (this.ballY > heightCanvas - this.ballHeight) {
      console.log('Game over');
      modal.showModal();
    }

    this.ballX += this.ballDirX;
    this.ballY += this.ballDirY;
  }

  initGame() {
    ctx.clearRect(0, 0, widthCanvas, heightCanvas);
    this.drawPaddle();
    this.movePaddle();
    this.drawBall();
    this.moveBall();
    this.drawBricks();
    this.collisionDetectionBricks();

    requestAnimationFrame(this.initGame);
  }
}

const game = new BreakoutGame();
game.initGame();

document.addEventListener('click', e => {
  if (e.target === buttonGame) {
    location.reload();
  }
});

//Media
let currentOrientation = screen.orientation.type;

function handleOrientation() {
  let newOrientation = screen.orientation.type;

  if (
    currentOrientation.startsWith('portrait') &&
    newOrientation.startsWith('landscape')
  ) {
    currentOrientation = newOrientation;
    location.reload();
  } else if (
    currentOrientation.startsWith('landscape') &&
    newOrientation.startsWith('portrait')
  ) {
    currentOrientation = newOrientation;
    location.reload();
  }
}

handleOrientation();

screen.orientation.addEventListener('change', handleOrientation);

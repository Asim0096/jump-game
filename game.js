const canvas = document.getElementById('gameCanvas');
canvas.width = window.innerWidth;  // Set canvas width to window width
canvas.height = window.innerHeight;  // Set canvas height to window height
const ctx = canvas.getContext('2d');

let player = { x: 50, y: 250, width: 40, height: 40, velocityY: 0, jumping: false };
let gravity = 0.5;
let score = 0;
let obstacles = [];
let gameOver = false;
let gameStarted = false;

function jump() {
  if (!player.jumping && !gameOver && gameStarted) {
    player.velocityY = -10;
    player.jumping = true;
  }
}

document.addEventListener('keydown', function(e) {
  if (e.code === 'Space') {
    if (!gameStarted) {
      gameStarted = true;
    }
    jump();
  } else if (e.code === 'Enter' && gameOver) {
    resetGame();
  }
});

function spawnObstacle() {
  if (gameStarted && !gameOver) {
    obstacles.push({ x: canvas.width, y: 270, width: 20, height: 30, scored: false });
  }
}

setInterval(spawnObstacle, 1500);

function detectCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function resetGame() {
  player.y = 250;
  player.velocityY = 0;
  player.jumping = false;
  obstacles = [];
  score = 0;
  gameOver = false;
  gameStarted = false;
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the ground
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 280, canvas.width, 20);

  if (!gameOver && gameStarted) {
    player.velocityY += gravity;
    player.y += player.velocityY;
    if (player.y > 270) {
      player.y = 270;
      player.jumping = false;
    }
  }

  // Draw the player (blue rectangle)
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw obstacles
  ctx.fillStyle = 'red';
  for (let i = 0; i < obstacles.length; i++) {
    let obs = obstacles[i];
    if (!gameOver && gameStarted) obs.x -= 5;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    if (!gameOver && detectCollision(player, obs)) {
      gameOver = true;
    }

    if (obs.x + obs.width < player.x && !obs.scored) {
      score++;
      obs.scored = true;
    }
  }

  // Display score
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 20);

  // Game start screen
  if (!gameStarted) {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Press Space to Start', 260, 150);
  }

  // Game over screen
  if (gameOver) {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over! Press Enter to Restart', 200, 150);
  }

  requestAnimationFrame(update);
}

update();

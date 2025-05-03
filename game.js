// Player setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 50, y: 250, width: 30, height: 30, velocityY: 0, jumping: false };
let gravity = 0.5;
let score = 0;
let obstacles = [];
let gameOver = false;

function jump() {
  if (!player.jumping) {
    player.velocityY = -10;
    player.jumping = true;
  }
}

document.addEventListener('keydown', function(e) {
  if (e.code === 'Space') jump();
});

function spawnObstacle() {
  obstacles.push({ x: canvas.width, y: 270, width: 20, height: 30 });
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

function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player physics
  player.velocityY += gravity;
  player.y += player.velocityY;
  if (player.y > 270) {
    player.y = 270;
    player.jumping = false;
  }

  // Draw player
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Obstacles
  ctx.fillStyle = 'red';
  for (let i = 0; i < obstacles.length; i++) {
    let obs = obstacles[i];
    obs.x -= 5;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    if (detectCollision(player, obs)) {
      gameOver = true;
      alert('Game Over! Score: ' + score);
      return;
    }

    if (obs.x + obs.width < player.x && !obs.scored) {
      score++;
      obs.scored = true;
    }
  }

  // Draw score
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 20);

  requestAnimationFrame(update);
}

update();

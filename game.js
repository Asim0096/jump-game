window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // ثابت
  const PLAYER_RADIUS = 30;
  const OBSTACLE_WIDTH = 20;
  const OBSTACLE_HEIGHT = 25;
  const MIN_SPAWN_INTERVAL = 800; // الحد الأدنى بين العوائق
  let spawnInterval = 1800; // البداية (أقصر من قبل)
  let spawnTimer = 0;

  let groundHeight;
  let player;
  let gravity = 0.5;
  let score = 0;
  let highScore = localStorage.getItem('highScore') || 0;
  let obstacles = [];
  let gameOver = false;
  let gameStarted = false;
  let speed = 5;

  // Sounds
  const jumpSound = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
  const hitSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
  const pointSound = new Audio('https://actions.google.com/sounds/v1/cartoon/boing.ogg');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    groundHeight = 80;
    if (player) player.y = canvas.height - groundHeight - PLAYER_RADIUS*2;
  }

  function init() {
    player = {
      x: 100,
      y: canvas.height - groundHeight - PLAYER_RADIUS*2,
      radius: PLAYER_RADIUS,
      velocityY: 0,
      jumping: false
    };
  }

  resizeCanvas();
  init();
  window.addEventListener('resize', resizeCanvas);

  function jump() {
    if (!player.jumping && !gameOver && gameStarted) {
      player.velocityY = -15;
      player.jumping = true;
      jumpSound.play().catch(()=>{});
    }
  }

  function handleInput() {
    if (!gameStarted) gameStarted = true;
    if (gameOver) {
      resetGame();
      return;
    }
    jump();
  }

  // Controls
  document.addEventListener('keydown', e => {
    if (e.code === 'Space') handleInput();
    if (e.code === 'Enter' && gameOver) resetGame();
  });
  document.addEventListener('click', handleInput);
  document.addEventListener('touchstart', e => { e.preventDefault(); handleInput(); }, {passive:false});

  // Obstacles
  function spawnObstacle() {
    obstacles.push({
      x: canvas.width,
      y: canvas.height - groundHeight - OBSTACLE_HEIGHT,
      width: OBSTACLE_WIDTH,
      height: OBSTACLE_HEIGHT,
      scored:false
    });
  }

  function updateDifficulty() {
    if (score > 0 && score % 5 === 0) {
      speed += 1; // زيادة السرعة
      spawnInterval = Math.max(MIN_SPAWN_INTERVAL, spawnInterval - 150); // العوائق أقرب تدريجياً
    }
  }

  function detectCollision(circle, rect) {
    let closestX = Math.max(rect.x, Math.min(circle.x + circle.radius, rect.x + rect.width));
    let closestY = Math.max(rect.y, Math.min(circle.y + circle.radius, rect.y + rect.height));
    let dx = (circle.x + circle.radius) - closestX;
    let dy = (circle.y + circle.radius) - closestY;
    return (dx*dx + dy*dy) < (circle.radius*circle.radius);
  }

  function resetGame() {
    player.y = canvas.height - groundHeight - PLAYER_RADIUS*2;
    player.velocityY = 0;
    player.jumping = false;
    obstacles = [];
    score = 0;
    speed = 5;
    spawnInterval = 1800;
    spawnTimer = 0;
    gameOver = false;
    gameStarted = false;
  }

  let lastTime = 0;
  function update(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Ground
    ctx.fillStyle = 'green';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

    // Player
    if (!gameOver && gameStarted) {
      player.velocityY += gravity;
      player.y += player.velocityY;
      if (player.y > canvas.height - groundHeight - PLAYER_RADIUS*2) {
        player.y = canvas.height - groundHeight - PLAYER_RADIUS*2;
        player.jumping = false;
      }
    }
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(player.x + PLAYER_RADIUS, player.y + PLAYER_RADIUS, PLAYER_RADIUS, 0, Math.PI*2);
    ctx.fill();

    // Obstacles
    spawnTimer += deltaTime;
    if (spawnTimer >= spawnInterval && !gameOver && gameStarted) {
      spawnObstacle();
      spawnTimer = 0;
    }

    ctx.fillStyle = 'red';
    obstacles.forEach(obs => {
      if (!gameOver && gameStarted) obs.x -= speed;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

      if (!gameOver && detectCollision(player, obs)) {
        gameOver = true;
        hitSound.play().catch(()=>{});
      }

      if (!obs.scored && obs.x + obs.width < player.x) {
        score++;
        obs.scored = true;
        pointSound.play().catch(()=>{});
        if(score > highScore) {
          highScore = score;
          localStorage.setItem('highScore', highScore);
        }
        updateDifficulty();
      }
    });

    if (!gameOver && gameStarted) speed += 0.002; // زيادة صغيرة مستمرة

    // Score
    ctx.fillStyle = 'black';
    ctx.font = `20px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);

    // Start screen
    if (!gameStarted) {
      ctx.fillStyle = 'black';
      ctx.font = `40px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Tap or Press Space to Start', canvas.width/2, canvas.height/2);
    }

    // Game over
    if (gameOver) {
      ctx.fillStyle = 'black';
      ctx.font = `40px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Game Over! Tap or Press Enter to Restart', canvas.width/2, canvas.height/2);
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
});

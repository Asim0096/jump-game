window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  let groundHeight, player;
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
    groundHeight = canvas.height * 0.1;

    if (player) {
      // Small fixed size for player
      player.radius = Math.min(canvas.height * 0.05, 50); 
      player.y = canvas.height - groundHeight - player.radius*2;
    }
  }

  function init() {
    player = {
      x: canvas.width * 0.1,
      radius: Math.min(canvas.height * 0.05, 50), // أصغر لاعب، لا يزيد عن 50px
      y: canvas.height - groundHeight - Math.min(canvas.height * 0.05, 50)*2,
      velocityY: 0,
      jumping: false
    };
  }

  resizeCanvas();
  init();
  window.addEventListener('resize', resizeCanvas);

  function jump() {
    if (!player.jumping && !gameOver && gameStarted) {
      player.velocityY = -12;
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
    if (gameStarted && !gameOver) {
      let obsHeight = Math.min(canvas.height * 0.05, 40); // أصغر عائق
      let obsWidth = Math.min(canvas.width * 0.03, 30);   // أصغر عرض
      obstacles.push({
        x: canvas.width,
        y: canvas.height - groundHeight - obsHeight,
        width: obsWidth,
        height: obsHeight,
        scored:false
      });
    }
  }
  setInterval(spawnObstacle, 1500);

  function detectCollision(circle, rect) {
    let closestX = Math.max(rect.x, Math.min(circle.x + circle.radius, rect.x + rect.width));
    let closestY = Math.max(rect.y, Math.min(circle.y + circle.radius, rect.y + rect.height));
    let dx = (circle.x + circle.radius) - closestX;
    let dy = (circle.y + circle.radius) - closestY;
    return (dx*dx + dy*dy) < (circle.radius*circle.radius);
  }

  function resetGame() {
    player.y = canvas.height - groundHeight - player.radius*2;
    player.velocityY = 0;
    player.jumping = false;
    obstacles = [];
    score = 0;
    speed = 5;
    gameOver = false;
    gameStarted = false;
  }

  function update() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Ground
    ctx.fillStyle = 'green';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

    // Player
    if (!gameOver && gameStarted) {
      player.velocityY += gravity;
      player.y += player.velocityY;
      if (player.y > canvas.height - groundHeight - player.radius*2) {
        player.y = canvas.height - groundHeight - player.radius*2;
        player.jumping = false;
      }
    }
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(player.x + player.radius, player.y + player.radius, player.radius, 0, Math.PI*2);
    ctx.fill();

    // Obstacles
    ctx.fillStyle = 'red';
    obstacles.forEach(obs => {
      if (!gameOver && gameStarted) obs.x -= speed;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      if (!gameOver && detectCollision(player, obs)) { gameOver = true; hitSound.play().catch(()=>{}); }
      if (!obs.scored && obs.x + obs.width < player.x) {
        score++; obs.scored = true; pointSound.play().catch(()=>{});
        if(score > highScore) { highScore = score; localStorage.setItem('highScore', highScore); }
      }
    });

    if (!gameOver && gameStarted) speed += 0.002;

    // Score
    ctx.fillStyle = 'black';
    ctx.font = `${canvas.width*0.02}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);

    // Start screen
    if (!gameStarted) {
      ctx.fillStyle = 'black';
      ctx.font = `${canvas.width*0.05}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Tap or Press Space to Start', canvas.width/2, canvas.height/2);
    }

    // Game over
    if (gameOver) {
      ctx.fillStyle = 'black';
      ctx.font = `${canvas.width*0.05}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Game Over! Tap or Press Enter to Restart', canvas.width/2, canvas.height/2);
    }

    requestAnimationFrame(update);
  }

  update();
});

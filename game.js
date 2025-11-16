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


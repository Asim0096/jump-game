const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 300;

let player = { x: 50, y: 250, width: 30, height: 30, velocityY: 0, jumping: false };
const gravity = 0.8;
const jumpForce = -12;

function update() {
    if (player.jumping) {
        player.velocityY += gravity;
        player.y += player.velocityY;

        if (player.y >= 250) {
            player.y = 250;
            player.velocityY = 0;
            player.jumping = false;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', () => {
    if (!player.jumping) {
        player.velocityY = jumpForce;
        player.jumping = true;
    }
});

gameLoop();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

let blobs = [];
let score = 0;
let timeLeft = 60;
let running = false;
let spawnInterval;
let timerInterval;

function randomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function createBlob() {
    const radius = 20 + Math.random() * 20;
    const blob = {
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: Math.random() * (canvas.height - radius * 2) + radius,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius,
        color: randomColor()
    };
    blobs.push(blob);
}

function drawBlob(blob) {
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
    ctx.fillStyle = blob.color;
    ctx.fill();
}

function updateBlobs() {
    for (const blob of blobs) {
        blob.x += blob.vx;
        blob.y += blob.vy;
        if (blob.x - blob.radius < 0 || blob.x + blob.radius > canvas.width) {
            blob.vx *= -1;
        }
        if (blob.y - blob.radius < 0 || blob.y + blob.radius > canvas.height) {
            blob.vy *= -1;
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const blob of blobs) {
        drawBlob(blob);
    }
    if (running) {
        requestAnimationFrame(render);
    }
}

function gameLoop() {
    updateBlobs();
}

function playSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
    oscillator.stop(audioCtx.currentTime + 0.2);
}

function canvasClick(e) {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (let i = blobs.length - 1; i >= 0; i--) {
        const blob = blobs[i];
        const dx = x - blob.x;
        const dy = y - blob.y;
        if (Math.sqrt(dx * dx + dy * dy) < blob.radius) {
            blobs.splice(i, 1);
            score++;
            scoreEl.textContent = `Score: ${score}`;
            playSound();
            break;
        }
    }
}

function startGame() {
    blobs = [];
    score = 0;
    timeLeft = 60;
    running = true;
    scoreEl.textContent = `Score: ${score}`;
    timerEl.textContent = `Time: ${timeLeft}`;
    gameOverEl.classList.add('hidden');

    for (let i = 0; i < 5; i++) {
        createBlob();
    }
    spawnInterval = setInterval(createBlob, 1000);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    requestAnimationFrame(render);
}

function endGame() {
    running = false;
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    finalScoreEl.textContent = `Your score: ${score}`;
    gameOverEl.classList.remove('hidden');
}

restartBtn.addEventListener('click', startGame);
canvas.addEventListener('click', canvasClick);

setInterval(gameLoop, 16);
startGame();

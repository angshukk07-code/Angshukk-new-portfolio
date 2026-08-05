/* ==========================================================================
   FOOTBALL ARENA CANVAS MINI-GAME FOR ANGSHUKK PORTFOLIO
   ========================================================================== */

class FootballGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.score = 0;
    this.shotsTaken = 0;
    this.statusText = "CLICK TO SHOOT AT GOAL!";

    // Ball state
    this.ball = {
      x: 0,
      y: 0,
      radius: 12,
      targetX: 0,
      targetY: 0,
      speed: 0,
      isMoving: false,
      scale: 1.0
    };

    // Goalkeeper state
    this.gk = {
      x: 0,
      y: 0,
      width: 45,
      height: 25,
      targetX: 0,
      isDiving: false
    };

    // Goal bounds
    this.goal = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.canvas.addEventListener('click', (e) => this.handleShot(e));
    this.resetPositions();
    this.animate();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width || 600;
    this.canvas.height = 380;

    // Define Goal boundaries
    this.goal.width = this.canvas.width * 0.55;
    this.goal.height = 100;
    this.goal.x = (this.canvas.width - this.goal.width) / 2;
    this.goal.y = 35;

    this.resetPositions();
  }

  resetPositions() {
    // Ball starts at penalty spot near bottom
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height - 45;
    this.ball.scale = 1.0;
    this.ball.isMoving = false;

    // Goalkeeper starts in center of goal line
    this.gk.x = this.canvas.width / 2;
    this.gk.y = this.goal.y + this.goal.height - 15;
    this.gk.isDiving = false;
  }

  handleShot(e) {
    if (this.ball.isMoving) return;

    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Aim shot towards target
    this.ball.targetX = clickX;
    this.ball.targetY = clickY;
    this.ball.isMoving = true;
    this.shotsTaken++;

    // GK AI predicts shot direction with slight imperfection
    const gkDiveError = (Math.random() - 0.5) * 80;
    this.gk.targetX = Math.max(
      this.goal.x + 25,
      Math.min(this.goal.x + this.goal.width - 25, clickX + gkDiveError)
    );
    this.gk.isDiving = true;
  }

  update() {
    if (this.ball.isMoving) {
      const dx = this.ball.targetX - this.ball.x;
      const dy = this.ball.targetY - this.ball.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        this.ball.x += dx * 0.12;
        this.ball.y += dy * 0.12;
        this.ball.scale = Math.max(0.65, this.ball.scale - 0.015);

        // Goalkeeper dive movement
        const gkDx = this.gk.targetX - this.gk.x;
        this.gk.x += gkDx * 0.14;
      } else {
        // Shot resolved! Check Goal or Save
        this.evaluateShotResult();
      }
    }
  }

  evaluateShotResult() {
    this.ball.isMoving = false;

    // Check if inside goal box
    const inGoalX = this.ball.targetX >= this.goal.x && this.ball.targetX <= this.goal.x + this.goal.width;
    const inGoalY = this.ball.targetY >= this.goal.y && this.ball.targetY <= this.goal.y + this.goal.height;

    // Check GK block collision
    const gkBlock = Math.abs(this.ball.x - this.gk.x) < 35 && Math.abs(this.ball.y - this.gk.y) < 30;

    if (inGoalX && inGoalY && !gkBlock) {
      this.score++;
      this.statusText = "⚽ GOAL! MAGNIFICENT FINISH!";
      this.updateHud();
      // Play celebration synth sound if available
      if (window.guitarSynth) window.guitarSynth.pluckChord('G');
    } else if (gkBlock) {
      this.statusText = "🧤 GREAT SAVE BY THE GOALKEEPER!";
    } else {
      this.statusText = "❌ SHOT MISSED! TRY AGAIN!";
    }

    setTimeout(() => {
      this.statusText = "CLICK TO SHOOT AT GOAL!";
      this.resetPositions();
    }, 1800);
  }

  updateHud() {
    const hudScore = document.getElementById('hud-score');
    if (hudScore) {
      hudScore.textContent = `GOALS: ${this.score} / ${this.shotsTaken}`;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Field Stripes
    const stripeCount = 6;
    const stripeHeight = this.canvas.height / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      this.ctx.fillStyle = i % 2 === 0 ? '#0b3d2e' : '#083326';
      this.ctx.fillRect(0, i * stripeHeight, this.canvas.width, stripeHeight);
    }

    // 2. Draw Pitch Markings (Penalty Box & Arc)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 3;

    // Penalty Area Box
    const boxW = this.goal.width + 80;
    const boxH = 160;
    const boxX = (this.canvas.width - boxW) / 2;
    this.ctx.strokeRect(boxX, this.goal.y, boxW, boxH);

    // Goal Net Frame
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
    this.ctx.strokeStyle = '#00ff87';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);

    // Net Pattern
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 1;
    for (let x = this.goal.x; x <= this.goal.x + this.goal.width; x += 15) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.goal.y);
      this.ctx.lineTo(x, this.goal.y + this.goal.height);
      this.ctx.stroke();
    }
    for (let y = this.goal.y; y <= this.goal.y + this.goal.height; y += 15) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.goal.x, y);
      this.ctx.lineTo(this.goal.x + this.goal.width, y);
      this.ctx.stroke();
    }

    // Penalty Spot Dot
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width / 2, this.canvas.height - 45, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // 3. Draw Goalkeeper
    this.ctx.fillStyle = '#ec4899';
    this.ctx.shadowColor = '#ec4899';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.roundRect(
      this.gk.x - this.gk.width / 2,
      this.gk.y - this.gk.height / 2,
      this.gk.width,
      this.gk.height,
      8
    );
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // GK Label
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 10px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText("GK", this.gk.x, this.gk.y + 4);

    // 4. Draw Soccer Ball
    const r = this.ball.radius * this.ball.scale;
    this.ctx.shadowColor = 'rgba(0, 255, 135, 0.6)';
    this.ctx.shadowBlur = 12;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, r, 0, Math.PI * 2);
    this.ctx.fill();

    // Ball pentagon pattern
    this.ctx.fillStyle = '#070913';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, r * 0.45, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;

    // 5. Draw HUD Status Text
    this.ctx.fillStyle = '#00ff87';
    this.ctx.font = 'bold 14px Outfit, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.statusText, this.canvas.width / 2, this.canvas.height - 15);
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Auto init after DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.footballGame = new FootballGame('football-canvas');
});

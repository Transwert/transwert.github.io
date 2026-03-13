function px(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), size, size);
}

function drawPattern(ctx, x, y, pixelSize, palette, pattern) {
  for (let row = 0; row < pattern.length; row += 1) {
    for (let col = 0; col < pattern[row].length; col += 1) {
      const key = pattern[row][col];
      if (key === ".") continue;
      px(ctx, x + col * pixelSize, y + row * pixelSize, pixelSize, palette[key]);
    }
  }
}

const playerPattern = [
  "..ssss..",
  ".shhhs..",
  ".sffffs.",
  ".sbbbbs.",
  "..b..b..",
  ".b....b.",
  "bb....bb",
];

const enemyPattern = [
  ".rrrrr.",
  "rrwwwwr",
  "rwwwwww",
  "rwwwwww",
  ".r....r",
  "r......r",
];

const bossPattern = [
  "...yyyyyy...",
  "..ybbbbbbby..",
  ".ybbwwwwbby.",
  "ybbwwwwwwbby",
  "ybbwwwwwwbby",
  ".ybbbbbbbby.",
  "..yy....yy..",
];

export function drawPlayer(ctx, x, y, dir = 1, frame = 0, options = {}) {
  const { invincible = false, timeMs = 0 } = options;
  const palette = {
    s: "#2e2a5e",
    h: "#f0d2b0",
    f: "#5b8ee3",
    b: "#2d5aa6",
  };
  if (invincible) {
    const hue = (timeMs * 0.18) % 360;
    const pulse = 1 + Math.sin(timeMs * 0.018) * 0.08;
    const glowW = 40 * pulse;
    const glowH = 34 * pulse;
    ctx.save();
    ctx.strokeStyle = `hsla(${hue}, 90%, 60%, 0.9)`;
    ctx.lineWidth = 4;
    ctx.shadowColor = `hsla(${(hue + 45) % 360}, 95%, 60%, 0.85)`;
    ctx.shadowBlur = 14;
    ctx.strokeRect(x - 4, y - 4, glowW, glowH);
    ctx.restore();
  }
  ctx.save();
  if (dir < 0) {
    ctx.translate(x + 32, y);
    ctx.scale(-1, 1);
    drawPattern(ctx, 0, 0, 4, palette, playerPattern);
  } else {
    drawPattern(ctx, x, y, 4, palette, playerPattern);
  }
  if (frame % 2 === 0) {
    px(ctx, x + 8, y + 24, 4, "#1f1b45");
    px(ctx, x + 20, y + 24, 4, "#1f1b45");
  }
  ctx.restore();
}

export function drawEnemy(ctx, enemy, cameraX) {
  const x = enemy.x - cameraX;
  const y = enemy.y;
  const palette = {
    r: enemy.color || "#b04e4e",
    w: "#f6f1d2",
  };
  drawPattern(ctx, x, y, 4, palette, enemyPattern);
}

export function drawBoss(ctx, boss, cameraX) {
  const x = boss.x - cameraX;
  const y = boss.y;
  const palette = {
    y: "#e7c854",
    b: "#5b3f88",
    w: "#efe7ff",
  };
  drawPattern(ctx, x, y, 6, palette, bossPattern);

  ctx.fillStyle = "#ffffff";
  ctx.font = "12px 'Press Start 2P', monospace";
  ctx.fillText(`Phase ${boss.phase + 1}/${boss.maxPhases}`, x - 40, y - 12);
}

export function drawGround(ctx, levelWidth, cameraX, colors) {
  const stripe = 64;
  const baseY = 386;
  for (let x = 0; x < levelWidth; x += stripe) {
    const drawX = x - cameraX;
    ctx.fillStyle = x / stripe % 2 === 0 ? colors.ground : colors.accent;
    ctx.fillRect(drawX, baseY, stripe, 64);
    ctx.fillStyle = "#1a1a1a22";
    ctx.fillRect(drawX, baseY + 46, stripe, 18);
  }
}

export function drawBackground(ctx, cameraX, theme) {
  ctx.fillStyle = theme.sky;
  ctx.fillRect(0, 0, 800, 450);

  ctx.fillStyle = theme.hill;
  for (let i = 0; i < 6; i += 1) {
    const x = ((i * 220 - (cameraX * 0.25) % 1200) + 1200) % 1200 - 180;
    ctx.beginPath();
    ctx.moveTo(x, 386);
    ctx.lineTo(x + 90, 240);
    ctx.lineTo(x + 180, 386);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#ffffffaa";
  for (let i = 0; i < 7; i += 1) {
    const x = ((i * 160 - (cameraX * 0.15) % 1120) + 1120) % 1120 - 120;
    const y = 50 + (i % 3) * 26;
    ctx.fillRect(x, y, 64, 12);
    ctx.fillRect(x + 10, y - 10, 40, 10);
  }
}

export function drawPlatform(ctx, platform, cameraX) {
  const x = platform.x - cameraX;
  ctx.fillStyle = "#7f5f3f";
  ctx.fillRect(x, platform.y, platform.w, platform.h);
  ctx.fillStyle = "#c39862";
  ctx.fillRect(x, platform.y, platform.w, 6);
}

export function drawCoin(ctx, coin, cameraX) {
  const x = coin.x - cameraX;
  ctx.fillStyle = "#ffd84e";
  ctx.fillRect(x, coin.y, coin.w, coin.h);
  ctx.fillStyle = "#f7a700";
  ctx.fillRect(x + 3, coin.y + 3, coin.w - 6, coin.h - 6);
}

export function drawFireball(ctx, fireball, cameraX) {
  const x = fireball.x - cameraX;
  ctx.fillStyle = "#ff8a3d";
  ctx.fillRect(x, fireball.y, fireball.w, fireball.h);
  ctx.fillStyle = "#fff0ad";
  ctx.fillRect(x + 2, fireball.y + 2, fireball.w - 4, fireball.h - 4);
}

export function drawFlag(ctx, flag, cameraX) {
  const x = flag.x - cameraX;
  ctx.fillStyle = "#ececec";
  ctx.fillRect(x, flag.y, 6, flag.h);
  ctx.fillStyle = "#35a65b";
  ctx.fillRect(x + 6, flag.y + 10, 36, 20);
}

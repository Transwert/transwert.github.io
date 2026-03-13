import { gameConfig } from "./data.js";
import { rectsOverlap } from "./engine.js";

export function createPlayer(x, y) {
  return {
    x,
    y,
    w: 32,
    h: 28,
    vx: 0,
    vy: 0,
    dir: 1,
    onGround: false,
    canShootAt: 0,
    jumpHoldFrames: 0,
    frame: 0,
    alive: true,
  };
}

export function updatePlayer(player, input, platforms, dt, fireballs, now) {
  const speed = gameConfig.playerSpeed;
  const gravity = gameConfig.gravity;

  if (input.left && !input.right) {
    player.vx = -speed;
    player.dir = -1;
  } else if (input.right && !input.left) {
    player.vx = speed;
    player.dir = 1;
  } else {
    player.vx *= 0.8;
    if (Math.abs(player.vx) < 5) player.vx = 0;
  }

  if (input.jump) {
    if (player.onGround) {
      player.vy = gameConfig.jumpVelocity;
      player.onGround = false;
      player.jumpHoldFrames = 8;
    } else if (player.jumpHoldFrames > 0) {
      player.vy -= 34;
      player.jumpHoldFrames -= 1;
    }
  } else {
    player.jumpHoldFrames = 0;
  }

  if (input.shoot && now > player.canShootAt) {
    fireballs.push(createFireball(player));
    player.canShootAt = now + 260;
  }

  player.vy += gravity * dt;
  player.x += player.vx * dt;
  resolveHorizontal(player, platforms);

  player.y += player.vy * dt;
  player.onGround = false;
  resolveVertical(player, platforms);

  player.frame += 1;
}

function resolveHorizontal(player, platforms) {
  for (const p of platforms) {
    if (!rectsOverlap(player, p)) continue;
    if (player.vx > 0) player.x = p.x - player.w;
    else if (player.vx < 0) player.x = p.x + p.w;
    player.vx = 0;
  }
}

function resolveVertical(player, platforms) {
  for (const p of platforms) {
    if (!rectsOverlap(player, p)) continue;
    if (player.vy > 0) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (player.vy < 0) {
      player.y = p.y + p.h;
      player.vy = 0;
    }
  }
}

function createFireball(player) {
  return {
    x: player.dir < 0 ? player.x - 10 : player.x + player.w + 2,
    y: player.y + 12,
    w: 10,
    h: 10,
    vx: player.dir * gameConfig.fireballSpeed,
    life: 1.4,
  };
}

export function updateFireballs(fireballs, dt, levelWidth) {
  for (let i = fireballs.length - 1; i >= 0; i -= 1) {
    const f = fireballs[i];
    f.x += f.vx * dt;
    f.life -= dt;
    if (f.life <= 0 || f.x < -100 || f.x > levelWidth + 100) {
      fireballs.splice(i, 1);
    }
  }
}

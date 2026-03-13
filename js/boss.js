import { rectsOverlap } from "./engine.js";

const PHASE_CONFIGS = [
  { speed: 120, fireInterval: Infinity, bulletSpeed: 0,   firesH: false, firesV: false },
  { speed: 130, fireInterval: 1100,     bulletSpeed: 320, firesH: true,  firesV: false },
  { speed: 140, fireInterval: 950,      bulletSpeed: 360, firesH: false, firesV: true  },
  { speed: 210, fireInterval: 550,      bulletSpeed: 460, firesH: true,  firesV: true  },
];

function phaseConfig(phase) {
  return PHASE_CONFIGS[Math.min(phase, PHASE_CONFIGS.length - 1)];
}

export function createBossArena(bossData) {
  const phaseMaxHealth = bossData.phases.map((_, idx) => 3 + idx);
  return {
    phase: 0,
    maxPhases: bossData.phases.length,
    x: 1350,
    y: 200,
    w: 78,
    h: 64,
    health: phaseMaxHealth[0],
    phaseMaxHealth,
    currentPhaseMaxHealth: phaseMaxHealth[0],
    defeated: false,
    bossData,
    revealQueue: [],
    platforms: [
      { x: 0, y: 386, w: 1600, h: 64 },
      { x: 400, y: 302, w: 130, h: 16 },
      { x: 760, y: 265, w: 130, h: 16 },
      { x: 1040, y: 305, w: 130, h: 16 },
    ],
    bossVx: 120,
    minX: 80,
    maxX: 1480,
    projectiles: [],
    lastFireTime: 0,
  };
}

export function updateBossArena({
  arena,
  player,
  fireballs,
  onPhaseCleared,
  onBossDefeated,
  onPlayerHit,
  dt,
  now = performance.now(),
}) {
  if (arena.defeated) return;

  const cfg = phaseConfig(arena.phase);

  // --- Boss horizontal to-and-fro movement ---
  const desiredSpeed = cfg.speed;
  arena.bossVx =
    arena.bossVx >= 0 ? desiredSpeed : -desiredSpeed;

  arena.x += arena.bossVx * dt;

  if (arena.x <= arena.minX) {
    arena.x = arena.minX;
    arena.bossVx = desiredSpeed;
  } else if (arena.x + arena.w >= arena.maxX) {
    arena.x = arena.maxX - arena.w;
    arena.bossVx = -desiredSpeed;
  }

  // --- Boss projectile firing ---
  if (cfg.fireInterval !== Infinity && now - arena.lastFireTime >= cfg.fireInterval) {
    arena.lastFireTime = now;

    if (cfg.firesH) {
      const dirX = player.x + player.w * 0.5 < arena.x + arena.w * 0.5 ? -1 : 1;
      arena.projectiles.push({
        x: arena.x + arena.w * 0.5 - 6,
        y: arena.y + arena.h * 0.5 - 4,
        w: 14,
        h: 8,
        vx: dirX * cfg.bulletSpeed,
        vy: 0,
      });
    }

    if (cfg.firesV) {
      const targetX = player.x + player.w * 0.5 - 4 + (Math.random() - 0.5) * 80;
      arena.projectiles.push({
        x: Math.max(0, Math.min(1580, targetX)),
        y: -12,
        w: 8,
        h: 14,
        vx: 0,
        vy: cfg.bulletSpeed,
      });
    }
  }

  // --- Update projectiles & check player collision ---
  for (let i = arena.projectiles.length - 1; i >= 0; i--) {
    const p = arena.projectiles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (p.x < -60 || p.x > 1700 || p.y > 500 || p.y < -60) {
      arena.projectiles.splice(i, 1);
      continue;
    }

    if (rectsOverlap(p, player)) {
      arena.projectiles.splice(i, 1);
      if (!player.isInvincible && onPlayerHit) {
        onPlayerHit();
      }
    }
  }

  // --- Player / boss body collision ---
  if (rectsOverlap(player, arena)) {
    if (player.isInvincible) {
      if (now >= player.bossTouchCooldownUntil) {
        arena.health -= 1;
        player.bossTouchCooldownUntil = now + 180;
      }
    } else if (player.vy > 40) {
      arena.health -= 1;
      player.vy = -280;
    }
  }

  // --- Player fireballs hitting boss ---
  for (let i = fireballs.length - 1; i >= 0; i -= 1) {
    if (rectsOverlap(fireballs[i], arena)) {
      arena.health -= 1;
      fireballs.splice(i, 1);
    }
  }

  // --- Phase transition ---
  if (arena.health <= 0) {
    const clearedPhase = arena.bossData.phases[arena.phase];
    arena.revealQueue.push(clearedPhase);

    arena.projectiles = [];

    onPhaseCleared(clearedPhase);

    arena.phase += 1;
    if (arena.phase >= arena.maxPhases) {
      arena.defeated = true;
      arena.projectiles = [];
      onBossDefeated();
      return;
    }
    arena.currentPhaseMaxHealth = arena.phaseMaxHealth[arena.phase];
    arena.health = arena.currentPhaseMaxHealth;
    arena.lastFireTime = now;
  }
}

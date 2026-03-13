import { rectsOverlap } from "./engine.js";

export function createBossArena(bossData) {
  return {
    phase: 0,
    maxPhases: bossData.phases.length,
    x: 1350,
    y: 200,
    w: 78,
    h: 64,
    health: 3,
    defeated: false,
    bossData,
    revealQueue: [],
    platforms: [
      { x: 0, y: 386, w: 1600, h: 64 },
      { x: 400, y: 302, w: 130, h: 16 },
      { x: 760, y: 265, w: 130, h: 16 },
      { x: 1040, y: 305, w: 130, h: 16 },
    ],
  };
}

export function updateBossArena({
  arena,
  player,
  fireballs,
  onPhaseCleared,
  onBossDefeated,
}) {
  if (arena.defeated) return;

  arena.x += Math.sin(performance.now() * 0.001) * 0.6;

  if (rectsOverlap(player, arena) && player.vy > 40) {
    arena.health -= 1;
    player.vy = -280;
  }

  for (let i = fireballs.length - 1; i >= 0; i -= 1) {
    const fireball = fireballs[i];
    if (rectsOverlap(fireball, arena)) {
      arena.health -= 1;
      fireballs.splice(i, 1);
    }
  }

  if (arena.health <= 0) {
    const clearedPhase = arena.bossData.phases[arena.phase];
    arena.revealQueue.push(clearedPhase);
    onPhaseCleared(clearedPhase);

    arena.phase += 1;
    if (arena.phase >= arena.maxPhases) {
      arena.defeated = true;
      onBossDefeated();
      return;
    }
    arena.health = 3 + arena.phase;
  }
}

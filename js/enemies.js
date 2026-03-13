import { gameConfig } from "./data.js";
import { rectsOverlap } from "./engine.js";

export function buildEnemies(projects, startX = 380) {
  return projects.map((project, index) => ({
    id: project.id,
    x: startX + index * 320,
    y: 358,
    w: 28,
    h: 28,
    minX: startX + index * 320 - 40,
    maxX: startX + index * 320 + 60,
    vx: (index % 2 === 0 ? 1 : -1) * gameConfig.enemySpeed,
    color: ["#ba5d5d", "#6a67ce", "#3fa589"][index % 3],
    project,
    active: true,
  }));
}

export function updateEnemies(enemies, dt) {
  for (const enemy of enemies) {
    if (!enemy.active) continue;
    enemy.x += enemy.vx * dt;
    if (enemy.x < enemy.minX || enemy.x > enemy.maxX) {
      enemy.vx *= -1;
    }
  }
}

export function handleEnemyInteractions({
  player,
  enemies,
  fireballs,
  onEnemyDefeated,
  onPlayerHit,
}) {
  for (const enemy of enemies) {
    if (!enemy.active) continue;

    if (rectsOverlap(player, enemy)) {
      const isStomp = player.vy > 30 && player.y + player.h - 8 <= enemy.y + 4;
      if (isStomp) {
        enemy.active = false;
        player.vy = -320;
        onEnemyDefeated(enemy.project);
      } else {
        onPlayerHit();
      }
    }

    for (let i = fireballs.length - 1; i >= 0; i -= 1) {
      if (!enemy.active) break;
      const fireball = fireballs[i];
      if (rectsOverlap(fireball, enemy)) {
        enemy.active = false;
        fireballs.splice(i, 1);
        onEnemyDefeated(enemy.project);
      }
    }
  }
}

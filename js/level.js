import { buildEnemies } from "./enemies.js";

function baseGround(levelWidth) {
  return [{ x: 0, y: 386, w: levelWidth, h: 64 }];
}

function floatingPlatforms(levelWidth) {
  const platforms = [];
  for (let i = 0; i < 8; i += 1) {
    platforms.push({
      x: 220 + i * ((levelWidth - 460) / 8),
      y: i % 2 === 0 ? 300 : 248,
      w: 120,
      h: 16,
    });
  }
  return platforms;
}

function buildCoins(collectibles, startX = 250) {
  return collectibles.map((label, index) => ({
    id: `coin-${index}`,
    label,
    x: startX + index * 180,
    y: 206 + (index % 2) * 35,
    w: 14,
    h: 14,
    collected: false,
  }));
}

export function createLevel(levelData, levelIndex) {
  const levelWidth = Math.max(2800, 1200 + levelData.projects.length * 360);
  const platforms = [...baseGround(levelWidth), ...floatingPlatforms(levelWidth)];
  const enemies = buildEnemies(levelData.projects, 420);
  const coins = buildCoins(levelData.collectibles, 320);
  const flag = {
    x: levelWidth - 120,
    y: 250,
    w: 36,
    h: 136,
  };

  return {
    id: levelData.id,
    world: levelData.world || `${levelIndex + 1}-1`,
    company: levelData.company,
    role: levelData.role,
    period: levelData.period,
    theme: levelData.theme,
    projects: levelData.projects,
    platforms,
    enemies,
    coins,
    flag,
    width: levelWidth,
  };
}

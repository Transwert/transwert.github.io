import { resumeData, gameConfig } from "./data.js";
import { GameLoop, InputManager, Camera, rectsOverlap } from "./engine.js";
import {
  drawBackground,
  drawGround,
  drawPlatform,
  drawPlayer,
  drawEnemy,
  drawCoin,
  drawFireball,
  drawFlag,
  drawBoss,
} from "./sprites.js";
import { createPlayer, updatePlayer, updateFireballs } from "./player.js";
import { updateEnemies, handleEnemyInteractions } from "./enemies.js";
import { createLevel } from "./level.js";
import { createBossArena, updateBossArena } from "./boss.js";
import {
  drawHud,
  showTitleScreen,
  showLevelIntro,
  showProjectPopup,
  showSkillPhasePopup,
  showVictory,
  clearOverlay,
  onOverlayButton,
} from "./ui.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const input = new InputManager(canvas);

const allLevels = resumeData.levels.map((level, index) => createLevel(level, index));

const game = {
  state: "title",
  levelIndex: 0,
  level: null,
  player: null,
  fireballs: [],
  camera: null,
  lives: 3,
  coins: 0,
  experienceYears: "4+",
  worldLabel: "0-0",
  bossArena: null,
};

function loadLevel(index) {
  game.levelIndex = index;
  game.level = structuredClone(allLevels[index]);
  game.player = createPlayer(64, 350);
  game.fireballs = [];
  game.camera = new Camera(gameConfig.width, game.level.width);
  game.worldLabel = game.level.world;
}

function startGame() {
  loadLevel(0);
  game.state = "levelIntro";
  showLevelIntro(game.level);
  onOverlayButton("continue-btn", () => {
    clearOverlay();
    game.state = "playing";
  });
}

function startBoss() {
  game.state = "bossIntro";
  game.bossArena = createBossArena(resumeData.boss);
  game.level = {
    ...game.level,
    width: 1600,
    theme: { sky: "#221a3d", hill: "#453b7a", ground: "#2a2350", accent: "#b67f2b" },
    platforms: game.bossArena.platforms,
    enemies: [],
    coins: [],
    flag: null,
  };
  game.player = createPlayer(70, 350);
  game.fireballs = [];
  game.camera = new Camera(gameConfig.width, game.level.width);
  game.worldLabel = "BOSS";
  showLevelIntro({
    company: "Final Boss",
    role: "Technical Skills Titan",
    period: "Defeat all 4 phases",
  });
  onOverlayButton("continue-btn", () => {
    clearOverlay();
    game.state = "bossFight";
  });
}

function nextLevelOrBoss() {
  if (game.levelIndex < allLevels.length - 1) {
    loadLevel(game.levelIndex + 1);
    game.state = "levelIntro";
    showLevelIntro(game.level);
    onOverlayButton("continue-btn", () => {
      clearOverlay();
      game.state = "playing";
    });
    return;
  }
  startBoss();
}

function setupTitle() {
  game.state = "title";
  showTitleScreen(resumeData.profile);
  onOverlayButton("start-game-btn", startGame);
}

function restartFromCurrentStage() {
  game.lives = 3;
  game.fireballs = [];

  if (game.worldLabel === "BOSS" || game.state === "bossFight" || game.state === "bossIntro") {
    startBoss();
    return;
  }

  loadLevel(game.levelIndex);
  game.state = "levelIntro";
  showLevelIntro(game.level);
  onOverlayButton("continue-btn", () => {
    clearOverlay();
    game.state = "playing";
  });
}

function onPlayerHit() {
  game.lives -= 1;
  game.player.x = 64;
  game.player.y = 350;
  game.player.vx = 0;
  game.player.vy = 0;
  if (game.lives <= 0) {
    restartFromCurrentStage();
  }
}

function update(dt) {
  if (game.state === "title") {
    if (input.consumeStart()) startGame();
    return;
  }
  if (game.state === "levelIntro" || game.state === "bossIntro" || game.state === "popup" || game.state === "victory") {
    if (game.state === "victory" && input.consumeStart()) {
      game.coins = 0;
      game.lives = 3;
      setupTitle();
    }
    return;
  }

  updatePlayer(
    game.player,
    input.actions,
    game.level.platforms,
    dt,
    game.fireballs,
    performance.now(),
  );
  updateFireballs(game.fireballs, dt, game.level.width);

  if (game.state === "playing") {
    updateEnemies(game.level.enemies, dt);
    handleEnemyInteractions({
      player: game.player,
      enemies: game.level.enemies,
      fireballs: game.fireballs,
      onEnemyDefeated: (project) => {
        game.state = "popup";
        showProjectPopup(project);
        onOverlayButton("close-popup-btn", () => {
          clearOverlay();
          game.state = "playing";
        });
      },
      onPlayerHit,
    });

    for (const coin of game.level.coins) {
      if (!coin.collected && rectsOverlap(game.player, coin)) {
        coin.collected = true;
        game.coins += 1;
      }
    }

    if (game.level.flag && rectsOverlap(game.player, game.level.flag)) {
      nextLevelOrBoss();
      return;
    }
  }

  if (game.state === "bossFight") {
    updateBossArena({
      arena: game.bossArena,
      player: game.player,
      fireballs: game.fireballs,
      onPhaseCleared: (phase) => {
        game.state = "popup";
        showSkillPhasePopup(phase);
        onOverlayButton("close-popup-btn", () => {
          clearOverlay();
          game.state = game.bossArena.defeated ? "victory" : "bossFight";
          if (game.bossArena.defeated) {
            showVictory(resumeData.profile);
            onOverlayButton("restart-btn", () => {
              game.coins = 0;
              game.lives = 3;
              setupTitle();
            });
          }
        });
      },
      onBossDefeated: () => {},
    });
  }

  game.camera.follow(game.player.x);
}

function render() {
  if (!game.level) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, gameConfig.width, gameConfig.height);
    return;
  }

  drawBackground(ctx, game.camera.x, game.level.theme);
  drawGround(ctx, game.level.width, game.camera.x, game.level.theme);

  for (const platform of game.level.platforms) {
    if (platform.y < 386) drawPlatform(ctx, platform, game.camera.x);
  }
  for (const coin of game.level.coins) {
    if (!coin.collected) drawCoin(ctx, coin, game.camera.x);
  }
  for (const enemy of game.level.enemies) {
    if (enemy.active) drawEnemy(ctx, enemy, game.camera.x);
  }
  if (game.state === "bossFight" || game.state === "popup") {
    if (game.bossArena && !game.bossArena.defeated) drawBoss(ctx, game.bossArena, game.camera.x);
  }
  for (const fireball of game.fireballs) {
    drawFireball(ctx, fireball, game.camera.x);
  }
  if (game.level.flag) drawFlag(ctx, game.level.flag, game.camera.x);
  drawPlayer(ctx, game.player.x - game.camera.x, game.player.y, game.player.dir, game.player.frame);

  drawHud(ctx, {
    worldLabel: game.worldLabel,
    coins: game.coins,
    experienceYears: game.experienceYears,
    lives: game.lives,
  });
}

setupTitle();
const loop = new GameLoop(update, render);
loop.start();

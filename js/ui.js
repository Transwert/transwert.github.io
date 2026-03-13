function setOverlayHtml(html) {
  const panel = document.getElementById("overlay-panel");
  if (!panel) return;
  panel.innerHTML = html;
}

function getCheatConsole() {
  return document.getElementById("cheat-console");
}

export function showCheatConsole(initialText = "") {
  const shell = getCheatConsole();
  if (!shell) return;
  shell.classList.remove("hidden");
  shell.innerHTML = `
    <div class="cheat-box">
      <label for="cheat-input">Cheat Console (~)</label>
      <input id="cheat-input" type="text" autocomplete="off" spellcheck="false" />
      <div id="cheat-status" class="cheat-hint">Type a command and press Enter.</div>
    </div>
  `;
  const input = document.getElementById("cheat-input");
  if (!input) return;
  input.value = initialText;
  input.focus();
  input.select();
}

export function hideCheatConsole() {
  const shell = getCheatConsole();
  if (!shell) return;
  shell.classList.add("hidden");
  shell.innerHTML = "";
}

export function setCheatConsoleStatus(message) {
  const status = document.getElementById("cheat-status");
  if (!status) return;
  status.textContent = message;
}

export function bindCheatSubmit(onSubmit) {
  const input = document.getElementById("cheat-input");
  if (!input) return;
  input.onkeydown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit(input.value);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onSubmit("__close__");
    }
  };
}

export function showToastMessage(text, durationMs = 1600) {
  const existing = document.getElementById("game-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "game-toast";
  toast.textContent = text;
  toast.style.position = "fixed";
  toast.style.top = "18px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.zIndex = "9999";
  toast.style.padding = "10px 14px";
  toast.style.border = "2px solid #b2dcff";
  toast.style.borderRadius = "8px";
  toast.style.background = "#0a1326f0";
  toast.style.color = "#ffffff";
  toast.style.fontFamily = "\"Press Start 2P\", monospace";
  toast.style.fontSize = "10px";
  toast.style.pointerEvents = "none";
  toast.style.boxShadow = "0 0 0 2px #00000055";
  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, durationMs);
}

export function drawHud(ctx, game) {
  ctx.fillStyle = "#111111aa";
  ctx.fillRect(0, 0, 800, 44);
  ctx.fillStyle = "#ffffff";
  ctx.font = "11px 'Press Start 2P', monospace";
  ctx.fillText(`WORLD ${game.worldLabel}`, 20, 28);
  ctx.fillText(`COINS ${String(game.coins).padStart(2, "0")}`, 250, 28);
  ctx.fillText(`EXP ${game.experienceYears}`, 470, 28);
  ctx.fillText(`LIVES ${game.lives}`, 670, 28);

  drawBossPhaseBar(ctx, game.bossBar);
}

function drawBossPhaseBar(ctx, bossBar) {
  if (!bossBar || !bossBar.showBossBar) return;

  const x = 170;
  const y = 46;
  const width = 460;
  const height = 14;
  const border = 2;
  const segmentCount = bossBar.maxPhases;
  const segmentW = (width - border * 2) / segmentCount;

  ctx.fillStyle = "#090d1dcc";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#e6f2ff";
  ctx.lineWidth = border;
  ctx.strokeRect(x, y, width, height);

  for (let i = 0; i < segmentCount; i += 1) {
    const sx = x + border + i * segmentW;
    const sy = y + border;
    const sw = segmentW;
    const sh = height - border * 2;
    const color = bossBar.phaseColors?.[i] || "#7bb7ff";

    // Faint background tint keeps segments visually connected but identifiable.
    ctx.fillStyle = `${color}33`;
    ctx.fillRect(sx, sy, sw, sh);

    let fillRatio = 1;
    if (i < bossBar.activePhase) {
      fillRatio = 0;
    } else if (i === bossBar.activePhase) {
      fillRatio = Math.max(
        0,
        Math.min(1, bossBar.currentPhaseHp / Math.max(1, bossBar.currentPhaseMaxHp)),
      );
    }

    ctx.fillStyle = color;
    ctx.fillRect(sx, sy, sw * fillRatio, sh);

    if (i > 0) {
      ctx.fillStyle = "#ffffff22";
      ctx.fillRect(sx, sy, 1, sh);
    }
  }

  ctx.fillStyle = "#e8f4ff";
  ctx.font = "8px 'Press Start 2P', monospace";
  ctx.fillText("BOSS PHASE HP", x + 4, y - 4);
}

export function showTitleScreen(profile) {
  setOverlayHtml(`
    <div class="panel title-panel">
      <h1>SUPER APOORVE BROS</h1>
      <p>${profile.firstName} ${profile.lastName}</p>
      <p>${profile.education.degree}</p>
      <p>${profile.education.institute}</p>
      <button id="start-game-btn">Press Start</button>
    </div>
  `);
}

export function showLevelIntro(level) {
  setOverlayHtml(`
    <div class="panel intro-panel">
      <h2>${level.company}</h2>
      <p>${level.role}</p>
      <p>${level.period}</p>
      <button id="continue-btn">Go!</button>
    </div>
  `);
}

export function showProjectPopup(project) {
  const techTags = project.tech.map((t) => `<span class="tag">${t}</span>`).join("");
  setOverlayHtml(`
    <div class="panel popup-panel">
      <h3>${project.name}</h3>
      <p>${project.impact}</p>
      <ul>${project.details.map((d) => `<li>${d}</li>`).join("")}</ul>
      <div class="tags">${techTags}</div>
      <button id="close-popup-btn">Continue</button>
    </div>
  `);
}

export function showSkillPhasePopup(phase) {
  setOverlayHtml(`
    <div class="panel popup-panel">
      <h3>${phase.label} Cleared</h3>
      <p>Skills unlocked:</p>
      <div class="tags">${phase.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}</div>
      <button id="close-popup-btn">Next Phase</button>
    </div>
  `);
}

export function showVictory(profile) {
  setOverlayHtml(`
    <div class="panel victory-panel">
      <h2>Victory! Resume Complete</h2>
      <p>Thanks for playing through my journey.</p>
      <p><strong>Contact</strong></p>
      <p><a href="mailto:${profile.contact.email}">${profile.contact.email}</a></p>
      <p>${profile.contact.phone}</p>
      <p><a href="${profile.contact.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a></p>
      <p><a href="${profile.contact.github}" target="_blank" rel="noopener noreferrer">GitHub</a></p>
      <p><a href="./Apoorve_IITH_Resume_Updated_2025_26.pdf" download="Apoorve_IITH_Resume_Updated_2025_26.pdf">Resume!</a></p>
      <button id="restart-btn">Replay</button>
    </div>
  `);
}

export function clearOverlay() {
  setOverlayHtml("");
}

export function onOverlayButton(buttonId, callback) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  button.onclick = callback;
}

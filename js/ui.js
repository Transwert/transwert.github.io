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

export function drawHud(ctx, game) {
  ctx.fillStyle = "#111111aa";
  ctx.fillRect(0, 0, 800, 44);
  ctx.fillStyle = "#ffffff";
  ctx.font = "11px 'Press Start 2P', monospace";
  ctx.fillText(`WORLD ${game.worldLabel}`, 20, 28);
  ctx.fillText(`COINS ${String(game.coins).padStart(2, "0")}`, 250, 28);
  ctx.fillText(`EXP ${game.experienceYears}`, 470, 28);
  ctx.fillText(`LIVES ${game.lives}`, 670, 28);
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

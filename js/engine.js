export function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export class InputManager {
  constructor(canvas) {
    this.keys = new Set();
    this.cheatToggleRequested = false;
    this.actions = {
      left: false,
      right: false,
      jump: false,
      shoot: false,
      start: false,
    };
    this._bindKeyboard();
    this._bindTouch(canvas);
  }

  _bindKeyboard() {
    window.addEventListener("keydown", (event) => {
      if (event.code === "Backquote") {
        this.cheatToggleRequested = true;
        event.preventDefault();
        return;
      }
      this.keys.add(event.code);
      this._syncActions();
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          event.code,
        )
      ) {
        event.preventDefault();
      }
    });

    window.addEventListener("keyup", (event) => {
      this.keys.delete(event.code);
      this._syncActions();
    });
  }

  _setActionFromButton(action, active) {
    this.actions[action] = active;
  }

  _bindTouch() {
    const bind = (id, action) => {
      const node = document.getElementById(id);
      if (!node) return;
      const start = (event) => {
        event.preventDefault();
        this._setActionFromButton(action, true);
      };
      const stop = (event) => {
        event.preventDefault();
        this._setActionFromButton(action, false);
      };
      node.addEventListener("touchstart", start, { passive: false });
      node.addEventListener("touchend", stop, { passive: false });
      node.addEventListener("touchcancel", stop, { passive: false });
      node.addEventListener("mousedown", start);
      node.addEventListener("mouseup", stop);
      node.addEventListener("mouseleave", stop);
    };

    bind("btn-left", "left");
    bind("btn-right", "right");
    bind("btn-jump", "jump");
    bind("btn-shoot", "shoot");
    bind("btn-start", "start");
  }

  _syncActions() {
    const active = document.activeElement;
    const isTyping =
      !!active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable);
    if (isTyping) {
      this.actions.left = false;
      this.actions.right = false;
      this.actions.jump = false;
      this.actions.shoot = false;
      this.actions.start = false;
      return;
    }
    this.actions.left = this.keys.has("ArrowLeft") || this.keys.has("KeyA");
    this.actions.right = this.keys.has("ArrowRight") || this.keys.has("KeyD");
    this.actions.jump = this.keys.has("ArrowUp") || this.keys.has("KeyW");
    this.actions.shoot = this.keys.has("Space");
    this.actions.start = this.keys.has("Enter");
  }

  consumeStart() {
    if (!this.actions.start) return false;
    this.actions.start = false;
    this.keys.delete("Enter");
    return true;
  }

  consumeCheatToggle() {
    if (!this.cheatToggleRequested) return false;
    this.cheatToggleRequested = false;
    return true;
  }
}

export class Camera {
  constructor(width, levelWidth) {
    this.x = 0;
    this.width = width;
    this.levelWidth = levelWidth;
  }

  follow(targetX) {
    const padding = this.width * 0.35;
    this.x = Math.max(
      0,
      Math.min(this.levelWidth - this.width, targetX - padding),
    );
  }
}

export class GameLoop {
  constructor(update, render) {
    this.update = update;
    this.render = render;
    this.last = 0;
    this.accumulator = 0;
    this.fixedStep = 1 / 60;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame((time) => this._frame(time));
  }

  stop() {
    this.running = false;
  }

  _frame(time) {
    if (!this.running) return;
    const delta = Math.min(0.05, (time - this.last) / 1000);
    this.last = time;
    this.accumulator += delta;

    while (this.accumulator >= this.fixedStep) {
      this.update(this.fixedStep);
      this.accumulator -= this.fixedStep;
    }
    this.render();
    requestAnimationFrame((nextTime) => this._frame(nextTime));
  }
}

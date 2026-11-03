class Level_02A_ThroughRAM extends Phaser.Scene {
  constructor() {
    super("Level_02A_ThroughRAM");
  }

  create() {
    this.WORD = "SAVE";
    this.stored = "";
    this.queue = [];
    this.busy = false;
    this.completed = false;
    this.cursorOn = true;
    this.shiftHeld = false;

    this.C = {
      bg: 0x07080c,
      surface: 0x12141a,
      border: 0x2a2e38,
      teal: 0x4a9a94,
      key: 0x1a1d26,
      keyTop: 0x242833,
    };

    this.SCAN = {
      KeyA: "1E", KeyB: "30", KeyC: "2E", KeyD: "20", KeyE: "12", KeyF: "21",
      KeyG: "22", KeyH: "23", KeyI: "17", KeyJ: "24", KeyK: "25", KeyL: "26",
      KeyM: "32", KeyN: "31", KeyO: "18", KeyP: "19", KeyQ: "10", KeyR: "13",
      KeyS: "1F", KeyT: "14", KeyU: "16", KeyV: "2F", KeyW: "11", KeyX: "2D",
      KeyY: "15", KeyZ: "2C", Digit1: "02", Space: "39", Backspace: "0E",
      ShiftLeft: "2A", ShiftRight: "36",
    };

    this.kb = { x: 390, y: 575, w: 640, h: 200 };
    this.stops = {
      key: { x: 150, y: 248 },
      scan: { x: 330, y: 248 },
      cpu: { x: 510, y: 248 },
      ram: { x: 710, y: 248 },
      mon: { x: 940, y: 248 },
    };

    this.cameras.main.setBackgroundColor(this.C.bg);
    this.drawGrid();
    this.drawBus();
    this.drawStations();
    this.drawRamCells();
    this.drawKeyboard();
    this.drawHero();
    this.drawHud();
    this.setStage("key", 0.35);

    this.moveKeys = this.input.keyboard.addKeys({
      up: "UP",
      down: "DOWN",
      left: "LEFT",
      right: "RIGHT",
    });

    this.time.addEvent({
      delay: 530,
      loop: true,
      callback: () => {
        this.cursorOn = !this.cursorOn;
        this.refreshMonitor();
      },
    });

    this.input.keyboard.on("keydown", (e) => this.onKeyDown(e));
    this.input.keyboard.on("keyup", (e) => this.onKeyUp(e));
  }

  font(size, color, extra) {
    return Object.assign(
      { fontFamily: "IBM Plex Sans, Segoe UI, sans-serif", fontSize: size + "px", color: color },
      extra || {},
    );
  }

  mono(size, color, extra) {
    return Object.assign(
      { fontFamily: "IBM Plex Mono, ui-monospace, monospace", fontSize: size + "px", color: color },
      extra || {},
    );
  }

  drawGrid() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x1a1d26, 0.9);
    for (let x = 40; x < 1100; x += 40) g.lineBetween(x, 0, x, 720);
    for (let y = 40; y < 720; y += 40) g.lineBetween(0, y, 1100, y);
  }

  drawBus() {
    const g = this.add.graphics();
    g.lineStyle(2, 0x2d5e5a, 0.9);
    const pts = ["key", "scan", "cpu", "ram", "mon"].map((id) => this.stops[id]);
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y + 78);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y + 78);
    g.strokePath();
    g.lineStyle(2, 0x2d5e5a, 0.55);
    g.lineBetween(this.kb.x, this.kb.y - 108, this.stops.key.x, this.stops.key.y + 78);
  }

  panel(x, y, w, h) {
    const box = this.add.rectangle(x, y, w, h, this.C.surface).setStrokeStyle(1, this.C.border);
    const bar = this.add.rectangle(x, y - h / 2 + 1, w, 2, 0x4a9a94).setAlpha(0.45);
    return { box, bar };
  }

  drawStations() {
    this.stages = {};
    const specs = [
      ["key", "INPUT", "Key", 140, 150],
      ["scan", "ENCODE", "Scan", 150, 150],
      ["cpu", "PROCESS", "CPU", 150, 150],
      ["ram", "STORE", "RAM", 190, 150],
      ["mon", "READ BACK", "Monitor", 180, 150],
    ];
    specs.forEach(([id, kicker, title, w, h]) => {
      const p = this.stops[id];
      const drawn = this.panel(p.x, p.y, w, h);
      this.add.text(p.x - w / 2 + 12, p.y - 58, kicker, this.mono(10, "#5c6170"));
      this.add.text(p.x - w / 2 + 12, p.y - 40, title, this.font(16, "#eceef2"));
      this.stages[id] = drawn;
    });

    this.scanText = this.add.text(this.stops.scan.x - 58, this.stops.scan.y + 8, "0x—", this.mono(20, "#7dfff0"));
    this.cpuChar = this.add.text(this.stops.cpu.x - 58, this.stops.cpu.y + 8, "—", this.mono(22, "#8fd4a8"));
    this.add.text(this.stops.ram.x - 78, this.stops.ram.y - 8, "cells", this.font(12, "#8a8f9c"));
    this.addrText = this.add.text(this.stops.ram.x - 78, this.stops.ram.y + 14, "addr —", this.mono(14, "#c4a574"));

    this.add.rectangle(this.stops.mon.x, this.stops.mon.y + 18, 148, 72, 0x0b0d12).setStrokeStyle(1, 0x2a2e38);
    this.monitorText = this.add.text(this.stops.mon.x - 64, this.stops.mon.y + 4, "", this.mono(20, "#8fd4a8"));
    this.monZone = this.add.rectangle(this.stops.mon.x, this.stops.mon.y, 180, 150, 0x4a9a94, 0);
  }

  drawRamCells() {
    this.cells = [];
    const ox = this.stops.ram.x - 62;
    for (let i = 0; i < 4; i++) {
      const x = ox + i * 34;
      const y = this.stops.ram.y + 46;
      const box = this.add.rectangle(x, y, 28, 28, 0x0b0d12).setStrokeStyle(1, 0x2a2e38);
      const label = this.add.text(x, y, "", this.mono(14, "#7dfff0")).setOrigin(0.5);
      const addr = this.add.text(x, y + 22, "0" + i, this.mono(9, "#5c6170")).setOrigin(0.5);
      this.cells.push({ box, label, addr });
    }
  }

  drawKeyboard() {
    this.panel(this.kb.x, this.kb.y, this.kb.w, this.kb.h);
    this.add.text(this.kb.x - 300, this.kb.y - 88, "KEYBOARD", this.mono(11, "#5c6170"));
    this.add.text(this.kb.x - 300, this.kb.y - 70, "Press the next letter of SAVE", this.font(15, "#eceef2"));

    const originX = this.kb.x - 292;
    const originY = this.kb.y - 40;
    const gap = 5;
    const unit = 36;
    const rows = [
      { stagger: 16, keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"] },
      { stagger: 28, keys: ["A", "S", "D", "F", "G", "H", "J", "K", "L"] },
      { stagger: 48, keys: ["Z", "X", "C", "V", "B", "N", "M"] },
    ];
    this.keycaps = {};
    rows.forEach((row, r) => {
      let x = originX + row.stagger;
      row.keys.forEach((ch) => {
        const code = "Key" + ch;
        const y = originY + r * (unit + gap);
        const cap = this.add.rectangle(x + unit / 2, y + unit / 2, unit, unit, this.C.keyTop).setStrokeStyle(1, this.C.border);
        const text = this.add.text(x + unit / 2, y + unit / 2, ch, this.mono(13, "#eceef2")).setOrigin(0.5);
        this.keycaps[code] = { cap, text, x: x + unit / 2, y: y + unit / 2, restY: y + unit / 2 };
        x += unit + gap;
      });
    });
    const back = this.add.rectangle(this.kb.x + 250, originY + 18, 70, unit, this.C.keyTop).setStrokeStyle(1, this.C.border);
    const backText = this.add.text(this.kb.x + 250, originY + 18, "⌫", this.mono(14, "#eceef2")).setOrigin(0.5);
    this.keycaps.Backspace = { cap: back, text: backText, x: this.kb.x + 250, y: originY + 18, restY: originY + 18 };
  }

  drawHero() {
    const body = this.add.circle(0, 6, 15, 0x4a9a94);
    const visor = this.add.rectangle(0, -9, 20, 7, 0xc4a574);
    const tag = this.add.text(0, 6, "YOU", this.mono(8, "#07080c")).setOrigin(0.5);
    this.hero = this.add.container(78, 400, [body, visor, tag]);
  }

  drawHud() {
    this.add.rectangle(550, 42, 1100, 84, 0x07080c, 0.94);
    this.add.text(36, 12, "LEVEL 02A", this.mono(11, "#4a9a94"));
    this.add.text(36, 30, "The letter stops in RAM", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "22px",
      color: "#eceef2",
    });
    this.objective = this.add.text(
      36,
      58,
      "Same path as Level 02, plus one stop. Type S, then A, then V, then E. The screen changes only after RAM.",
      this.font(14, "#8a8f9c"),
    );
    this.objective.setWordWrapWidth(780);
    this.hint = this.add.text(36, 688, "Arrows walk, slower   ·   one packet at a time   ·   Esc menu", this.mono(12, "#5c6170"));
    this.progress = this.add.text(1064, 18, "S A V E", this.mono(13, "#5c6170")).setOrigin(1, 0);
  }

  setStage(id, alpha) {
    const stage = this.stages[id];
    if (!stage) return;
    stage.box.setStrokeStyle(alpha > 0.6 ? 2 : 1, alpha > 0.6 ? 0x4a9a94 : 0x2a2e38);
    stage.bar.setAlpha(alpha);
  }

  dimStages() {
    Object.keys(this.stages).forEach((id) => this.setStage(id, 0.28));
  }

  pressCap(code) {
    const key = this.keycaps[code];
    if (!key) return null;
    key.cap.setFillStyle(0x4a9a94);
    key.cap.y = key.restY + 3;
    key.text.y = key.restY + 3;
    return key;
  }

  releaseCap(code) {
    const key = this.keycaps[code];
    if (!key) return;
    key.cap.setFillStyle(this.C.keyTop);
    key.cap.y = key.restY;
    key.text.y = key.restY;
  }

  refreshMonitor() {
    const cursor = !this.completed && this.cursorOn ? "▌" : "";
    this.monitorText.setText(this.stored + cursor);
  }

  refreshCells() {
    this.cells.forEach((cell, i) => {
      const ch = this.stored[i] || "";
      cell.label.setText(ch);
      const on = Boolean(ch);
      cell.box.setFillStyle(on ? 0x16332f : 0x0b0d12);
      cell.box.setStrokeStyle(1, on ? 0x4a9a94 : 0x2a2e38);
    });
    const shown = this.WORD.split("").map((ch, i) => (i < this.stored.length ? ch : "·")).join(" ");
    this.progress.setText(shown);
    this.progress.setColor(this.stored.length ? "#7dfff0" : "#5c6170");
  }

  expected() {
    return this.WORD[this.stored.length] || "";
  }

  onKeyDown(e) {
    if (e.repeat) return;
    if (e.key === "Escape") {
      if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }
    if (e.key === "Shift") {
      this.shiftHeld = true;
      return;
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab", "Control", "Alt", "Meta"].includes(e.key)) return;

    if (this.completed && (e.key === "Enter" || e.code === "Enter")) {
      if (this.nearMonitor()) this.scene.start("Level_03_KeyPressToBinary");
      else {
        this.objective.setColor("#c4a574");
        this.objective.setText("Walk up to the monitor, then press Enter for Level 03.");
      }
      return;
    }
    if (this.completed) return;

    if (e.key === "Backspace") {
      const cap = this.pressCap("Backspace");
      this.enqueue({
        char: "⌫",
        code: "Backspace",
        kind: "backspace",
        origin: cap ? { x: cap.x, y: cap.y } : { x: this.kb.x, y: this.kb.y },
      });
      return;
    }

    if (!/^[a-zA-Z]$/.test(e.key)) return;
    const char = e.key.toUpperCase();
    const code = "Key" + char;
    const cap = this.pressCap(code);
    this.enqueue({
      char,
      code,
      kind: "char",
      origin: cap ? { x: cap.x, y: cap.y } : { x: this.kb.x, y: this.kb.y },
    });
  }

  onKeyUp(e) {
    if (e.key === "Shift") this.shiftHeld = false;
    this.releaseCap(e.code);
  }

  enqueue(job) {
    if (this.queue.length > 5) return;
    this.queue.push(job);
    this.pump();
  }

  pump() {
    if (this.busy || !this.queue.length) return;
    this.busy = true;
    const job = this.queue.shift();
    this.fly(job, () => {
      this.busy = false;
      this.pump();
    });
  }

  hop(wrap, x, y, ms, done) {
    this.tweens.add({
      targets: wrap,
      x,
      y,
      duration: ms,
      ease: "Sine.easeInOut",
      onComplete: done,
    });
  }

  fly(job, done) {
    const scan = this.SCAN[job.code] || "??";
    const wrap = this.add.container(job.origin.x, job.origin.y);
    const body = this.add.rectangle(0, 0, 36, 22, 0x4a9a94);
    const label = this.add.text(0, 0, job.char, this.mono(12, "#07080c")).setOrigin(0.5);
    wrap.add([body, label]);
    this.dimStages();
    this.setStage("key", 1);

    const hop = 720;
    this.hop(wrap, this.stops.scan.x, this.stops.scan.y + 28, hop, () => {
      this.scanText.setText("0x" + scan);
      label.setText(scan);
      body.setFillStyle(0xc4a574);
      this.setStage("scan", 1);
      this.hop(wrap, this.stops.cpu.x, this.stops.cpu.y + 28, hop, () => {
        this.cpuChar.setText(job.char);
        label.setText(job.char);
        body.setFillStyle(0x8fd4a8);
        this.setStage("cpu", 1);
        const addr = job.kind === "backspace" ? Math.max(0, this.stored.length - 1) : this.stored.length;
        this.hop(wrap, this.stops.ram.x, this.stops.ram.y + 36, hop, () => {
          label.setText(job.kind === "backspace" ? "⌫" : String(addr).padStart(2, "0"));
          body.setFillStyle(0xc4a574);
          this.addrText.setText("addr " + String(addr).padStart(2, "0"));
          this.setStage("ram", 1);
          const kept = this.commitRam(job);
          this.hop(wrap, this.stops.mon.x, this.stops.mon.y + 16, hop, () => {
            this.setStage("mon", 1);
            if (kept) this.refreshMonitor();
            wrap.destroy();
            done();
          });
        });
      });
    });
  }

  commitRam(job) {
    if (job.kind === "backspace") {
      if (!this.stored.length) {
        this.objective.setColor("#c4a574");
        this.objective.setText("RAM is already empty. The screen only shows what is stored.");
        return false;
      }
      this.stored = this.stored.slice(0, -1);
      this.refreshCells();
      this.objective.setColor("#8a8f9c");
      this.objective.setText("Erased the last cell. Next letter: " + (this.expected() || "done") + ".");
      return true;
    }
    const want = this.expected();
    if (job.char !== want) {
      this.objective.setColor("#c4a574");
      this.objective.setText(job.char + " travelled the whole bus, but RAM refused it. Next letter is " + want + ".");
      this.cells[this.stored.length] && this.cells[this.stored.length].box.setStrokeStyle(2, 0xc4a574);
      return false;
    }
    this.stored += job.char;
    this.refreshCells();
    if (this.stored === this.WORD) {
      this.completed = true;
      this.objective.setColor("#8fd4a8");
      this.objective.setText("SAVE is in RAM, then read back to the monitor. Walk to the monitor and press Enter.");
      this.monZone.setStrokeStyle(2, 0x4a9a94);
      this.hint.setText("Level 02A complete   ·   stand on the monitor   ·   Enter continues");
    } else {
      this.objective.setColor("#eceef2");
      this.objective.setText(job.char + " is in cell 0" + (this.stored.length - 1) + ". The monitor copied it from RAM. Next: " + this.expected() + ".");
    }
    return true;
  }

  nearMonitor() {
    const m = this.stops.mon;
    return Math.abs(this.hero.x - m.x) < 100 && Math.abs(this.hero.y - m.y) < 90;
  }

  update() {
    const speed = 3.15;
    if (this.moveKeys.up.isDown) this.hero.y -= speed;
    if (this.moveKeys.down.isDown) this.hero.y += speed;
    if (this.moveKeys.left.isDown) this.hero.x -= speed;
    if (this.moveKeys.right.isDown) this.hero.x += speed;
    this.hero.x = Phaser.Math.Clamp(this.hero.x, 28, 1072);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, 108, 700);
    if (this.completed) {
      this.monZone.setFillStyle(0x4a9a94, this.nearMonitor() ? 0.12 : 0);
    }
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

class Level_02_ImprovedKeyboard extends Phaser.Scene {
  constructor() {
    super("Level_02_ImprovedKeyboard");
  }

  create() {
    this.typedText = "";
    this.currentLineLength = 0;
    this.particles = [];
    this.startTime = this.time.now;
    this.tipShown = false;
    this.completed = false;
    this.cursorOn = true;
    this.lastScan = "—";
    this.lastChar = "—";
    this.shiftHeld = false;

    this.C = {
      bg: 0x07080c,
      surface: 0x12141a,
      surface2: 0x1a1d26,
      border: 0x2a2e38,
      teal: 0x4a9a94,
      tealBright: 0x7dfff0,
      gold: 0xc4a574,
      fg: 0xeceef2,
      muted: 0x8a8f9c,
      success: 0x8fd4a8,
      key: 0x1a1d26,
      keyTop: 0x242833,
    };

    this.SCAN = {
      KeyA: "1E", KeyB: "30", KeyC: "2E", KeyD: "20", KeyE: "12", KeyF: "21",
      KeyG: "22", KeyH: "23", KeyI: "17", KeyJ: "24", KeyK: "25", KeyL: "26",
      KeyM: "32", KeyN: "31", KeyO: "18", KeyP: "19", KeyQ: "10", KeyR: "13",
      KeyS: "1F", KeyT: "14", KeyU: "16", KeyV: "2F", KeyW: "11", KeyX: "2D",
      KeyY: "15", KeyZ: "2C", Digit1: "02", Digit2: "03", Digit3: "04",
      Digit4: "05", Digit5: "06", Digit6: "07", Digit7: "08", Digit8: "09",
      Digit9: "0A", Digit0: "0B", Space: "39", Enter: "1C", Backspace: "0E",
      ShiftLeft: "2A", ShiftRight: "36", Minus: "0C", Equal: "0D",
    };

    this.cameras.main.setBackgroundColor(this.C.bg);
    this.drawGrid();

    this.moveKeys = this.input.keyboard.addKeys({
      up: "UP",
      down: "DOWN",
      left: "LEFT",
      right: "RIGHT",
    });

    this.kb = { x: 360, y: 560, w: 640, h: 220 };
    this.kbc = { x: 560, y: 300 };
    this.cpu = { x: 760, y: 220 };
    this.mon = { x: 960, y: 250 };

    this.drawPath();
    this.drawKeyboard();
    this.drawController();
    this.drawCpu();
    this.drawMonitor();
    this.drawHero();
    this.drawHud();
    this.drawBootTrack();

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

  drawPath() {
    const g = this.add.graphics();
    g.lineStyle(2, 0x2d5e5a, 0.85);
    g.beginPath();
    g.moveTo(this.kb.x, this.kb.y - 118);
    g.lineTo(this.kbc.x, this.kbc.y + 70);
    g.lineTo(this.cpu.x - 70, this.cpu.y + 10);
    g.lineTo(this.mon.x - 110, this.mon.y + 10);
    g.strokePath();
  }

  panel(x, y, w, h) {
    this.add.rectangle(x, y, w, h, this.C.surface).setStrokeStyle(1, this.C.border);
    this.add.rectangle(x, y - h / 2 + 1, w, 2, this.C.teal).setAlpha(0.5);
  }

  drawKeyboard() {
    this.panel(this.kb.x, this.kb.y, this.kb.w, this.kb.h);
    this.add.text(this.kb.x - 300, this.kb.y - 98, "INPUT", this.mono(11, "#5c6170"));
    this.add.text(this.kb.x - 300, this.kb.y - 80, "Keyboard matrix", this.font(18, "#eceef2"));
    this.kbZone = this.add.rectangle(this.kb.x, this.kb.y, this.kb.w, this.kb.h, 0x4a9a94, 0);

    const originX = this.kb.x - 292;
    const originY = this.kb.y - 48;
    const gap = 6;
    const unit = 42;
    const rows = [
      { stagger: 0, keys: [
        ["Digit1", "1", "!"], ["Digit2", "2"], ["Digit3", "3"], ["Digit4", "4"], ["Digit5", "5"],
        ["Digit6", "6"], ["Digit7", "7"], ["Digit8", "8"], ["Digit9", "9"], ["Digit0", "0"],
        ["Backspace", "⌫", null, 1.6],
      ]},
      { stagger: 18, keys: [
        ["KeyQ", "Q"], ["KeyW", "W"], ["KeyE", "E"], ["KeyR", "R"], ["KeyT", "T"],
        ["KeyY", "Y"], ["KeyU", "U"], ["KeyI", "I"], ["KeyO", "O"], ["KeyP", "P"],
      ]},
      { stagger: 30, keys: [
        ["KeyA", "A"], ["KeyS", "S"], ["KeyD", "D"], ["KeyF", "F"], ["KeyG", "G"],
        ["KeyH", "H"], ["KeyJ", "J"], ["KeyK", "K"], ["KeyL", "L"],
        ["Enter", "⏎", null, 1.5],
      ]},
      { stagger: 42, keys: [
        ["ShiftLeft", "SHIFT", null, 1.7], ["KeyZ", "Z"], ["KeyX", "X"], ["KeyC", "C"],
        ["KeyV", "V"], ["KeyB", "B"], ["KeyN", "N"], ["KeyM", "M"],
        ["ShiftRight", "SHIFT", null, 1.7],
      ]},
      { stagger: 90, keys: [
        ["Space", "", null, 7.2],
      ]},
    ];

    this.keycaps = {};
    rows.forEach((row, r) => {
      let x = originX + row.stagger;
      row.keys.forEach((spec) => {
        const code = spec[0];
        const label = spec[1];
        const shiftLabel = spec[2];
        const wide = spec[3] || 1;
        const w = unit * wide + gap * (wide - 1);
        const y = originY + r * (unit + gap);
        const cap = this.add.rectangle(x + w / 2, y + unit / 2, w, unit, this.C.keyTop).setStrokeStyle(1, this.C.border);
        const text = this.add.text(x + w / 2, y + unit / 2 + (shiftLabel ? 6 : 0), label, this.mono(label.length > 1 ? 10 : 13, "#eceef2")).setOrigin(0.5);
        let sub = null;
        if (shiftLabel) {
          sub = this.add.text(x + 8, y + 6, shiftLabel, this.mono(10, "#c4a574"));
        }
        this.keycaps[code] = { cap, text, sub, x: x + w / 2, y: y + unit / 2, restY: y + unit / 2, w, h: unit };
        x += w + gap;
      });
    });
  }

  drawController() {
    this.panel(this.kbc.x, this.kbc.y, 200, 132);
    this.add.text(this.kbc.x - 84, this.kbc.y - 52, "ENCODE", this.mono(11, "#5c6170"));
    this.add.text(this.kbc.x - 84, this.kbc.y - 34, "Keyboard IC", this.font(16, "#eceef2"));
    this.add.text(this.kbc.x - 84, this.kbc.y - 8, "Scan code", this.font(12, "#8a8f9c"));
    this.scanText = this.add.text(this.kbc.x - 84, this.kbc.y + 12, "0x—", this.mono(22, "#7dfff0"));
    this.kbcFlash = this.add.rectangle(this.kbc.x, this.kbc.y, 200, 132, 0x4a9a94, 0);
  }

  drawCpu() {
    this.panel(this.cpu.x, this.cpu.y, 176, 132);
    this.add.text(this.cpu.x - 72, this.cpu.y - 52, "PROCESS", this.mono(11, "#5c6170"));
    this.add.text(this.cpu.x - 72, this.cpu.y - 34, "CPU", this.font(16, "#eceef2"));
    this.add.text(this.cpu.x - 72, this.cpu.y - 8, "Interrupt → char", this.font(12, "#8a8f9c"));
    this.cpuChar = this.add.text(this.cpu.x - 72, this.cpu.y + 12, "—", this.mono(22, "#8fd4a8"));
    this.cpuCore = this.add.rectangle(this.cpu.x + 48, this.cpu.y + 22, 44, 36, 0x1a1d26).setStrokeStyle(1, 0x4a9a94);
    this.cpuFlash = this.add.rectangle(this.cpu.x, this.cpu.y, 176, 132, 0x4a9a94, 0);
  }

  drawMonitor() {
    this.panel(this.mon.x, this.mon.y, 236, 248);
    this.add.text(this.mon.x - 98, this.mon.y - 108, "DISPLAY", this.mono(11, "#5c6170"));
    this.add.text(this.mon.x - 98, this.mon.y - 90, "Monitor", this.font(16, "#eceef2"));
    this.add.rectangle(this.mon.x, this.mon.y + 22, 200, 148, 0x0b0d12).setStrokeStyle(1, 0x2a2e38);
    this.add.rectangle(this.mon.x, this.mon.y + 132, 70, 10, 0x1a1d26);
    this.add.rectangle(this.mon.x, this.mon.y + 146, 36, 14, 0x1a1d26);
    this.add.text(this.mon.x - 88, this.mon.y - 44, "framebuffer", this.mono(11, "#5c6170"));
    this.monitorText = this.add.text(this.mon.x - 88, this.mon.y - 24, "", {
      fontFamily: "IBM Plex Mono, ui-monospace, monospace",
      fontSize: "16px",
      color: "#8fd4a8",
      fixedWidth: 176,
      lineSpacing: 5,
    });
    this.monFlash = this.add.rectangle(this.mon.x, this.mon.y, 236, 248, 0x4a9a94, 0);
  }

  drawHero() {
    const body = this.add.circle(0, 6, 16, 0x4a9a94);
    const visor = this.add.rectangle(0, -10, 22, 8, 0xc4a574);
    const tag = this.add.text(0, 6, "YOU", this.mono(9, "#07080c")).setOrigin(0.5);
    this.hero = this.add.container(90, 250, [body, visor, tag]);
  }

  drawHud() {
    this.add.rectangle(550, 44, 1100, 88, 0x07080c, 0.92);
    this.add.text(36, 16, "LEVEL 02", this.mono(11, "#4a9a94"));
    this.add.text(36, 36, "Improved keyboard & monitor", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "24px",
      color: "#eceef2",
    });
    this.objective = this.add.text(
      36,
      68,
      "Press a key. The packet starts on that cap, then scan → CPU → display. Finish with BOOT!",
      this.font(14, "#8a8f9c"),
    );
    this.add.text(1064, 22, "Esc menu", this.mono(12, "#5c6170")).setOrigin(1, 0);
    this.add.text(1064, 44, "Arrows walk", this.mono(12, "#5c6170")).setOrigin(1, 0);
  }

  drawBootTrack() {
    this.bootSlots = [];
    const word = ["B", "O", "O", "T", "!"];
    word.forEach((ch, i) => {
      const x = 64 + i * 36;
      const y = 118;
      const box = this.add.rectangle(x, y, 28, 28, 0x12141a).setStrokeStyle(1, 0x2a2e38);
      const label = this.add.text(x, y, ch, this.mono(14, "#5c6170")).setOrigin(0.5);
      this.bootSlots.push({ ch, box, label });
    });
  }

  pulse(rect) {
    rect.setFillStyle(0x4a9a94, 0.2);
    this.tweens.add({ targets: rect, fillAlpha: 0, duration: 260, ease: "Sine.easeOut" });
  }

  pressCap(code) {
    const key = this.keycaps[code];
    if (!key) return null;
    key.cap.setFillStyle(this.C.teal);
    key.cap.y = key.restY + 3;
    key.text.y = key.restY + 3 + (key.sub ? 6 : 0);
    return key;
  }

  releaseCap(code) {
    const key = this.keycaps[code];
    if (!key) return;
    key.cap.setFillStyle(this.C.keyTop);
    key.cap.y = key.restY;
    key.text.y = key.restY + (key.sub ? 6 : 0);
  }

  refreshMonitor() {
    const cursor = !this.completed && this.cursorOn ? "▌" : "";
    this.monitorText.setText(this.typedText + cursor);
  }

  refreshBootTrack() {
    const got = this.typedText;
    let idx = 0;
    const target = "BOOT!";
    while (idx < target.length && got.indexOf(target.slice(0, idx + 1)) !== -1) idx += 1;
    this.bootSlots.forEach((slot, i) => {
      const on = i < idx;
      slot.box.setStrokeStyle(1, on ? 0x4a9a94 : 0x2a2e38);
      slot.box.setFillStyle(on ? 0x16332f : 0x12141a);
      slot.label.setColor(on ? "#7dfff0" : "#5c6170");
    });
  }

  onKeyDown(e) {
    if (e.key === "Escape") {
      if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }

    if (e.key === "Shift") {
      this.shiftHeld = true;
      this.pressCap("ShiftLeft");
      this.pressCap("ShiftRight");
      return;
    }

    if (this.completed && (e.key === "Enter" || e.code === "Enter")) {
      if (this.nearKeyboard()) {
        this.scene.start("Level_03_KeyPressToBinary");
      } else {
        this.objective.setColor("#c4a574");
        this.objective.setText("Walk onto the keyboard first, then press Enter.");
        this.pulse(this.kbZone);
      }
      return;
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab", "Control", "Alt", "Meta"].includes(e.key)) return;

    const cap = this.pressCap(e.code);
    const origin = cap ? { x: cap.x, y: cap.y } : { x: this.kb.x, y: this.kb.y };

    if (e.key === "Backspace") {
      this.sendPacket("⌫", e.code, origin, "backspace");
      return;
    }

    let char = "";
    if (e.key === " ") char = "_";
    else if (e.key === "!") char = "!";
    else if (/^[a-zA-Z0-9]$/.test(e.key)) char = e.key.toUpperCase();
    if (!char) return;

    this.sendPacket(char, e.code, origin, "char");
  }

  onKeyUp(e) {
    if (e.key === "Shift") {
      this.shiftHeld = false;
      this.releaseCap("ShiftLeft");
      this.releaseCap("ShiftRight");
      return;
    }
    this.releaseCap(e.code);
  }

  sendPacket(char, code, origin, kind) {
    const scan = this.SCAN[code] || "??";
    const wrap = this.add.container(origin.x, origin.y);
    const body = this.add.rectangle(0, 0, 34, 22, this.C.teal);
    const label = this.add.text(0, 0, char, this.mono(11, "#07080c")).setOrigin(0.5);
    wrap.add([body, label]);
    this.particles.push(wrap);

    this.tweens.add({
      targets: wrap,
      x: this.kbc.x,
      y: this.kbc.y + 20,
      duration: 380,
      ease: "Cubic.easeInOut",
      onComplete: () => {
        this.lastScan = scan;
        this.scanText.setText("0x" + scan);
        this.pulse(this.kbcFlash);
        label.setText(scan);
        body.setFillStyle(0xc4a574);
        this.tweens.add({
          targets: wrap,
          x: this.cpu.x,
          y: this.cpu.y + 18,
          duration: 380,
          ease: "Cubic.easeInOut",
          onComplete: () => {
            this.cpuChar.setText(kind === "backspace" ? "⌫" : char);
            this.pulse(this.cpuFlash);
            this.tweens.add({ targets: this.cpuCore, scaleX: 1.1, scaleY: 1.1, yoyo: true, duration: 110 });
            body.setFillStyle(this.C.success);
            label.setText(kind === "backspace" ? "⌫" : char);
            this.tweens.add({
              targets: wrap,
              x: this.mon.x,
              y: this.mon.y + 8,
              duration: 380,
              ease: "Cubic.easeInOut",
              onComplete: () => {
                this.land(char, kind);
                this.pulse(this.monFlash);
                const i = this.particles.indexOf(wrap);
                if (i > -1) this.particles.splice(i, 1);
                wrap.destroy();
              },
            });
          },
        });
      },
    });
  }

  land(char, kind) {
    if (kind === "backspace") {
      if (this.typedText.endsWith("\n")) {
        this.typedText = this.typedText.slice(0, -1);
        this.currentLineLength = 12;
      }
      if (this.typedText.length) {
        this.typedText = this.typedText.slice(0, -1);
        this.currentLineLength = Math.max(0, this.currentLineLength - 1);
      }
    } else {
      this.typedText += char;
      this.currentLineLength += 1;
      if (this.currentLineLength >= 11) {
        this.typedText += "\n";
        this.currentLineLength = 0;
      }
    }
    this.refreshMonitor();
    this.refreshBootTrack();
    this.checkComplete();
  }

  checkComplete() {
    if (this.completed) return;
    if (!this.typedText.replace(/\n/g, "").includes("BOOT!")) return;
    this.completed = true;
    this.refreshMonitor();
    this.objective.setColor("#8fd4a8");
    this.objective.setText("Scan codes became characters. Walk onto the keyboard and press Enter for Level 03.");
    this.kbZone.setStrokeStyle(2, 0x4a9a94);
  }

  nearKeyboard() {
    return (
      this.hero.x > this.kb.x - this.kb.w / 2 &&
      this.hero.x < this.kb.x + this.kb.w / 2 &&
      this.hero.y > this.kb.y - this.kb.h / 2 &&
      this.hero.y < this.kb.y + this.kb.h / 2 + 20
    );
  }

  update() {
    const speed = 5.5;
    if (this.moveKeys.up.isDown) this.hero.y -= speed;
    if (this.moveKeys.down.isDown) this.hero.y += speed;
    if (this.moveKeys.left.isDown) this.hero.x -= speed;
    if (this.moveKeys.right.isDown) this.hero.x += speed;
    this.hero.x = Phaser.Math.Clamp(this.hero.x, 28, 1072);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, 110, 700);

    if (this.completed && this.nearKeyboard()) {
      this.kbZone.setFillStyle(0x4a9a94, 0.08);
    } else if (this.completed) {
      this.kbZone.setFillStyle(0x4a9a94, 0);
    }

    if (!this.tipShown && !this.completed && (this.time.now - this.startTime) / 1000 > 14) {
      this.tipShown = true;
      this.objective.setColor("#c4a574");
      this.objective.setText("Need an exclamation: hold Shift and press 1. The track above wants BOOT!");
    }
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.particles.forEach((p) => p.destroy());
    this.particles = [];
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

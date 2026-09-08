class Level_01_KeyboardCPU extends Phaser.Scene {
  constructor() {
    super("Level_01_KeyboardCPU");
  }

  create() {
    this.typedText = "";
    this.currentLineLength = 0;
    this.particles = [];
    this.startTime = this.time.now;
    this.tipShown = false;
    this.completed = false;
    this.cursorOn = true;

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
    };

    this.cameras.main.setBackgroundColor(this.C.bg);
    this.drawGrid();

    this.keys = this.input.keyboard.addKeys({
      up: "UP",
      down: "DOWN",
      left: "LEFT",
      right: "RIGHT",
      w: "W",
      s: "S",
      a: "A",
      d: "D",
    });

    this.kb = { x: 220, y: 540 };
    this.cpu = { x: 540, y: 370 };
    this.mon = { x: 860, y: 250 };

    this.drawPath();
    this.drawKeyboard();
    this.drawCpu();
    this.drawMonitor();
    this.drawHero();
    this.drawHud();

    this.time.addEvent({
      delay: 530,
      loop: true,
      callback: () => {
        this.cursorOn = !this.cursorOn;
        this.refreshMonitor();
      },
    });

    this.input.keyboard.on("keydown", (e) => this.onKey(e));
  }

  font(size, color, extra) {
    return Object.assign(
      {
        fontFamily: "IBM Plex Sans, Segoe UI, sans-serif",
        fontSize: size + "px",
        color: color,
      },
      extra || {},
    );
  }

  mono(size, color, extra) {
    return Object.assign(
      {
        fontFamily: "IBM Plex Mono, ui-monospace, monospace",
        fontSize: size + "px",
        color: color,
      },
      extra || {},
    );
  }

  drawGrid() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x1a1d26, 0.9);
    for (let x = 40; x < 1100; x += 40) g.lineBetween(x, 0, x, 720);
    for (let y = 40; y < 720; y += 40) g.lineBetween(0, y, 1100, y);
    g.lineStyle(1, 0x2a2e38, 0.35);
    g.strokeRect(24, 88, 1052, 608);
  }

  drawPath() {
    const g = this.add.graphics();
    g.lineStyle(2, 0x2d5e5a, 0.9);
    g.beginPath();
    g.moveTo(this.kb.x + 90, this.kb.y - 70);
    g.lineTo(this.cpu.x - 70, this.cpu.y + 20);
    g.lineTo(this.mon.x - 110, this.mon.y + 20);
    g.strokePath();

    this.add.triangle(this.cpu.x - 88, this.cpu.y + 28, 0, 7, 10, 0, 0, -7, 0x4a9a94).setAngle(-28);
    this.add.triangle(this.mon.x - 128, this.mon.y + 18, 0, 7, 10, 0, 0, -7, 0x4a9a94).setAngle(-12);

    this.pipe = {
      kb: this.add.circle(this.kb.x + 90, this.kb.y - 78, 5, 0x2a2e38).setStrokeStyle(2, 0x4a9a94),
      cpu: this.add.circle(this.cpu.x, this.cpu.y + 92, 5, 0x2a2e38).setStrokeStyle(2, 0x4a9a94),
      mon: this.add.circle(this.mon.x - 110, this.mon.y + 20, 5, 0x2a2e38).setStrokeStyle(2, 0x4a9a94),
    };
  }

  panel(x, y, w, h) {
    const box = this.add.rectangle(x, y, w, h, this.C.surface).setStrokeStyle(1, this.C.border);
    this.add.rectangle(x, y - h / 2 + 1, w, 2, this.C.teal).setAlpha(0.55);
    return box;
  }

  drawKeyboard() {
    this.kbBox = this.panel(this.kb.x, this.kb.y, 280, 148);
    this.add.text(this.kb.x - 118, this.kb.y - 58, "INPUT", this.mono(11, "#5c6170")).setAlpha(0.9);
    this.add.text(this.kb.x - 118, this.kb.y - 38, "Keyboard", this.font(20, "#eceef2", { fontStyle: "500" }));
    this.add.text(this.kb.x - 118, this.kb.y - 12, "Type a character.\nIt leaves as a signal.", this.font(14, "#8a8f9c"));
    this.kbFlash = this.add.rectangle(this.kb.x, this.kb.y, 280, 148, 0x4a9a94, 0);
  }

  drawCpu() {
    this.cpuBox = this.panel(this.cpu.x, this.cpu.y, 188, 168);
    this.add.text(this.cpu.x - 74, this.cpu.y - 68, "PROCESS", this.mono(11, "#5c6170"));
    this.add.text(this.cpu.x - 74, this.cpu.y - 48, "CPU", this.font(20, "#eceef2", { fontStyle: "500" }));
    this.cpuCore = this.add.rectangle(this.cpu.x, this.cpu.y + 18, 84, 64, 0x1a1d26).setStrokeStyle(1, 0x4a9a94);
    this.add.text(this.cpu.x, this.cpu.y + 18, "CORE", this.mono(12, "#4a9a94")).setOrigin(0.5);
    this.add.text(this.cpu.x - 74, this.cpu.y + 62, "Decode, then forward.", this.font(13, "#8a8f9c"));
    this.cpuFlash = this.add.rectangle(this.cpu.x, this.cpu.y, 188, 168, 0x4a9a94, 0);
  }

  drawMonitor() {
    this.panel(this.mon.x, this.mon.y, 268, 248);
    this.add.text(this.mon.x - 114, this.mon.y - 108, "DISPLAY", this.mono(11, "#5c6170"));
    this.add.text(this.mon.x - 114, this.mon.y - 88, "Monitor", this.font(20, "#eceef2", { fontStyle: "500" }));
    this.add.rectangle(this.mon.x, this.mon.y + 18, 228, 150, 0x0b0d12).setStrokeStyle(1, 0x2a2e38);
    this.add.text(this.mon.x - 104, this.mon.y - 46, "You typed", this.mono(11, "#5c6170"));
    this.monitorText = this.add.text(this.mon.x - 104, this.mon.y - 26, "", {
      fontFamily: "IBM Plex Mono, ui-monospace, monospace",
      fontSize: "16px",
      color: "#8fd4a8",
      fixedWidth: 200,
      lineSpacing: 6,
    });
    this.monFlash = this.add.rectangle(this.mon.x, this.mon.y, 268, 248, 0x4a9a94, 0);
  }

  drawHero() {
    const body = this.add.circle(0, 6, 16, 0x4a9a94);
    const visor = this.add.rectangle(0, -10, 22, 8, 0xc4a574);
    const tag = this.add.text(0, 6, "YOU", this.mono(9, "#07080c")).setOrigin(0.5);
    this.hero = this.add.container(this.kb.x, this.kb.y - 10, [body, visor, tag]);
  }

  drawHud() {
    this.add.rectangle(550, 44, 1100, 88, 0x07080c, 0.92);
    this.add.text(36, 18, "LEVEL 01", this.mono(11, "#4a9a94"));
    this.add.text(36, 38, "Keyboard → CPU → Display", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "26px",
      color: "#eceef2",
    });
    this.objective = this.add.text(36, 70, "Type any letter. Follow the packet. BOOT ends the lesson.", this.font(14, "#8a8f9c"));
    this.add.text(980, 24, "Esc menu", this.mono(12, "#5c6170")).setOrigin(1, 0);
    this.add.text(980, 46, "WASD walk", this.mono(12, "#5c6170")).setOrigin(1, 0);
  }

  pulse(rect) {
    rect.setFillStyle(0x4a9a94, 0.22);
    this.tweens.add({
      targets: rect,
      fillAlpha: 0,
      duration: 280,
      ease: "Sine.easeOut",
    });
  }

  refreshMonitor() {
    const cursor = !this.completed && this.cursorOn ? "▌" : "";
    this.monitorText.setText(this.typedText + cursor);
  }

  onKey(e) {
    if (e.key === "Escape") {
      if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }

    if (this.completed) {
      if (e.key === "2") this.scene.start("Level_02_ImprovedKeyboard");
      return;
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace", "Shift", "Control", "Alt", "Meta", "Tab", "Escape"].includes(e.key)) {
      return;
    }

    let char = "";
    if (e.key === " ") char = "_";
    else if (/^[a-zA-Z0-9]$/.test(e.key)) char = e.key.toUpperCase();
    if (!char) return;

    this.pulse(this.kbFlash);
    this.pipe.kb.setFillStyle(this.C.tealBright);
    this.sendPacket(char);
  }

  sendPacket(char) {
    const wrap = this.add.container(this.kb.x, this.kb.y - 8);
    const body = this.add.rectangle(0, 0, 28, 22, this.C.teal);
    const label = this.add.text(0, 0, char, this.mono(12, "#07080c")).setOrigin(0.5);
    wrap.add([body, label]);
    this.particles.push(wrap);

    this.tweens.add({
      targets: wrap,
      x: this.cpu.x,
      y: this.cpu.y + 18,
      duration: 520,
      ease: "Cubic.easeInOut",
      onComplete: () => {
        body.setFillStyle(this.C.success);
        this.pulse(this.cpuFlash);
        this.pipe.cpu.setFillStyle(this.C.tealBright);
        this.tweens.add({
          targets: this.cpuCore,
          scaleX: 1.08,
          scaleY: 1.08,
          yoyo: true,
          duration: 120,
        });
        this.tweens.add({
          targets: wrap,
          x: this.mon.x,
          y: this.mon.y + 8,
          duration: 520,
          ease: "Cubic.easeInOut",
          onComplete: () => {
            this.landChar(char);
            this.pulse(this.monFlash);
            this.pipe.mon.setFillStyle(this.C.tealBright);
            const pop = this.add.text(this.mon.x, this.mon.y - 20, char, this.font(34, "#7dfff0")).setOrigin(0.5);
            this.tweens.add({
              targets: pop,
              y: this.mon.y - 56,
              alpha: 0,
              duration: 640,
              onComplete: () => pop.destroy(),
            });
            const i = this.particles.indexOf(wrap);
            if (i > -1) this.particles.splice(i, 1);
            wrap.destroy();
          },
        });
      },
    });
  }

  landChar(char) {
    this.typedText += char;
    this.currentLineLength += 1;
    if (this.currentLineLength >= 12) {
      this.typedText += "\n";
      this.currentLineLength = 0;
    }
    this.refreshMonitor();
    this.checkComplete();
  }

  checkComplete() {
    if (this.completed) return;
    if (!this.typedText.includes("BOOT")) return;
    this.completed = true;
    this.refreshMonitor();
    this.objective.setColor("#8fd4a8");
    this.objective.setText("Lesson complete. The character took the same path every time. Press 2 for Level 02.");
    this.add
      .text(550, 660, "Level 01 complete  ·  Press 2", this.mono(14, "#8fd4a8"))
      .setOrigin(0.5);
  }

  update() {
    const speed = 5.5;
    if (this.keys.w.isDown || this.keys.up.isDown) this.hero.y -= speed;
    if (this.keys.s.isDown || this.keys.down.isDown) this.hero.y += speed;
    if (this.keys.a.isDown || this.keys.left.isDown) this.hero.x -= speed;
    if (this.keys.d.isDown || this.keys.right.isDown) this.hero.x += speed;
    this.hero.x = Phaser.Math.Clamp(this.hero.x, 36, 1064);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, 110, 690);

    if (!this.tipShown && !this.completed && (this.time.now - this.startTime) / 1000 > 16) {
      this.tipShown = true;
      this.objective.setColor("#c4a574");
      this.objective.setText("Tip: type BOOT — B, O, O, T — and watch four packets finish the path.");
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

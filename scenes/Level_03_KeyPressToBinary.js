class Level_03_KeyPressToBinary extends Phaser.Scene {
  constructor() {
    super("Level_03_KeyPressToBinary");
  }

  create(data) {
    this.typedText = "";
    this.currentLineLength = 0;
    this.particles = [];
    this.startTime = this.time.now;
    this.tipShown = false;
    this.completed = false;
    this.sawJ = false;
    this.cursorOn = true;
    this.lifting = false;
    this.targetLit = false;
    this.goal = "01001010";

    this.C = {
      bg: 0xf3efe6,
      surface: 0xfffcf7,
      surface2: 0xf7f4ee,
      border: 0xd9d1c3,
      teal: 0x1d6b66,
      tealBright: 0x143f3c,
      gold: 0x8d5a1a,
      fg: 0x1c1915,
      muted: 0x6e675f,
      success: 0x1e6b45,
      pale: 0xcfc6b8,
    };

    this.TABLE = [
      { ch: "0", bits: "00110000" },
      { ch: "1", bits: "00110001" },
      { ch: "A", bits: "01000001" },
      { ch: "B", bits: "01000010" },
      { ch: "C", bits: "01000011" },
      { ch: "D", bits: "01000100" },
      { ch: "E", bits: "01000101" },
      { ch: "F", bits: "01000110" },
      { ch: "G", bits: "01000111" },
      { ch: "H", bits: "01001000" },
      { ch: "I", bits: "01001001" },
      { ch: "J", bits: "01001010", target: true },
      { ch: "K", bits: "01001011" },
      { ch: "L", bits: "01001100" },
    ];

    this.cameras.main.setBackgroundColor(this.C.bg);
    this.drawGrid();

    this.moveKeys = this.input.keyboard.addKeys({
      up: "UP",
      down: "DOWN",
      left: "LEFT",
      right: "RIGHT",
    });

    this.rom = { x: 168, y: 400 };
    this.cpu = { x: 500, y: 430 };
    this.mon = { x: 860, y: 320 };
    this.kb = { x: 500, y: 620 };

    this.drawPath();
    this.drawRom();
    this.drawCpu();
    this.drawMonitor();
    this.drawKeys();
    this.drawHero();
    this.drawHud();
    this.drawBitTrack();

    this.time.addEvent({
      delay: 530,
      loop: true,
      callback: () => {
        this.cursorOn = !this.cursorOn;
        this.refreshMonitor();
      },
    });

    this.input.keyboard.on("keydown", (e) => this.onKey(e));
    this.drawMapReturn();
    if (data && data.fromMap) this.revealFromMap();
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
    g.lineStyle(1, 0xe4ddd0, 1);
    for (let x = 40; x < 1100; x += 40) g.lineBetween(x, 0, x, 720);
    for (let y = 40; y < 720; y += 40) g.lineBetween(0, y, 1100, y);
  }

  drawPath() {
    const g = this.add.graphics();
    g.lineStyle(2, 0xc9ddd9, 1);
    g.beginPath();
    g.moveTo(this.kb.x, this.kb.y - 48);
    g.lineTo(this.cpu.x, this.cpu.y + 90);
    g.lineTo(this.rom.x + 80, this.rom.y + 20);
    g.moveTo(this.rom.x + 80, this.rom.y - 40);
    g.lineTo(this.cpu.x - 40, this.cpu.y - 40);
    g.lineTo(this.mon.x - 120, this.mon.y + 40);
    g.strokePath();
  }

  panel(x, y, w, h) {
    this.add.rectangle(x, y, w, h, this.C.surface).setStrokeStyle(1, this.C.border);
    this.add.rectangle(x, y - h / 2 + 1, w, 2, this.C.teal).setAlpha(0.7);
  }

  drawRom() {
    this.panel(this.rom.x, this.rom.y, 280, 470);
    this.add.text(this.rom.x - 118, this.rom.y - 220, "LOOKUP", this.mono(11, "#6e675f"));
    this.add.text(this.rom.x - 118, this.rom.y - 202, "ASCII ROM", this.font(18, "#1c1915"));
    this.add.text(this.rom.x - 118, this.rom.y - 176, "CHR   DEC  HEX   BINARY", this.mono(11, "#6e675f"));

    this.romRows = {};
    this.TABLE.forEach((row, i) => {
      const y = this.rom.y - 152 + i * 24;
      const dec = row.ch.charCodeAt(0).toString().padStart(3, " ");
      const hex = row.ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
      const bg = this.add.rectangle(this.rom.x, y, 252, 22, row.target ? 0xfff6e8 : 0xfffcf7, 1);
      bg.setStrokeStyle(1, row.target ? 0xc4a574 : 0xe7e0d4);
      const color = row.target ? "#8d5a1a" : "#6e675f";
      const label = this.add.text(this.rom.x - 118, y - 7, row.ch + "    " + dec + "  " + hex + "   " + row.bits, this.mono(12, color));
      this.romRows[row.ch] = { bg, label, y, target: !!row.target, bits: row.bits };
      if (row.target) {
        bg.setInteractive({ useHandCursor: true });
        label.setInteractive({ useHandCursor: true });
        bg.on("pointerdown", () => this.liftJ());
        label.on("pointerdown", () => this.liftJ());
        bg.on("pointerover", () => bg.setFillStyle(0xf3e2c4));
        bg.on("pointerout", () => bg.setFillStyle(this.targetLit ? 0xe7f3f1 : 0xfff6e8));
      }
    });
  }

  drawCpu() {
    this.panel(this.cpu.x, this.cpu.y, 300, 210);
    this.add.text(this.cpu.x - 132, this.cpu.y - 90, "ENCODE", this.mono(11, "#6e675f"));
    this.add.text(this.cpu.x - 132, this.cpu.y - 72, "CPU · 8-bit register", this.font(16, "#1c1915"));
    this.add.text(this.cpu.x - 132, this.cpu.y - 48, "MSB →", this.mono(11, "#6e675f"));

    this.bitCells = [];
    for (let i = 0; i < 8; i++) {
      const x = this.cpu.x - 118 + i * 34;
      const box = this.add.rectangle(x, this.cpu.y - 8, 28, 36, 0xf7f4ee).setStrokeStyle(1, 0xd9d1c3);
      const bit = this.add.text(x, this.cpu.y - 8, "·", this.mono(16, "#cfc6b8")).setOrigin(0.5);
      const idx = this.add.text(x, this.cpu.y + 22, String(7 - i), this.mono(9, "#6e675f")).setOrigin(0.5);
      this.bitCells.push({ box, bit, idx });
    }

    this.decodeText = this.add.text(this.cpu.x - 132, this.cpu.y + 48, "char —   dec —   hex —", this.mono(13, "#6e675f"));
    this.cpuFlash = this.add.rectangle(this.cpu.x, this.cpu.y, 300, 210, 0x1d6b66, 0);
  }

  drawMonitor() {
    this.panel(this.mon.x, this.mon.y, 320, 280);
    this.add.text(this.mon.x - 140, this.mon.y - 124, "DISPLAY", this.mono(11, "#6e675f"));
    this.add.text(this.mon.x - 140, this.mon.y - 106, "After lookup", this.font(16, "#1c1915"));
    this.add.rectangle(this.mon.x, this.mon.y + 18, 280, 188, 0xffffff).setStrokeStyle(1, 0xd9d1c3);
    this.add.text(this.mon.x - 124, this.mon.y - 64, "You typed", this.font(13, "#6e675f"));
    this.monitorText = this.add.text(this.mon.x - 124, this.mon.y - 42, "", {
      fontFamily: "IBM Plex Mono, ui-monospace, monospace",
      fontSize: "18px",
      color: "#1c1915",
      fixedWidth: 248,
      lineSpacing: 6,
    });
    this.monFlash = this.add.rectangle(this.mon.x, this.mon.y, 320, 280, 0x1d6b66, 0);
  }

  drawKeys() {
    this.panel(this.kb.x, this.kb.y, 300, 88);
    this.add.text(this.kb.x - 132, this.kb.y - 30, "INPUT  ·  type 0, 1, or a letter", this.mono(11, "#6e675f"));
    const chips = ["0", "1", "J", "A–L"];
    chips.forEach((label, i) => {
      const x = this.kb.x - 90 + i * 62;
      const featured = label === "0" || label === "1" || label === "J";
      this.add.rectangle(x, this.kb.y + 14, 52, 28, featured ? 0xe7f3f1 : 0xf7f4ee).setStrokeStyle(1, featured ? 0x1d6b66 : 0xd9d1c3);
      this.add.text(x, this.kb.y + 14, label, this.mono(13, featured ? "#1d6b66" : "#6e675f")).setOrigin(0.5);
    });
  }

  drawHero() {
    const body = this.add.circle(0, 6, 16, 0x1d6b66);
    const visor = this.add.rectangle(0, -10, 22, 8, 0xc4a574);
    const tag = this.add.text(0, 6, "YOU", this.mono(9, "#fffcf7")).setOrigin(0.5);
    this.hero = this.add.container(90, 620, [body, visor, tag]);
  }

  drawHud() {
    this.add.rectangle(550, 44, 1100, 88, 0xfffcf7, 0.94);
    this.add.text(36, 16, "LEVEL 03", this.mono(11, "#1d6b66"));
    this.add.text(36, 36, "Key → bits → character", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "24px",
      color: "#1c1915",
    });
    this.objective = this.add.text(36, 68, "Click the J row in the table. Watch it travel to the pale target.", this.font(14, "#6e675f"));
    this.add.text(1064, 22, "Tab  map", this.mono(12, "#8d5a1a")).setOrigin(1, 0);
    this.add.text(1064, 44, "Esc menu", this.mono(12, "#6e675f")).setOrigin(1, 0);
  }

  drawBitTrack() {
    this.track = [];
    this.targetBar = this.add.rectangle(176, 114, 360, 32, 0xfffcf7, 0.4).setStrokeStyle(1, 0xe7e0d4);
    this.targetLabel = this.add.text(36, 108, "TARGET  J =", this.mono(12, "#cfc6b8"));
    for (let i = 0; i < 8; i++) {
      const x = 160 + i * 28;
      const box = this.add.rectangle(x, 114, 24, 24, 0xfffcf7).setStrokeStyle(1, 0xe7e0d4);
      const bit = this.add.text(x, 114, this.goal[i], this.mono(13, "#cfc6b8")).setOrigin(0.5);
      this.track.push({ box, bit });
    }
    this.targetNote = this.add.text(36, 138, "", this.font(14, "#1d6b66"));
  }

  liftJ() {
    if (this.lifting || this.targetLit) return;
    this.lifting = true;
    const row = this.romRows.J;
    row.bg.setFillStyle(0xf3e2c4);
    const token = this.add.container(this.rom.x + 28, row.y).setDepth(40);
    const plate = this.add.rectangle(0, 0, 176, 28, 0xfffcf7).setStrokeStyle(2, 0x1d6b66);
    const mark = this.add.text(-62, 0, "J", this.font(16, "#1c1915")).setOrigin(0.5);
    const bits = this.add.text(18, 0, row.bits, this.mono(13, "#1d6b66")).setOrigin(0.5);
    token.add([plate, mark, bits]);
    const destX = 160 + 3.5 * 28;
    this.tweens.add({
      targets: token,
      x: destX,
      y: 114,
      duration: 1400,
      ease: "Cubic.easeInOut",
      onComplete: () => {
        token.destroy();
        this.lightTarget();
      },
    });
  }

  lightTarget() {
    this.targetLit = true;
    this.lifting = false;
    this.targetBar.setFillStyle(0xe7f3f1, 1);
    this.targetBar.setStrokeStyle(2, 0x1d6b66);
    this.targetLabel.setColor("#1d6b66");
    this.track.forEach((slot) => {
      slot.box.setFillStyle(0xd7efe9);
      slot.box.setStrokeStyle(1, 0x1d6b66);
      slot.bit.setColor("#143f3c");
    });
    const row = this.romRows.J;
    row.bg.setFillStyle(0xe7f3f1);
    row.bg.setStrokeStyle(1, 0x1d6b66);
    row.label.setColor("#1d6b66");
    this.targetNote.setText("J is 01001010. Type those eight bits to prove you read the row.");
    this.objective.setColor("#1c1915");
    this.objective.setText("The row has reached the target. Now type 01001010.");
    this.sawJ = true;
  }

  pulse(rect) {
    rect.setFillStyle(0x1d6b66, 0.12);
    this.tweens.add({ targets: rect, fillAlpha: 0, duration: 260, ease: "Sine.easeOut" });
  }

  setBits(bits) {
    bits.split("").forEach((b, i) => {
      const cell = this.bitCells[i];
      if (!cell) return;
      this.time.delayedCall(i * 45, () => {
        cell.bit.setText(b);
        cell.bit.setColor(b === "1" ? "#1d6b66" : "#6e675f");
        cell.box.setStrokeStyle(1, b === "1" ? 0x1d6b66 : 0xd9d1c3);
        cell.box.setFillStyle(b === "1" ? 0xe7f3f1 : 0xf7f4ee);
      });
    });
  }

  highlightRom(ch) {
    Object.keys(this.romRows).forEach((key) => {
      const row = this.romRows[key];
      if (row.target) return;
      const on = key === ch;
      row.bg.setFillStyle(on ? 0xe7f3f1 : 0xfffcf7);
      row.label.setColor(on ? "#1d6b66" : "#6e675f");
    });
  }

  drawMapReturn() {
    const chip = this.add.rectangle(900, 108, 160, 28, 0xfffcf7).setStrokeStyle(1, 0x1d6b66).setInteractive({ useHandCursor: true }).setDepth(20);
    const label = this.add.text(900, 108, "←  the map", this.mono(12, "#1d6b66")).setOrigin(0.5).setDepth(21);
    chip.on("pointerdown", () => this.returnToMap());
    label.setInteractive({ useHandCursor: true });
    label.on("pointerdown", () => this.returnToMap());
    this.mapChip = chip;
  }

  revealFromMap() {
    const cover = this.add.rectangle(550, 360, 1200, 800, 0x16332f).setDepth(400);
    this.tweens.add({
      targets: cover,
      scaleX: 0.02,
      scaleY: 0.02,
      alpha: 0,
      duration: 1100,
      ease: "Cubic.easeInOut",
      onComplete: () => cover.destroy(),
    });
  }

  returnToMap() {
    if (this.leaving) return;
    this.leaving = true;
    const cover = this.add.rectangle(550, 360, 40, 40, 0x16332f).setStrokeStyle(3, 0xc4a574).setDepth(400);
    this.tweens.add({ targets: cover, scaleX: 40, scaleY: 28, duration: 1600, ease: "Cubic.easeInOut" });
    this.time.delayedCall(1600, () => this.scene.start("Level_02A_ThroughRAM"));
  }

  refreshMonitor() {
    const cursor = !this.completed && this.cursorOn ? "▌" : "";
    this.monitorText.setText(this.typedText + cursor);
  }

  refreshTrack() {
    if (!this.targetLit) return;
    const digits = this.typedText.replace(/[^01]/g, "");
    let n = 0;
    for (let i = 0; i < this.goal.length; i++) {
      if (digits.indexOf(this.goal.slice(0, i + 1)) !== -1) n = i + 1;
    }
    this.track.forEach((slot, i) => {
      const on = i < n;
      slot.box.setStrokeStyle(1, on ? 0x1d6b66 : 0xd9d1c3);
      slot.box.setFillStyle(on ? 0xb7e4da : 0xd7efe9);
      slot.bit.setColor(on ? "#143f3c" : "#1d6b66");
    });
  }

  onKey(e) {
    if (e.key === "Tab") {
      this.returnToMap();
      return;
    }

    if (e.key === "Escape") {
      if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }

    if (this.completed && (e.key === "4" || e.code === "Digit4")) {
      this.scene.start("Level_04_PC_Boot");
      return;
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Shift", "Control", "Alt", "Meta", "Tab", "Backspace", "Enter"].includes(e.key)) {
      return;
    }

    let char = "";
    if (e.key === " ") char = " ";
    else if (/^[a-zA-Z0-9]$/.test(e.key)) char = e.key.toUpperCase();
    if (!char) return;

    this.sendPacket(char);
  }

  sendPacket(char) {
    const bits = char.charCodeAt(0).toString(2).padStart(8, "0");
    const wrap = this.add.container(this.kb.x, this.kb.y - 20);
    const body = this.add.rectangle(0, 0, 30, 22, 0x1d6b66);
    const label = this.add.text(0, 0, char === " " ? "␣" : char, this.mono(12, "#fffcf7")).setOrigin(0.5);
    wrap.add([body, label]);
    this.particles.push(wrap);

    this.tweens.add({
      targets: wrap,
      x: this.cpu.x,
      y: this.cpu.y + 10,
      duration: 420,
      ease: "Cubic.easeInOut",
      onComplete: () => {
        this.pulse(this.cpuFlash);
        this.setBits(bits);
        this.decodeText.setText(
          "char " + (char === " " ? "␣" : char) + "   dec " + char.charCodeAt(0) + "   hex " + char.charCodeAt(0).toString(16).toUpperCase(),
        );
        label.setText(bits);
        body.setSize(88, 22);
        body.setFillStyle(0xc4a574);
        label.setColor("#1c1915");
        this.tweens.add({
          targets: wrap,
          x: this.rom.x + 40,
          y: this.romRows[char] ? this.romRows[char].y : this.rom.y,
          duration: 480,
          ease: "Cubic.easeInOut",
          onComplete: () => {
            this.highlightRom(char);
            this.tweens.add({
              targets: wrap,
              x: this.mon.x,
              y: this.mon.y,
              duration: 480,
              ease: "Cubic.easeInOut",
              onComplete: () => {
                this.land(char);
                this.pulse(this.monFlash);
                const pop = this.add.text(this.mon.x, this.mon.y - 20, char === " " ? "␣" : char, this.font(36, "#1c1915")).setOrigin(0.5);
                this.tweens.add({
                  targets: pop,
                  y: this.mon.y - 70,
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
      },
    });
  }

  land(char) {
    const shown = char === " " ? " " : char;
    this.typedText += shown;
    this.currentLineLength += 1;
    if (this.currentLineLength >= 18) {
      this.typedText += "\n";
      this.currentLineLength = 0;
    }
    this.refreshMonitor();
    this.refreshTrack();

    if (char === "J" && !this.targetLit) this.liftJ();

    this.checkComplete();
  }

  checkComplete() {
    if (this.completed) return;
    if (!this.typedText.replace(/\n/g, "").includes(this.goal)) return;
    this.completed = true;
    this.refreshMonitor();
    this.objective.setColor("#1e6b45");
    this.objective.setText("The bits were J all along. Press 4 for Level 04 — how those bits boot a machine.");
    this.add.text(550, 686, "Level 03 complete  ·  Press 4", this.mono(14, "#1e6b45")).setOrigin(0.5);
  }

  update() {
    const speed = 5.5;
    if (this.moveKeys.up.isDown) this.hero.y -= speed;
    if (this.moveKeys.down.isDown) this.hero.y += speed;
    if (this.moveKeys.left.isDown) this.hero.x -= speed;
    if (this.moveKeys.right.isDown) this.hero.x += speed;
    this.hero.x = Phaser.Math.Clamp(this.hero.x, 28, 1072);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, 110, 700);

    if (!this.tipShown && !this.completed && !this.targetLit && (this.time.now - this.startTime) / 1000 > 12) {
      this.tipShown = true;
      this.objective.setColor("#8d5a1a");
      this.objective.setText("The gold J row is clickable. Send it up to the pale target.");
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

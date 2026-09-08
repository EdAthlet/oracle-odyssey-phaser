class Level_04_PC_Boot extends Phaser.Scene {
  constructor() {
    super("Level_04_PC_Boot");
  }

  create() {
    this.powerOn = false;
    this.booting = false;
    this.completed = false;
    this.stageIndex = -1;
    this.packets = [];
    this.completeLabel = null;

    this.C = {
      bg: 0x07080c,
      surface: 0x12141a,
      border: 0x2a2e38,
      teal: 0x4a9a94,
      gold: 0xc4a574,
      success: 0x8fd4a8,
    };

    this.STAGES = [
      { id: "rails", title: "Power rails", note: "PSU raises 12 V / 5 V / 3.3 V." },
      { id: "reset", title: "Reset", note: "CPU is held, then released." },
      { id: "firmware", title: "Firmware", note: "First fetches come from flash ROM, not disk." },
      { id: "post", title: "POST", note: "Firmware tests RAM before it trusts it." },
      { id: "disk", title: "Boot device", note: "Firmware picks a disk." },
      { id: "loader", title: "Bootloader", note: "A tiny program from the first sector." },
      { id: "kernel", title: "Kernel", note: "OS core is copied into RAM." },
      { id: "run", title: "Running", note: "CPU now fetches from RAM. Display on." },
    ];

    this.cameras.main.setBackgroundColor(this.C.bg);
    this.drawGrid();

    this.moveKeys = this.input.keyboard.addKeys({
      up: "UP",
      down: "DOWN",
      left: "LEFT",
      right: "RIGHT",
    });

    this.board = { x: 620, y: 400, w: 720, h: 460 };
    this.psu = { x: 360, y: 560 };
    this.cpu = { x: 560, y: 250 };
    this.rom = { x: 720, y: 230 };
    this.ram = { x: 880, y: 280 };
    this.disk = { x: 560, y: 520 };
    this.display = { x: 900, y: 520 };
    this.sw = { x: 330, y: 250 };

    this.drawBoard();
    this.drawParts();
    this.drawSwitch();
    this.drawDisplay();
    this.drawHud();
    this.drawChecklist();
    this.drawHero();

    this.input.keyboard.on("keydown", (e) => this.onKey(e));
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

  chip(x, y, w, h, eyebrow, title) {
    const box = this.add.rectangle(x, y, w, h, this.C.surface).setStrokeStyle(1, this.C.border);
    this.add.rectangle(x, y - h / 2 + 1, w, 2, this.C.teal).setAlpha(0.45);
    this.add.text(x - w / 2 + 10, y - h / 2 + 10, eyebrow, this.mono(10, "#5c6170"));
    this.add.text(x - w / 2 + 10, y - h / 2 + 26, title, this.font(15, "#eceef2"));
    const flash = this.add.rectangle(x, y, w, h, 0x4a9a94, 0);
    return { box, flash, x, y, w, h };
  }

  drawBoard() {
    this.add.rectangle(this.board.x, this.board.y, this.board.w, this.board.h, 0x10131a).setStrokeStyle(1, 0x2a2e38);
    const g = this.add.graphics();
    g.lineStyle(2, 0x2d5e5a, 0.7);
    g.beginPath();
    g.moveTo(this.psu.x, this.psu.y - 50);
    g.lineTo(this.cpu.x - 70, this.cpu.y + 20);
    g.moveTo(this.cpu.x + 60, this.cpu.y);
    g.lineTo(this.rom.x - 50, this.rom.y);
    g.moveTo(this.cpu.x + 60, this.cpu.y + 20);
    g.lineTo(this.ram.x - 70, this.ram.y);
    g.moveTo(this.cpu.x, this.cpu.y + 50);
    g.lineTo(this.disk.x, this.disk.y - 55);
    g.moveTo(this.ram.x, this.ram.y + 70);
    g.lineTo(this.display.x - 20, this.display.y - 70);
    g.strokePath();
    this.add.text(280, 160, "MOTHERBOARD", this.mono(11, "#5c6170"));
  }

  drawParts() {
    this.partPsu = this.chip(this.psu.x, this.psu.y, 150, 110, "PSU", "Power");
    this.railText = this.add.text(this.psu.x - 58, this.psu.y + 8, "12V  off\n 5V  off\n3.3V off", this.mono(12, "#5c6170"));

    this.partCpu = this.chip(this.cpu.x, this.cpu.y, 150, 100, "EXECUTE", "CPU");
    this.cpuState = this.add.text(this.cpu.x - 58, this.cpu.y + 18, "halted", this.mono(13, "#5c6170"));

    this.partRom = this.chip(this.rom.x, this.rom.y, 140, 88, "FLASH", "Firmware");
    this.romState = this.add.text(this.rom.x - 52, this.rom.y + 16, "UEFI / BIOS", this.mono(12, "#8a8f9c"));

    this.partRam = this.chip(this.ram.x, this.ram.y, 160, 140, "MEMORY", "RAM");
    this.dimms = [];
    for (let i = 0; i < 3; i++) {
      const y = this.ram.y - 8 + i * 28;
      const bar = this.add.rectangle(this.ram.x + 18, y, 88, 18, 0x1a1d26).setStrokeStyle(1, 0x2a2e38);
      const lab = this.add.text(this.ram.x - 62, y - 6, "DIMM " + (i + 1), this.mono(10, "#5c6170"));
      this.dimms.push({ bar, lab });
    }

    this.partDisk = this.chip(this.disk.x, this.disk.y, 170, 110, "STORAGE", "Disk");
    this.diskState = this.add.text(this.disk.x - 68, this.disk.y + 10, "kernel · shell", this.mono(12, "#8a8f9c"));
  }

  drawSwitch() {
    this.chip(this.sw.x, this.sw.y, 110, 88, "POWER", "Switch");
    this.knob = this.add.rectangle(this.sw.x, this.sw.y + 14, 48, 22, 0x5c3a3a).setStrokeStyle(1, 0xc45c5c);
    this.knob.setInteractive({ useHandCursor: true });
    this.knob.on("pointerdown", () => this.togglePower());
    this.swHint = this.add.text(this.sw.x, this.sw.y + 38, "Space", this.mono(10, "#5c6170")).setOrigin(0.5);
  }

  drawDisplay() {
    this.partDisp = this.chip(this.display.x, this.display.y, 180, 140, "OUTPUT", "Display");
    this.screen = this.add.rectangle(this.display.x, this.display.y + 18, 148, 78, 0x0b0d12).setStrokeStyle(1, 0x2a2e38);
    this.screenText = this.add.text(this.display.x, this.display.y + 18, "", this.mono(12, "#5c6170")).setOrigin(0.5);
  }

  drawHud() {
    this.add.rectangle(550, 44, 1100, 88, 0x07080c, 0.92);
    this.add.text(36, 16, "LEVEL 04", this.mono(11, "#4a9a94"));
    this.add.text(36, 36, "Schematic boot", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "24px",
      color: "#eceef2",
    });
    this.objective = this.add.text(
      36,
      68,
      "Flip the power switch. Follow rails → firmware → disk → RAM.",
      this.font(14, "#8a8f9c"),
    );
    this.add.text(1064, 22, "Esc menu", this.mono(12, "#5c6170")).setOrigin(1, 0);
    this.add.text(1064, 44, "Arrows walk", this.mono(12, "#5c6170")).setOrigin(1, 0);
  }

  drawChecklist() {
    this.checks = [];
    this.STAGES.forEach((stage, i) => {
      const y = 118 + i * 22;
      const mark = this.add.text(36, y, "○", this.mono(12, "#5c6170"));
      const lab = this.add.text(56, y, i + 1 + "  " + stage.title, this.mono(12, "#5c6170"));
      this.checks.push({ mark, lab });
    });
  }

  drawHero() {
    const body = this.add.circle(0, 6, 16, 0x4a9a94);
    const visor = this.add.rectangle(0, -10, 22, 8, 0xc4a574);
    const tag = this.add.text(0, 6, "YOU", this.mono(9, "#07080c")).setOrigin(0.5);
    this.hero = this.add.container(200, 250, [body, visor, tag]);
  }

  pulse(rect) {
    rect.setFillStyle(0x4a9a94, 0.22);
    this.tweens.add({ targets: rect, fillAlpha: 0, duration: 320, ease: "Sine.easeOut" });
  }

  nearSwitch() {
    return Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.sw.x, this.sw.y) < 70;
  }

  onKey(e) {
    if (e.key === "Escape") {
      if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }
    if (e.key === " " || e.code === "Space") {
      e.preventDefault?.();
      this.togglePower();
      return;
    }
    if (this.completed && (e.key === "5" || e.code === "Digit5")) {
      this.scene.start("Level_04_1_BinaryThroughLogicGates");
    }
  }

  togglePower() {
    if (this.powerOn) {
      this.powerOn = false;
      this.resetBoard();
      return;
    }
    this.powerOn = true;
    this.knob.setFillStyle(0x2d5e5a);
    this.knob.setStrokeStyle(1, 0x4a9a94);
    this.booting = true;
    this.stageIndex = -1;
    this.nextStage();
  }

  resetBoard() {
    this.booting = false;
    this.completed = false;
    this.stageIndex = -1;
    this.knob.setFillStyle(0x5c3a3a);
    this.knob.setStrokeStyle(1, 0xc45c5c);
    this.railText.setText("12V  off\n 5V  off\n3.3V off").setColor("#5c6170");
    this.cpuState.setText("halted").setColor("#5c6170");
    this.screenText.setText("");
    this.screen.setFillStyle(0x0b0d12);
    this.dimms.forEach((d) => {
      d.bar.setFillStyle(0x1a1d26);
      d.lab.setColor("#5c6170");
    });
    this.checks.forEach((c) => {
      c.mark.setText("○").setColor("#5c6170");
      c.lab.setColor("#5c6170");
    });
    this.packets.forEach((p) => p.destroy());
    this.packets = [];
    if (this.completeLabel) {
      this.completeLabel.destroy();
      this.completeLabel = null;
    }
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.objective.setColor("#8a8f9c");
    this.objective.setText("Flip the power switch. Follow rails → firmware → disk → RAM.");
  }

  markStage(i) {
    this.checks.forEach((c, n) => {
      if (n < i) {
        c.mark.setText("●").setColor("#8fd4a8");
        c.lab.setColor("#8fd4a8");
      } else if (n === i) {
        c.mark.setText("●").setColor("#7dfff0");
        c.lab.setColor("#eceef2");
      }
    });
  }

  send(label, from, to, color, done) {
    const wrap = this.add.container(from.x, from.y);
    const body = this.add.rectangle(0, 0, Math.max(48, label.length * 8 + 16), 20, color);
    const text = this.add.text(0, 0, label, this.mono(10, "#07080c")).setOrigin(0.5);
    wrap.add([body, text]);
    this.packets.push(wrap);
    this.tweens.add({
      targets: wrap,
      x: to.x,
      y: to.y,
      duration: 520,
      ease: "Cubic.easeInOut",
      onComplete: () => {
        wrap.destroy();
        const i = this.packets.indexOf(wrap);
        if (i > -1) this.packets.splice(i, 1);
        if (done) done();
      },
    });
  }

  nextStage() {
    if (!this.powerOn) return;
    this.stageIndex += 1;
    const stage = this.STAGES[this.stageIndex];
    if (!stage) return;
    this.markStage(this.stageIndex);
    this.objective.setColor("#eceef2");
    this.objective.setText(stage.title + " — " + stage.note);

    const after = (fn) => this.time.delayedCall(280, fn);

    if (stage.id === "rails") {
      this.pulse(this.partPsu.flash);
      this.railText.setText("12V  on\n 5V  on\n3.3V on").setColor("#8fd4a8");
      this.send("12V", this.psu, this.cpu, 0x4a9a94, () => after(() => this.nextStage()));
    } else if (stage.id === "reset") {
      this.pulse(this.partCpu.flash);
      this.cpuState.setText("reset").setColor("#c4a574");
      after(() => this.nextStage());
    } else if (stage.id === "firmware") {
      this.pulse(this.partRom.flash);
      this.send("UEFI", this.rom, this.cpu, 0xc4a574, () => {
        this.cpuState.setText("firmware").setColor("#7dfff0");
        after(() => this.nextStage());
      });
    } else if (stage.id === "post") {
      this.pulse(this.partRam.flash);
      this.dimms.forEach((d, i) => {
        this.time.delayedCall(i * 180, () => {
          d.bar.setFillStyle(0x16332f);
          d.lab.setColor("#8fd4a8");
        });
      });
      this.send("POST", this.cpu, this.ram, 0x4a9a94, () => after(() => this.nextStage()));
    } else if (stage.id === "disk") {
      this.pulse(this.partDisk.flash);
      this.send("boot?", this.cpu, this.disk, 0xc4a574, () => after(() => this.nextStage()));
    } else if (stage.id === "loader") {
      this.send("LDR", this.disk, this.ram, 0x4a9a94, () => after(() => this.nextStage()));
    } else if (stage.id === "kernel") {
      this.send("KERNEL", this.disk, this.ram, 0x8fd4a8, () => {
        this.send("SHELL", this.disk, this.ram, 0xc4a574, () => after(() => this.nextStage()));
      });
    } else if (stage.id === "run") {
      this.cpuState.setText("fetch RAM").setColor("#8fd4a8");
      this.pulse(this.partCpu.flash);
      this.send("RUN", this.ram, this.cpu, 0x8fd4a8, () => {
        this.screen.setFillStyle(0xf4f1ea);
        this.screenText.setText("desktop").setColor("#1a1d26");
        this.pulse(this.partDisp.flash);
        this.finish();
      });
    }
  }

  finish() {
    this.booting = false;
    this.completed = true;
    this.checks.forEach((c) => {
      c.mark.setText("●").setColor("#8fd4a8");
      c.lab.setColor("#8fd4a8");
    });
    this.objective.setColor("#8fd4a8");
    this.objective.setText("The machine runs from RAM now. Press 5 to walk the boot from the inside.");
    this.completeLabel = this.add.text(550, 686, "Level 04 complete  ·  Press 5  ·  Space to power off", this.mono(13, "#8fd4a8")).setOrigin(0.5);
  }

  update() {
    const speed = 5.5;
    if (this.moveKeys.up.isDown) this.hero.y -= speed;
    if (this.moveKeys.down.isDown) this.hero.y += speed;
    if (this.moveKeys.left.isDown) this.hero.x -= speed;
    if (this.moveKeys.right.isDown) this.hero.x += speed;
    this.hero.x = Phaser.Math.Clamp(this.hero.x, 28, 1072);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, 110, 700);
    if (this.nearSwitch()) this.swHint.setColor("#c4a574");
    else this.swHint.setColor("#5c6170");
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.packets.forEach((p) => p.destroy());
    this.packets = [];
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

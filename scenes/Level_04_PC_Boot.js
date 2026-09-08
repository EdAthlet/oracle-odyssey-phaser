class Level_04_PC_Boot extends Phaser.Scene {
  constructor() {
    super("Level_04_PC_Boot");
  }

  create() {
    this.powerOn = false;
    this.completed = false;
    this.stageIndex = -1;
    this.phase = "idle";
    this.autoPlay = false;
    this.packets = [];
    this.completeLabel = null;
    this.MOVE_MS = 1400;
    this.AUTO_PAUSE_MS = 2600;

    this.C = {
      bg: 0x07080c,
      surface: 0x12141a,
      border: 0x2a2e38,
      teal: 0x4a9a94,
      gold: 0xc4a574,
      success: 0x8fd4a8,
    };

    this.STAGES = [
      {
        id: "rails",
        title: "1  Power rails",
        explain:
          "The power supply is the adapter. It turns wall electricity into the small voltages chips can use (12 V, 5 V, 3.3 V). Until those rails are up, nothing on the board can work.",
      },
      {
        id: "reset",
        title: "2  Reset",
        explain:
          "The CPU is the brain. We hold it still (reset) so it does not wake up in the middle of an old thought. Then we let go, and it looks for its very first instruction.",
      },
      {
        id: "firmware",
        title: "3  Firmware",
        explain:
          "That first instruction is not on the disk. It lives in a small flash chip that keeps its memory when the computer is off — firmware (BIOS or UEFI). Think of a start-up booklet glued inside the machine.",
      },
      {
        id: "post",
        title: "4  POST — test the memory",
        explain:
          "RAM is the desk: fast, but it forgets when power dies. Firmware writes and reads it first (Power-On Self Test). If the desk is broken, we refuse to boot.",
      },
      {
        id: "disk",
        title: "5  Find the boot disk",
        explain:
          "The disk is the cupboard. It is slower than RAM, but it remembers with the power off. Firmware now asks: which cupboard has a program that can start the computer?",
      },
      {
        id: "loader",
        title: "6  Bootloader",
        explain:
          "The first tiny program on that disk is the bootloader. It is only smart enough to find the real operating system and copy it onto the desk.",
      },
      {
        id: "kernel",
        title: "7  Kernel into RAM",
        explain:
          "The kernel is the core of the operating system. We copy it from the cupboard (disk) onto the desk (RAM) so the CPU can work with it quickly. A shell/desktop can follow.",
      },
      {
        id: "run",
        title: "8  The computer is running",
        explain:
          "The CPU now reads instructions from RAM, not from firmware. The screen lights up. This is 'booting': the machine has pulled itself up and is ready for programs.",
      },
    ];

    this.cameras.main.setBackgroundColor(this.C.bg);
    this.drawGrid();

    this.moveKeys = this.input.keyboard.addKeys({
      up: "UP",
      down: "DOWN",
      left: "LEFT",
      right: "RIGHT",
    });

    this.board = { x: 620, y: 410, w: 720, h: 430 };
    this.psu = { x: 360, y: 570 };
    this.cpu = { x: 560, y: 270 };
    this.rom = { x: 720, y: 250 };
    this.ram = { x: 880, y: 300 };
    this.disk = { x: 560, y: 530 };
    this.display = { x: 900, y: 530 };
    this.sw = { x: 330, y: 270 };

    this.drawBoard();
    this.drawParts();
    this.drawSwitch();
    this.drawDisplay();
    this.drawHud();
    this.drawChecklist();
    this.drawHero();
    this.setExplain("Flip power (P, or click the switch). Then N for one step, or A to watch the whole boot.");

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
    this.add.text(280, 178, "MOTHERBOARD", this.mono(11, "#5c6170"));
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
    this.swHint = this.add.text(this.sw.x, this.sw.y + 38, "P", this.mono(10, "#5c6170")).setOrigin(0.5);
  }

  drawDisplay() {
    this.partDisp = this.chip(this.display.x, this.display.y, 180, 140, "OUTPUT", "Display");
    this.screen = this.add.rectangle(this.display.x, this.display.y + 18, 148, 78, 0x0b0d12).setStrokeStyle(1, 0x2a2e38);
    this.screenText = this.add.text(this.display.x, this.display.y + 18, "", this.mono(12, "#5c6170")).setOrigin(0.5);
  }

  drawHud() {
    this.add.rectangle(550, 52, 1100, 104, 0x07080c, 0.94);
    this.add.text(36, 12, "LEVEL 04", this.mono(11, "#4a9a94"));
    this.add.text(36, 30, "Schematic boot", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "22px",
      color: "#eceef2",
    });
    this.explain = this.add.text(36, 58, "", {
      fontFamily: "IBM Plex Sans, Segoe UI, sans-serif",
      fontSize: "14px",
      color: "#8a8f9c",
      wordWrap: { width: 820 },
      lineSpacing: 3,
    });
    this.prompt = this.add.text(36, 98, "P power   ·   N / Enter / Space  next step   ·   A  play all", this.mono(12, "#5c6170"));
    this.add.text(1064, 16, "Esc menu", this.mono(12, "#5c6170")).setOrigin(1, 0);
    this.add.text(1064, 36, "Arrows walk", this.mono(12, "#5c6170")).setOrigin(1, 0);
  }

  drawChecklist() {
    this.checks = [];
    this.STAGES.forEach((stage, i) => {
      const y = 128 + i * 20;
      const mark = this.add.text(36, y, "○", this.mono(11, "#5c6170"));
      const lab = this.add.text(56, y, stage.title, this.mono(11, "#5c6170"));
      this.checks.push({ mark, lab });
    });
  }

  drawHero() {
    const body = this.add.circle(0, 6, 16, 0x4a9a94);
    const visor = this.add.rectangle(0, -10, 22, 8, 0xc4a574);
    const tag = this.add.text(0, 6, "YOU", this.mono(9, "#07080c")).setOrigin(0.5);
    this.hero = this.add.container(200, 270, [body, visor, tag]);
  }

  setExplain(text, tone) {
    const colors = { mute: "#8a8f9c", teach: "#eceef2", wait: "#c4a574", ok: "#8fd4a8" };
    this.explain.setColor(colors[tone] || colors.teach);
    this.explain.setText(text);
  }

  setPrompt(text) {
    this.prompt.setText(text);
  }

  pulse(rect) {
    rect.setFillStyle(0x4a9a94, 0.22);
    this.tweens.add({ targets: rect, fillAlpha: 0, duration: 420, ease: "Sine.easeOut" });
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
    if (e.key === "p" || e.key === "P") {
      this.togglePower();
      return;
    }
    if (this.completed && (e.key === "5" || e.code === "Digit5")) {
      this.scene.start("Level_04_1_BinaryThroughLogicGates");
      return;
    }
    if (e.key === "a" || e.key === "A") {
      this.startAuto();
      return;
    }
    const next = e.key === "n" || e.key === "N" || e.key === "Enter" || e.key === " " || e.code === "Space";
    if (next) {
      e.preventDefault?.();
      if (!this.powerOn) {
        this.togglePower();
        return;
      }
      this.requestNext();
    }
  }

  startAuto() {
    if (this.completed) return;
    if (!this.powerOn) this.togglePower();
    this.autoPlay = true;
    this.setPrompt("Playing all steps  ·  P to stop");
    if (this.phase === "idle" || this.phase === "waiting") this.requestNext();
  }

  requestNext() {
    if (!this.powerOn || this.completed) return;
    if (this.phase === "moving") return;
    this.playStage();
  }

  togglePower() {
    if (this.powerOn) {
      this.powerOn = false;
      this.resetBoard();
      return;
    }
    this.powerOn = true;
    this.autoPlay = false;
    this.knob.setFillStyle(0x2d5e5a);
    this.knob.setStrokeStyle(1, 0x4a9a94);
    this.phase = "waiting";
    this.stageIndex = -1;
    this.setExplain(
      "Power is on, but the computer has not started thinking yet. Press N for the first step. Press A to play the whole boot without stopping.",
      "wait",
    );
    this.setPrompt("N / Enter / Space  next step   ·   A  play all   ·   P  power off");
  }

  resetBoard() {
    this.phase = "idle";
    this.autoPlay = false;
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
    this.setExplain("Flip power (P, or click the switch). Then N for one step, or A to watch the whole boot.", "mute");
    this.setPrompt("P power   ·   N / Enter / Space  next step   ·   A  play all");
  }

  markStage(i) {
    this.checks.forEach((c, n) => {
      if (n < i) {
        c.mark.setText("●").setColor("#8fd4a8");
        c.lab.setColor("#8fd4a8");
      } else if (n === i) {
        c.mark.setText("●").setColor("#7dfff0");
        c.lab.setColor("#eceef2");
      } else {
        c.mark.setText("○").setColor("#5c6170");
        c.lab.setColor("#5c6170");
      }
    });
  }

  send(label, from, to, color, done) {
    const wrap = this.add.container(from.x, from.y);
    const body = this.add.rectangle(0, 0, Math.max(52, label.length * 8 + 18), 22, color);
    const text = this.add.text(0, 0, label, this.mono(11, "#07080c")).setOrigin(0.5);
    wrap.add([body, text]);
    this.packets.push(wrap);
    this.tweens.add({
      targets: wrap,
      x: to.x,
      y: to.y,
      duration: this.MOVE_MS,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.time.delayedCall(400, () => {
          wrap.destroy();
          const i = this.packets.indexOf(wrap);
          if (i > -1) this.packets.splice(i, 1);
          if (done) done();
        });
      },
    });
  }

  arrived(stage) {
    this.phase = "waiting";
    this.setExplain(stage.explain, "teach");
    if (stage.id === "run") {
      this.time.delayedCall(this.autoPlay ? this.AUTO_PAUSE_MS : 900, () => {
        if (this.powerOn) this.finish();
      });
      return;
    }
    if (this.autoPlay) {
      this.setPrompt("Playing all steps  ·  P to stop");
      this.time.delayedCall(this.AUTO_PAUSE_MS, () => {
        if (this.autoPlay && this.powerOn && !this.completed) this.playStage();
      });
    } else {
      this.setPrompt("Read the step, then N / Enter / Space  ·  A  play the rest");
    }
  }

  playStage() {
    if (!this.powerOn || this.completed || this.phase === "moving") return;
    this.stageIndex += 1;
    const stage = this.STAGES[this.stageIndex];
    if (!stage) {
      this.finish();
      return;
    }
    this.phase = "moving";
    this.markStage(this.stageIndex);
    this.setExplain("Watch the box: " + stage.title, "wait");
    this.setPrompt("Moving…");

    if (stage.id === "rails") {
      this.pulse(this.partPsu.flash);
      this.railText.setText("12V  on\n 5V  on\n3.3V on").setColor("#8fd4a8");
      this.send("power", this.psu, this.cpu, 0x4a9a94, () => this.arrived(stage));
    } else if (stage.id === "reset") {
      this.pulse(this.partCpu.flash);
      this.cpuState.setText("reset").setColor("#c4a574");
      this.send("RESET", this.psu, this.cpu, 0xc4a574, () => this.arrived(stage));
    } else if (stage.id === "firmware") {
      this.pulse(this.partRom.flash);
      this.send("UEFI", this.rom, this.cpu, 0xc4a574, () => {
        this.cpuState.setText("firmware").setColor("#7dfff0");
        this.arrived(stage);
      });
    } else if (stage.id === "post") {
      this.pulse(this.partRam.flash);
      this.dimms.forEach((d, i) => {
        this.time.delayedCall(400 + i * 350, () => {
          d.bar.setFillStyle(0x16332f);
          d.lab.setColor("#8fd4a8");
        });
      });
      this.send("POST", this.cpu, this.ram, 0x4a9a94, () => this.arrived(stage));
    } else if (stage.id === "disk") {
      this.pulse(this.partDisk.flash);
      this.send("boot?", this.cpu, this.disk, 0xc4a574, () => this.arrived(stage));
    } else if (stage.id === "loader") {
      this.send("LDR", this.disk, this.ram, 0x4a9a94, () => this.arrived(stage));
    } else if (stage.id === "kernel") {
      this.send("KERNEL", this.disk, this.ram, 0x8fd4a8, () => {
        this.send("SHELL", this.disk, this.ram, 0xc4a574, () => this.arrived(stage));
      });
    } else if (stage.id === "run") {
      this.cpuState.setText("fetch RAM").setColor("#8fd4a8");
      this.pulse(this.partCpu.flash);
      this.send("RUN", this.ram, this.cpu, 0x8fd4a8, () => {
        this.send("PICTURE", this.cpu, this.display, 0x8fd4a8, () => {
          this.screen.setFillStyle(0xf4f1ea);
          this.screenText.setText("desktop").setColor("#1a1d26");
          this.pulse(this.partDisp.flash);
          this.arrived(stage);
        });
      });
    }
  }

  finish() {
    if (this.completed) return;
    this.phase = "done";
    this.autoPlay = false;
    this.completed = true;
    this.checks.forEach((c) => {
      c.mark.setText("●").setColor("#8fd4a8");
      c.lab.setColor("#8fd4a8");
    });
    this.setExplain("The machine now runs from RAM. Press 5 to walk this same boot from the inside, as the instruction pointer.", "ok");
    this.setPrompt("5  inside the boot   ·   P  power off and replay");
    this.completeLabel = this.add
      .text(550, 692, "Level 04 complete  ·  Press 5", this.mono(13, "#8fd4a8"))
      .setOrigin(0.5);
  }

  update() {
    const speed = 5.5;
    if (this.moveKeys.up.isDown) this.hero.y -= speed;
    if (this.moveKeys.down.isDown) this.hero.y += speed;
    if (this.moveKeys.left.isDown) this.hero.x -= speed;
    if (this.moveKeys.right.isDown) this.hero.x += speed;
    this.hero.x = Phaser.Math.Clamp(this.hero.x, 28, 1072);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, 120, 700);
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

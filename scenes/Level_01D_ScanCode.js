class Level_01D_ScanCode extends Phaser.Scene {
  constructor() {
    super("Level_01D_ScanCode");
  }

  create() {
    this.busy = false;
    this.cameras.main.setBackgroundColor("#efe6d6");
    this.drawGrid();
    this.drawBoard();
    this.drawKeyboard();
    this.drawCable();
    this.drawChips();
    this.drawHud();
    this.drawBack();
    this.drawMembers();
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
    g.lineStyle(1, 0xe4d8c6, 1);
    for (let x = 40; x < 1100; x += 40) g.lineBetween(x, 0, x, 720);
    for (let y = 40; y < 720; y += 40) g.lineBetween(0, y, 1100, y);
  }

  drawBoard() {
    this.add.rectangle(700, 420, 740, 460, 0xd7e0d2).setStrokeStyle(2, 0x8fa094);
    this.add.text(350, 210, "MOTHERBOARD", this.mono(11, "#5c6b5e"));
  }

  drawKeyboard() {
    this.add.rectangle(160, 430, 230, 150, 0xfffcf7).setStrokeStyle(1, 0xd9d1c3);
    this.add.text(60, 372, "KEYBOARD", this.mono(11, "#6e675f"));
    this.add.text(60, 392, "The scan code is made here.", this.font(14, "#1c1915"));
    this.keycap = this.add.rectangle(160, 470, 72, 44, 0xe7f3f1).setStrokeStyle(2, 0x1d6b66).setInteractive({ useHandCursor: true });
    this.keyLabel = this.add.text(160, 470, "press", this.mono(13, "#1d6b66")).setOrigin(0.5);
    this.keycap.on("pointerdown", () => this.pressKey());
    this.keyLabel.setInteractive({ useHandCursor: true });
    this.keyLabel.on("pointerdown", () => this.pressKey());
  }

  drawCable() {
    const g = this.add.graphics();
    g.lineStyle(8, 0x5c5348, 1);
    g.beginPath();
    g.moveTo(275, 430);
    g.lineTo(400, 400);
    g.strokePath();
    this.add.text(300, 396, "cable", this.mono(11, "#6e675f"));
  }

  drawChips() {
    this.kc = this.add.rectangle(470, 400, 200, 140, 0xfffcf7).setStrokeStyle(2, 0x1d6b66);
    this.add.text(386, 352, "KEYBOARD\nCONTROLLER", this.mono(12, "#1c1915"));
    this.add.text(548, 452, "chip", this.mono(10, "#1d6b66")).setOrigin(1, 0.5);
    this.held = this.add.text(386, 410, "", this.font(14, "#8d2a1a"));

    const g = this.add.graphics();
    g.lineStyle(2, 0x8d5a1a, 1);
    g.beginPath();
    g.moveTo(575, 380);
    g.lineTo(640, 380);
    g.moveTo(790, 400);
    g.lineTo(860, 400);
    g.strokePath();
    this.add.text(590, 352, "line 1", this.mono(11, "#8d5a1a"));
    this.add.text(800, 372, "number", this.mono(11, "#8d5a1a"));

    this.ic = this.add.rectangle(720, 400, 200, 150, 0xf6e6cf).setStrokeStyle(2, 0x8d5a1a);
    this.add.text(636, 348, "INTERRUPT\nCONTROLLER", this.mono(12, "#8d5a1a"));
    this.add.text(798, 456, "chip", this.mono(10, "#8d5a1a")).setOrigin(1, 0.5);
    this.icLine = this.add.text(636, 408, "", this.font(14, "#1c1915"));
    this.icLine.setWordWrapWidth(170);

    this.cpu = this.add.rectangle(960, 400, 190, 150, 0xfffcf7).setStrokeStyle(1, 0xd9d1c3);
    this.add.rectangle(960, 326, 190, 2, 0x1d6b66);
    this.add.text(880, 340, "CPU", this.mono(11, "#6e675f"));
    this.add.text(1034, 456, "chip", this.mono(10, "#6e675f")).setOrigin(1, 0.5);
    this.cpuLine = this.add.text(880, 380, "", this.font(14, "#8d2a1a"));
    this.cpuLine.setWordWrapWidth(160);
  }

  drawHud() {
    this.add.rectangle(550, 42, 1100, 84, 0xfffcf7, 0.94);
    this.add.text(36, 14, "LEVEL 01D", this.mono(11, "#1d6b66"));
    this.add.text(36, 32, "The scan code sits in the keyboard controller", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "22px",
      color: "#1c1915",
    });
    this.objective = this.add.text(36, 62, "Press the key. The scan code is made in the keyboard, then it waits in the keyboard controller chip.", this.font(14, "#6e675f"));
    this.objective.setWordWrapWidth(820);
  }

  drawBack() {
    const chip = this.add.rectangle(990, 28, 120, 28, 0xfffcf7).setStrokeStyle(1, 0x1d6b66).setInteractive({ useHandCursor: true }).setDepth(20);
    const label = this.add.text(990, 28, "←  menu", this.mono(12, "#1d6b66")).setOrigin(0.5).setDepth(21);
    chip.on("pointerdown", () => this.scene.start("MenuScene"));
    label.setInteractive({ useHandCursor: true });
    label.on("pointerdown", () => this.scene.start("MenuScene"));
  }

  drawMembers() {
    this.add.text(550, 698, "keyboard   ·   keyboard controller   ·   interrupt controller   ·   CPU", this.mono(11, "#6e675f")).setOrigin(0.5);
  }

  onKey(e) {
    if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape" && window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
    this.pressKey();
  }

  pressKey() {
    if (this.busy) return;
    this.busy = true;
    this.held.setText("");
    this.icLine.setText("");
    this.cpuLine.setText("");
    this.tweens.add({ targets: this.keycap, y: 474, duration: 80, yoyo: true });
    const code = this.add.text(200, 430, "scan code", this.font(15, "#8d2a1a")).setOrigin(0.5).setDepth(20);
    this.tweens.add({
      targets: code,
      x: 470,
      y: 430,
      duration: 1100,
      ease: "Sine.easeInOut",
      onComplete: () => {
        code.destroy();
        this.held.setText("scan code sits here");
        this.kc.setFillStyle(0xf8e4dc);
        this.time.delayedCall(900, () => this.raiseLine());
      },
    });
  }

  raiseLine() {
    const shout = this.add.text(520, 360, "line 1", this.font(16, "#8d2a1a")).setOrigin(0.5).setDepth(20);
    this.tweens.add({
      targets: shout,
      x: 720,
      y: 360,
      duration: 1000,
      ease: "Sine.easeInOut",
      onComplete: () => {
        shout.destroy();
        this.ic.setFillStyle(0xf3d7b0);
        this.icLine.setText("I hear line 1!");
        this.time.delayedCall(1100, () => this.sendNumber());
      },
    });
  }

  sendNumber() {
    const note = this.add.text(760, 400, "this is the interrupt number!", this.font(15, "#8d2a1a")).setOrigin(0, 0.5).setDepth(20);
    this.tweens.add({
      targets: note,
      x: 880,
      y: 400,
      duration: 1200,
      ease: "Sine.easeInOut",
      onComplete: () => {
        note.destroy();
        this.cpu.setFillStyle(0xf8e4dc);
        this.cpuLine.setText("this is the interrupt number!");
        this.objective.setColor("#1c1915");
        this.objective.setText("The scan code never left the keyboard controller. Only line 1, then the interrupt number, went on.");
        this.busy = false;
      },
    });
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

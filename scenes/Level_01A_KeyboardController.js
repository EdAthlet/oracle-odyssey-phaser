class Level_01A_KeyboardController extends Phaser.Scene {
  constructor() {
    super("Level_01A_KeyboardController");
  }

  create() {
    this.busy = false;
    this.leaving = false;
    this.phrase = "I am a piece of hardware on the motherboard. Interrupt now!!!";

    this.cameras.main.setBackgroundColor("#efe6d6");
    this.drawGrid();
    this.drawBoard();
    this.drawKeyboard();
    this.drawCable();
    this.drawController();
    this.drawTrace();
    this.drawDisplay();
    this.drawHud();
    this.drawBack();

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
    this.add.rectangle(760, 390, 560, 460, 0xd7e0d2).setStrokeStyle(2, 0x8fa094);
    this.add.text(500, 180, "MOTHERBOARD", this.mono(11, "#5c6b5e"));
    this.add.circle(520, 210, 4, 0xc4b59a);
    this.add.circle(980, 560, 4, 0xc4b59a);
    this.add.circle(560, 560, 4, 0xc4b59a);
  }

  drawKeyboard() {
    this.add.rectangle(168, 430, 250, 150, 0xfffcf7).setStrokeStyle(1, 0xd9d1c3);
    this.add.rectangle(168, 356, 250, 2, 0x1d6b66);
    this.add.text(58, 372, "KEYBOARD", this.mono(11, "#6e675f"));
    this.add.text(58, 390, "Outside the board", this.font(16, "#1c1915"));
    this.keycap = this.add.rectangle(168, 470, 72, 48, 0xe7f3f1).setStrokeStyle(2, 0x1d6b66).setInteractive({ useHandCursor: true });
    this.keyLabel = this.add.text(168, 470, "press", this.mono(13, "#1d6b66")).setOrigin(0.5);
    this.keycap.on("pointerdown", () => this.pressKey());
    this.keyLabel.setInteractive({ useHandCursor: true });
    this.keyLabel.on("pointerdown", () => this.pressKey());
  }

  drawCable() {
    const g = this.add.graphics();
    g.lineStyle(8, 0x5c5348, 1);
    g.beginPath();
    g.moveTo(250, 430);
    g.lineTo(430, 400);
    g.lineTo(560, 360);
    g.strokePath();
    this.add.text(300, 360, "cable", this.mono(11, "#6e675f"));
  }

  drawController() {
    this.chip = this.add.rectangle(640, 360, 150, 88, 0xfffcf7).setStrokeStyle(2, 0x1d6b66);
    this.add.text(640, 338, "KEYBOARD\nCONTROLLER", this.mono(12, "#1c1915")).setOrigin(0.5).setAlign("center");
    this.shout = this.add.text(640, 418, "", this.font(13, "#8d2a1a")).setOrigin(0.5);
    this.shout.setWordWrapWidth(220);
  }

  drawTrace() {
    this.route = [
      { x: 730, y: 360 },
      { x: 860, y: 360 },
      { x: 940, y: 250 },
      { x: 990, y: 156 },
    ];
    const g = this.add.graphics();
    g.lineStyle(2, 0x8d5a1a, 1);
    g.beginPath();
    g.moveTo(715, 360);
    this.route.forEach((p) => g.lineTo(p.x, p.y));
    g.strokePath();
    this.add.text(760, 338, "interrupt line", this.mono(11, "#8d5a1a"));
  }

  drawDisplay() {
    this.add.rectangle(990, 168, 190, 150, 0xfffcf7).setStrokeStyle(1, 0xd9d1c3);
    this.add.text(908, 104, "CPU", this.mono(11, "#6e675f"));
    this.screen = this.add.text(908, 124, "", this.font(13, "#1c1915"));
    this.screen.setWordWrapWidth(164);
    this.cpuBox = this.add.rectangle(990, 168, 190, 150, 0xfffcf7, 0);
    this.cpuHint = this.add.text(990, 252, "", this.mono(12, "#8d5a1a")).setOrigin(0.5);
  }

  drawHud() {
    this.add.rectangle(550, 42, 1100, 84, 0xfffcf7, 0.94);
    this.add.text(36, 14, "LEVEL 01A", this.mono(11, "#1d6b66"));
    this.add.text(36, 32, "The controller shouts", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "24px",
      color: "#1c1915",
    });
    this.objective = this.add.text(
      36,
      62,
      "Press the key. The cable carries a signal. The controller is hardware, and it shouts an interrupt along the thin line.",
      this.font(14, "#6e675f"),
    );
    this.objective.setWordWrapWidth(820);
  }

  drawBack() {
    const chip = this.add.rectangle(980, 28, 150, 28, 0xfffcf7).setStrokeStyle(1, 0x1d6b66).setInteractive({ useHandCursor: true }).setDepth(20);
    const label = this.add.text(980, 28, "←  level 01", this.mono(12, "#1d6b66")).setOrigin(0.5).setDepth(21);
    chip.on("pointerdown", () => this.back());
    label.setInteractive({ useHandCursor: true });
    label.on("pointerdown", () => this.back());
  }

  onKey(e) {
    if (e.key === "Tab") {
      this.back();
      return;
    }
    if (e.key === "Escape") {
      if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
    this.pressKey();
  }

  pressKey() {
    if (this.busy || this.leaving || this.arrived) return;
    this.busy = true;
    this.tweens.add({ targets: this.keycap, y: 474, duration: 80, yoyo: true });
    const dot = this.add.circle(250, 430, 7, 0x1d6b66).setDepth(5);
    this.tweens.add({
      targets: dot,
      x: 560,
      y: 360,
      duration: 900,
      ease: "Sine.easeInOut",
      onComplete: () => {
        dot.destroy();
        this.controllerSpeaks();
      },
    });
  }

  controllerSpeaks() {
    this.chip.setFillStyle(0xf8e4dc);
    this.shout.setText(this.phrase);
    this.time.delayedCall(900, () => this.rideTrace());
  }

  rideTrace() {
    const words = this.phrase.split(" ");
    const launch = (i) => {
      if (i >= words.length) return;
      const token = this.add.text(640, 360, words[i], this.font(16, "#8d2a1a")).setOrigin(0.5).setDepth(30);
      this.follow(token, 0, () => {
        this.screen.setText((this.screen.text ? this.screen.text + " " : "") + words[i]);
        token.destroy();
        if (i === words.length - 1) {
          this.arrived = true;
          this.cpuBox.setInteractive({ useHandCursor: true });
          this.cpuBox.on("pointerdown", () => this.openDriver());
          this.screen.setInteractive({ useHandCursor: true });
          this.screen.on("pointerdown", () => this.openDriver());
          this.cpuHint.setText("click the message");
          this.objective.setColor("#1c1915");
          this.objective.setText("The shout reached the CPU. Click that message to see what the CPU does with an interrupt.");
          this.busy = false;
        }
      });
      this.time.delayedCall(280, () => launch(i + 1));
    };
    launch(0);
  }

  follow(token, i, done) {
    if (i >= this.route.length) {
      done();
      return;
    }
    const p = this.route[i];
    this.tweens.add({
      targets: token,
      x: p.x,
      y: p.y,
      duration: 700,
      ease: "Sine.easeInOut",
      onComplete: () => this.follow(token, i + 1, done),
    });
  }

  openDriver() {
    if (!this.arrived || this.leaving) return;
    this.leaving = true;
    const cover = this.add.rectangle(990, 168, 190, 150, 0xfffcf7).setStrokeStyle(2, 0x1d6b66).setDepth(400);
    const word = this.add.text(990, 168, "CPU", this.font(22, "#1c1915")).setOrigin(0.5).setDepth(401);
    this.tweens.add({ targets: cover, scaleX: 8, scaleY: 8, duration: 1600, ease: "Cubic.easeInOut" });
    this.tweens.add({ targets: word, alpha: 0.15, scale: 2, duration: 1600 });
    this.time.delayedCall(1600, () => this.scene.start("Level_01B_KeyboardDriver"));
  }

  back() {
    if (this.leaving) return;
    this.leaving = true;
    const cover = this.add.rectangle(390, 430, 40, 40, 0x12141a).setDepth(400);
    this.tweens.add({ targets: cover, scaleX: 40, scaleY: 28, duration: 1400, ease: "Cubic.easeInOut" });
    this.time.delayedCall(1400, () => this.scene.start("Level_01_KeyboardCPU"));
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

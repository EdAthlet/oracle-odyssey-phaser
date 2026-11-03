class Level_01B_KeyboardDriver extends Phaser.Scene {
  constructor() {
    super("Level_01B_KeyboardDriver");
  }

  create() {
    this.leaving = false;
    this.cameras.main.setBackgroundColor("#efe6d6");
    this.drawGrid();
    this.drawCpu();
    this.drawRam();
    this.drawHud();
    this.drawBack();
    this.input.keyboard.on("keydown", (e) => {
      if (e.key === "Tab") this.back();
      else if (e.key === "Escape") {
        if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
        this.scene.start("MenuScene");
      }
    });
    this.time.delayedCall(500, () => this.cpuHears());
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

  drawCpu() {
    this.add.rectangle(280, 400, 430, 430, 0xd7e0d2).setStrokeStyle(2, 0x8fa094);
    this.add.text(86, 206, "MOTHERBOARD", this.mono(11, "#5c6b5e"));
    this.add.rectangle(280, 400, 300, 230, 0xfffcf7).setStrokeStyle(1, 0xd9d1c3);
    this.add.rectangle(280, 286, 300, 2, 0x1d6b66);
    this.add.text(146, 300, "CPU", this.mono(11, "#6e675f"));
    this.cpuLine = this.add.text(146, 328, "", this.font(16, "#8d2a1a"));
    this.cpuLine.setWordWrapWidth(260);
    this.cpuOrder = this.add.text(146, 430, "", this.font(16, "#8d2a1a"));
    this.cpuOrder.setWordWrapWidth(260);
  }

  drawRam() {
    const g = this.add.graphics();
    g.lineStyle(2, 0x8d5a1a, 1);
    g.beginPath();
    g.moveTo(450, 380);
    g.lineTo(620, 380);
    g.strokePath();
    this.add.text(490, 352, "order", this.mono(11, "#8d5a1a"));

    this.add.rectangle(820, 390, 400, 360, 0xd5e3ee).setStrokeStyle(2, 0x7f93a8);
    this.add.text(640, 230, "RAM", this.mono(11, "#3e5870"));
    this.driverBox = this.add.rectangle(820, 400, 280, 160, 0xfffcf7).setStrokeStyle(2, 0x1d6b66);
    this.add.text(700, 336, "KEYBOARD DRIVER", this.mono(12, "#1d6b66"));
    this.driverLine = this.add.text(700, 370, "", this.font(16, "#1c1915"));
    this.driverLine.setWordWrapWidth(250);
  }

  drawHud() {
    this.add.rectangle(550, 42, 1100, 84, 0xfffcf7, 0.94);
    this.add.text(36, 14, "LEVEL 01B", this.mono(11, "#1d6b66"));
    this.add.text(36, 32, "The CPU starts a program", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "24px",
      color: "#1c1915",
    });
    this.objective = this.add.text(36, 62, "The interrupt has arrived. Watch who speaks next.", this.font(14, "#6e675f"));
    this.objective.setWordWrapWidth(860);
  }

  drawBack() {
    const chip = this.add.rectangle(980, 28, 140, 28, 0xfffcf7).setStrokeStyle(1, 0x1d6b66).setInteractive({ useHandCursor: true }).setDepth(20);
    const label = this.add.text(980, 28, "←  01A", this.mono(12, "#1d6b66")).setOrigin(0.5).setDepth(21);
    chip.on("pointerdown", () => this.back());
    label.setInteractive({ useHandCursor: true });
    label.on("pointerdown", () => this.back());
  }

  cpuHears() {
    this.cpuLine.setText("I hear your order to interrupt! Interrupting!");
    this.time.delayedCall(4200, () => this.sendOrder());
  }

  sendOrder() {
    this.cpuOrder.setText("Start keyboard driver!");
    const token = this.add.text(360, 380, "Start keyboard driver!", this.font(15, "#8d2a1a")).setOrigin(0, 0.5).setDepth(20);
    this.tweens.add({
      targets: token,
      x: 700,
      y: 400,
      duration: 1600,
      ease: "Sine.easeInOut",
      onComplete: () => {
        token.destroy();
        this.driverBox.setFillStyle(0xe7f3f1);
        this.driverLine.setText("I am just a piece of program sitting in the RAM!");
        this.objective.setColor("#1c1915");
        this.objective.setText("The driver is running. It has not read the key yet.");
      },
    });
  }

  back() {
    if (this.leaving) return;
    this.leaving = true;
    const cover = this.add.rectangle(820, 400, 40, 40, 0xfffcf7).setStrokeStyle(2, 0x1d6b66).setDepth(400);
    this.tweens.add({ targets: cover, scaleX: 36, scaleY: 24, duration: 1400, ease: "Cubic.easeInOut" });
    this.time.delayedCall(1400, () => this.scene.start("Level_01A_KeyboardController"));
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

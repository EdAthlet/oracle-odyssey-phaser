class Level_01C_InterruptController extends Phaser.Scene {
  constructor() {
    super("Level_01C_InterruptController");
  }

  create() {
    this.cameras.main.setBackgroundColor("#efe6d6");
    this.drawGrid();
    this.drawBoard();
    this.drawUnits();
    this.drawHud();
    this.drawBack();
    this.drawMembers();
    this.input.keyboard.on("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Tab") {
        if (e.key === "Escape" && window.odysseyGoMenu && window.odysseyGoMenu()) return;
        this.scene.start("MenuScene");
      }
    });
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
    this.add.rectangle(550, 400, 1020, 460, 0xd7e0d2).setStrokeStyle(2, 0x8fa094);
    this.add.text(56, 186, "MOTHERBOARD", this.mono(11, "#5c6b5e"));
  }

  arrow(x1, x2, y, label) {
    const g = this.add.graphics();
    g.lineStyle(2, 0x8d5a1a, 1);
    g.beginPath();
    g.moveTo(x1, y);
    g.lineTo(x2, y);
    g.strokePath();
    this.add.triangle(x2 - 8, y, -8, 6, 8, 0, -8, -6, 0x8d5a1a);
    this.add.text((x1 + x2) / 2, y - 18, label, this.mono(11, "#8d5a1a")).setOrigin(0.5);
  }

  drawUnits() {
    this.add.rectangle(150, 400, 190, 130, 0xfffcf7).setStrokeStyle(2, 0x1d6b66);
    this.add.text(70, 360, "KEYBOARD\nCONTROLLER", this.mono(12, "#1c1915"));
    this.add.text(70, 408, "Holds the scan code.\nRaises one line.", this.font(13, "#6e675f"));
    this.add.text(210, 448, "chip", this.mono(10, "#1d6b66")).setOrigin(1, 0.5);

    this.arrow(250, 310, 400, "line 1");

    this.add.rectangle(430, 400, 210, 160, 0xf6e6cf).setStrokeStyle(2, 0x8d5a1a);
    this.add.text(340, 348, "INTERRUPT\nCONTROLLER", this.mono(12, "#8d5a1a"));
    this.add.text(340, 400, "Hears the line.\nTells the CPU\na number.", this.font(13, "#1c1915"));
    this.add.text(510, 462, "chip", this.mono(10, "#8d5a1a")).setOrigin(1, 0.5);

    this.arrow(540, 600, 400, "interrupt number");

    this.add.rectangle(710, 400, 190, 140, 0xfffcf7).setStrokeStyle(1, 0xd9d1c3);
    this.add.rectangle(710, 331, 190, 2, 0x1d6b66);
    this.add.text(630, 346, "CPU", this.mono(11, "#6e675f"));
    this.add.text(630, 372, "Uses the number\nas a row.", this.font(13, "#1c1915"));
    this.add.text(780, 452, "chip", this.mono(10, "#6e675f")).setOrigin(1, 0.5);

    this.arrow(810, 860, 400, "read this row");

    this.add.rectangle(960, 400, 170, 200, 0xd5e3ee).setStrokeStyle(2, 0x7f93a8);
    this.add.text(890, 316, "RAM", this.mono(11, "#3e5870"));
    this.add.text(1020, 478, "chip", this.mono(10, "#3e5870")).setOrigin(1, 0.5);
    this.add.rectangle(960, 400, 132, 90, 0xfffcf7).setStrokeStyle(1, 0x7f93a8);
    this.add.text(906, 368, "interrupt table", this.mono(11, "#3e5870"));
    this.add.text(906, 390, "row 1\ndriver address", this.font(13, "#1c1915"));
  }

  drawHud() {
    this.add.rectangle(550, 42, 1100, 84, 0xfffcf7, 0.94);
    this.add.text(36, 14, "LEVEL 01C", this.mono(11, "#1d6b66"));
    this.add.text(36, 32, "Neighbors of the interrupt controller", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "24px",
      color: "#1c1915",
    });
    this.add.text(36, 64, "It speaks to two chips. It does not speak to RAM. The CPU does that, after it has the number.", this.font(14, "#6e675f"));
  }

  drawBack() {
    const chip = this.add.rectangle(990, 28, 120, 28, 0xfffcf7).setStrokeStyle(1, 0x1d6b66).setInteractive({ useHandCursor: true }).setDepth(20);
    const label = this.add.text(990, 28, "←  menu", this.mono(12, "#1d6b66")).setOrigin(0.5).setDepth(21);
    chip.on("pointerdown", () => this.scene.start("MenuScene"));
    label.setInteractive({ useHandCursor: true });
    label.on("pointerdown", () => this.scene.start("MenuScene"));
  }

  drawMembers() {
    this.add.text(550, 698, "keyboard controller   ·   interrupt controller   ·   CPU   ·   RAM   ·   interrupt table", this.mono(11, "#6e675f")).setOrigin(0.5);
  }
}

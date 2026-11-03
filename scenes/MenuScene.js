class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#07080c");
    this.drawGrid();

    const sans = "IBM Plex Sans, Segoe UI, sans-serif";
    const mono = "IBM Plex Mono, ui-monospace, monospace";
    const display = "Newsreader, Times New Roman, serif";

    this.add.text(64, 36, "FROM BITS TO CLOUD", {
      fontFamily: mono,
      fontSize: "12px",
      color: "#4a9a94",
    });


    this.add.text(64, 58, "Oracle", {
      fontFamily: display,
      fontSize: "52px",
      color: "#eceef2",
    });
    this.add.text(64, 108, "Odyssey", {
      fontFamily: display,
      fontSize: "52px",
      color: "#eceef2",
    });

    this.add.text(64, 168, "Each level adds one step. 02A is the first: the letter is stored in RAM\nbefore the monitor is allowed to show it.", {
      fontFamily: sans,
      fontSize: "15px",
      color: "#8a8f9c",
      lineSpacing: 6,
    });

    const names = { 1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE", 6: "SIX" };
    const levels = [
      { n: "1", title: "Keyboard → CPU → Display", blurb: "Type a character. Watch the signal travel.", scene: "Level_01_KeyboardCPU" },
      { n: "2", title: "Improved Keyboard & Monitor", blurb: "A real matrix. Packets start on the key you hit. Type BOOT!", scene: "Level_02_ImprovedKeyboard" },
      { n: "2A", hotkey: "A", title: "The letter stops in RAM", blurb: "Type SAVE. Screen updates only after the CPU writes a cell.", scene: "Level_02A_ThroughRAM", featured: true },
      { n: "3", title: "Key → Signal → Binary → Character", blurb: "ASCII in the open. Encode a letter, then type J as bits: 01001010.", scene: "Level_03_KeyPressToBinary" },
      { n: "4", title: "PC Boot", blurb: "Schematic: power rails, firmware, POST, disk, kernel into RAM.", scene: "Level_04_PC_Boot" },
      { n: "5", title: "Inside the boot", blurb: "You are the instruction pointer. Walk reset → UEFI → POST → kernel.", scene: "Level_04_1_BinaryThroughLogicGates" },
      { n: "6", title: "Database server architecture", blurb: "Walk the slide. Tasks light each box. D goes inside the Instance.", scene: "Level_06_TheInstance" },
    ];

    this.levelCards = [];
    this.selectedLevel = 2;
    levels.forEach((level, i) => {
      this.createLevelButton(48, 208 + i * 64, level.hotkey || names[level.n], level, sans, mono);
    });
    this.paintSelection();

    this.input.keyboard.on("keydown", (e) => {
      if (e.key === "ArrowDown") this.shiftLevel(1);
      else if (e.key === "ArrowUp") this.shiftLevel(-1);
      else if (e.key === "Enter" && this.levelCards[this.selectedLevel]) this.levelCards[this.selectedLevel].start();
    });

    this.add.text(48, 688, "Arrows move   ·   Enter opens   ·   1–6 or A jump", {
      fontFamily: mono,
      fontSize: "12px",
      color: "#5c6170",
    });
  }

  drawGrid() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x1a1d26, 0.85);
    for (let x = 40; x < 1100; x += 40) g.lineBetween(x, 0, x, 720);
    for (let y = 40; y < 720; y += 40) g.lineBetween(0, y, 1100, y);
  }

  createLevelButton(x, y, keyName, level, sans, mono) {
    const w = 980;
    const h = 52;
    const featured = !!level.featured;
    const box = this.add
      .rectangle(x + w / 2, y + h / 2, w, h, featured ? 0x16332f : 0x12141a)
      .setStrokeStyle(1, featured ? 0x4a9a94 : 0x2a2e38);
    box.setInteractive({ useHandCursor: true });

    this.add.text(x + 16, y + 16, level.n.length > 2 ? level.n : String(level.n).padStart(2, "0"), {
      fontFamily: mono,
      fontSize: "18px",
      color: "#4a9a94",
    });

    this.add.text(x + 78, y + 6, level.title, {
      fontFamily: sans,
      fontSize: "16px",
      color: "#eceef2",
    });

    this.add.text(x + 78, y + 28, level.blurb, {
      fontFamily: sans,
      fontSize: "13px",
      color: "#8a8f9c",
    });

    if (featured) {
      this.add.text(x + w - 64, y + 18, "NEW", {
        fontFamily: mono,
        fontSize: "11px",
        color: "#c4a574",
      });
    }

    const start = () => {
      if (level.scene === "Level_06_TheInstance" && window.odysseyGoInstance && window.odysseyGoInstance()) {
        return;
      }
      this.scene.start(level.scene);
    };

    box.on("pointerover", () => box.setFillStyle(featured ? 0x1c4a44 : 0x1a1d26));
    box.on("pointerout", () => this.paintSelection());
    box.on("pointerdown", () => {
      this.selectedLevel = this.levelCards.findIndex((card) => card.box === box);
      start();
    });
    this.levelCards.push({ box, start, featured, base: featured ? 0x16332f : 0x12141a });
    const hotkey = level.hotkey || level.n;
    this.input.keyboard.on("keydown-" + hotkey, start);
    if (keyName && keyName !== hotkey) this.input.keyboard.on("keydown-" + keyName, start);
  }

  shiftLevel(dir) {
    const n = this.levelCards.length;
    this.selectedLevel = (this.selectedLevel + dir + n) % n;
    this.paintSelection();
  }

  paintSelection() {
    this.levelCards.forEach((card, i) => {
      const on = i === this.selectedLevel;
      card.box.setFillStyle(on ? 0x1c3a36 : card.base);
      card.box.setStrokeStyle(on ? 2 : 1, on ? 0xc4a574 : card.featured ? 0x4a9a94 : 0x2a2e38);
    });
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
  }
}

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

    this.add.text(64, 172, "Six levels. A keystroke becomes electricity, then binary.\nThen you walk inside an Oracle instance as the SQL itself.", {
      fontFamily: sans,
      fontSize: "15px",
      color: "#8a8f9c",
      lineSpacing: 6,
    });

    const names = { 1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE", 6: "SIX" };
    const levels = [
      { n: "1", title: "Keyboard → CPU → Display", blurb: "Type a character. Watch the signal travel.", scene: "Level_01_KeyboardCPU" },
      { n: "2", title: "Improved Keyboard & Monitor", blurb: "A real matrix. Packets start on the key you hit. Type BOOT!", scene: "Level_02_ImprovedKeyboard" },
      { n: "3", title: "Key → Signal → Binary → Character", blurb: "ASCII lookup in the open. Bits for J: 01001010.", scene: "Level_03_KeyPressToBinary" },
      { n: "4", title: "PC Boot: HD → RAM → OS", blurb: "Flip power. Watch the OS load into RAM.", scene: "Level_04_PC_Boot" },
      { n: "5", title: "Binary Through Logic Gates", blurb: "Stand on AND, OR, or NOT. Target 01001111.", scene: "Level_04_1_BinaryThroughLogicGates" },
      { n: "6", title: "The Instance", blurb: "You are a SQL statement. Walk Listener, SGA, redo.", scene: "Level_06_TheInstance", featured: true },
    ];

    levels.forEach((level, i) => {
      this.createLevelButton(64, 236 + i * 68, names[level.n], level, sans, mono);
    });

    this.add.text(64, 686, "Press 1–6 to start  ·  Esc in a level returns here", {
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
    const w = 820;
    const h = 58;
    const featured = !!level.featured;
    const box = this.add
      .rectangle(x + w / 2, y + h / 2, w, h, featured ? 0x16332f : 0x12141a)
      .setStrokeStyle(1, featured ? 0x4a9a94 : 0x2a2e38);
    box.setInteractive({ useHandCursor: true });

    this.add.text(x + 18, y + 18, String(level.n).padStart(2, "0"), {
      fontFamily: mono,
      fontSize: "18px",
      color: "#4a9a94",
    });

    this.add.text(x + 70, y + 10, level.title, {
      fontFamily: sans,
      fontSize: "16px",
      color: "#eceef2",
    });

    this.add.text(x + 70, y + 32, level.blurb, {
      fontFamily: sans,
      fontSize: "13px",
      color: "#8a8f9c",
    });

    if (featured) {
      this.add.text(x + w - 72, y + 22, "NEW", {
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
    box.on("pointerout", () => box.setFillStyle(featured ? 0x16332f : 0x12141a));
    box.on("pointerdown", start);
    this.input.keyboard.on("keydown-" + level.n, start);
    this.input.keyboard.on("keydown-" + keyName, start);
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
  }
}

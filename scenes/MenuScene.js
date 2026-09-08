class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#0a0f1f");

    this.add.text(80, 36, "Oracle Odyssey", {
      fontSize: "44px",
      color: "#ffff44",
      fontStyle: "bold",
    });

    this.add.text(80, 90, "From Bits to Cloud — Training Game", {
      fontSize: "22px",
      color: "#aaccff",
    });

    const startY = 160;
    const lineHeight = 78;
    const names = { 1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE", 6: "SIX" };

    this.createLevelButton(80, startY + 0 * lineHeight, "1", names[1], "Level 01 — Keyboard → CPU → Display", "Level_01_KeyboardCPU");
    this.createLevelButton(80, startY + 1 * lineHeight, "2", names[2], "Level 02 — Improved Keyboard & Monitor", "Level_02_ImprovedKeyboard");
    this.createLevelButton(80, startY + 2 * lineHeight, "3", names[3], "Level 03 — Key Press → Signal → Binary → Character", "Level_03_KeyPressToBinary");
    this.createLevelButton(80, startY + 3 * lineHeight, "4", names[4], "Level 04 — Full PC Boot: HD → RAM → OS", "Level_04_PC_Boot");
    this.createLevelButton(80, startY + 4 * lineHeight, "5", names[5], "Level 05 — Binary Through Logic Gates", "Level_04_1_BinaryThroughLogicGates");
    this.createLevelButton(80, startY + 5 * lineHeight, "6", names[6], "Level 06 — The Instance (walk a SQL statement)", "Level_06_TheInstance", true);

    this.add.text(80, 680, "Click a level or press 1–6 · Esc returns here", {
      fontSize: "16px",
      color: "#888888",
    });
  }

  createLevelButton(x, y, number, keyName, title, sceneKey, featured) {
    const box = this.add
      .rectangle(x + 160, y + 22, 760, 58, featured ? 0x16332f : 0x1a1a2e)
      .setStrokeStyle(4, featured ? 0x44ddcc : 0x00ccff);
    box.setInteractive();

    this.add.text(x, y + 8, number, {
      fontSize: "32px",
      color: featured ? "#7dfff0" : "#00ffcc",
      fontStyle: "bold",
    });

    this.add.text(x + 70, y + 16, title, {
      fontSize: "20px",
      color: "#ffffff",
    });

    const start = () => {
      if (sceneKey === "Level_06_TheInstance" && window.odysseyGoInstance && window.odysseyGoInstance()) {
        return;
      }
      this.scene.start(sceneKey);
    };

    box.on("pointerdown", start);
    this.input.keyboard.on("keydown-" + number, start);
    this.input.keyboard.on("keydown-" + keyName, start);
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
  }
}

class Level_06_TheInstance extends Phaser.Scene {
  constructor() {
    super("Level_06_TheInstance");
  }

  create() {
    this.cameras.main.setBackgroundColor("#07080c");
    this.completed = false;
    this.visited = {};

    this.keys = this.input.keyboard.addKeys({
      up: "UP",
      down: "DOWN",
      left: "LEFT",
      right: "RIGHT",
      w: "W",
      s: "S",
      a: "A",
      d: "D",
    });

    this.add.text(36, 24, "Level 06 — The Instance", {
      fontSize: "28px",
      color: "#e8c96a",
      fontStyle: "bold",
    });
    this.add.text(36, 62, "You are a SQL statement at port 1521. Walk the path a request takes.", {
      fontSize: "16px",
      color: "#9ab0c8",
    });

    this.rooms = [
      { id: "listener", label: "LISTENER", hint: "port 1521", x: 110, y: 400, w: 150, h: 220 },
      { id: "cpu", label: "CPU / PGA", hint: "server process", x: 280, y: 360, w: 150, h: 220 },
      { id: "sga", label: "SGA", hint: "shared pool", x: 450, y: 320, w: 150, h: 220 },
      { id: "buffer", label: "BUFFER", hint: "cache", x: 620, y: 320, w: 150, h: 220 },
      { id: "storage", label: "STORAGE", hint: "datafiles", x: 790, y: 380, w: 150, h: 220 },
      { id: "redo", label: "REDO", hint: "LGWR", x: 960, y: 340, w: 150, h: 220 },
    ];

    const wires = this.add.graphics();
    wires.lineStyle(2, 0x4a9a94, 0.5);
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const a = this.rooms[i];
      const b = this.rooms[i + 1];
      wires.lineBetween(a.x + a.w / 2 - 12, a.y, b.x - b.w / 2 + 12, b.y);
    }

    this.roomGfx = {};
    for (const r of this.rooms) {
      const box = this.add.rectangle(r.x, r.y, r.w, r.h, 0x12141a).setStrokeStyle(3, 0x2a2e38);
      this.add.text(r.x, r.y - 18, r.label, { fontSize: "16px", color: "#eceef2", fontStyle: "bold" }).setOrigin(0.5);
      this.add.text(r.x, r.y + 8, r.hint, { fontSize: "13px", color: "#8a8f9c" }).setOrigin(0.5);
      this.roomGfx[r.id] = box;
      this.visited[r.id] = false;
    }

    const body = this.add.circle(0, 0, 16, 0x4a9a94);
    const tag = this.add.text(0, 0, "SESS", {
      fontSize: "10px",
      color: "#07080c",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.hero = this.add.container(this.rooms[0].x, this.rooms[0].y + 70, [body, tag]);

    this.status = this.add.text(36, 100, "Walk east. Light every room.", {
      fontSize: "18px",
      color: "#c5cdd8",
    });

    this.packet = this.add.rectangle(this.rooms[0].x, this.rooms[0].y - 90, 14, 14, 0x7dfff0);
    this.tweens.add({
      targets: this.packet,
      x: this.rooms[this.rooms.length - 1].x,
      duration: 4200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.input.keyboard.on("keydown", (e) => {
      if (e.key === "Escape") {
        if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
        this.scene.start("MenuScene");
        return;
      }
      if (this.completed && (e.key === "Enter" || e.key === "6")) {
        if (window.odysseyGoInstance && window.odysseyGoInstance()) return;
        this.status.setText("Level 06 complete. Esc returns to the menu.");
      }
    });
  }

  mark(id) {
    if (this.visited[id]) return;
    this.visited[id] = true;
    this.roomGfx[id].setFillStyle(0x16332f).setStrokeStyle(3, 0x44ddcc);
    const n = Object.values(this.visited).filter(Boolean).length;
    this.status.setText("Rooms lit " + n + "/6 — keep walking the SQL path.");
    if (n >= 6 && !this.completed) {
      this.completed = true;
      this.status.setText("SELECT walked the instance. Press Enter, or Esc for the menu.");
      this.add.text(36, 640, "Level 06 complete — Listener → CPU → SGA → Buffer → Storage → Redo", {
        fontSize: "18px",
        color: "#7dfff0",
      });
    }
  }

  update() {
    const speed = 6;
    if (this.keys.w.isDown || this.keys.up.isDown) this.hero.y -= speed;
    if (this.keys.s.isDown || this.keys.down.isDown) this.hero.y += speed;
    if (this.keys.a.isDown || this.keys.left.isDown) this.hero.x -= speed;
    if (this.keys.d.isDown || this.keys.right.isDown) this.hero.x += speed;

    this.hero.x = Phaser.Math.Clamp(this.hero.x, 24, 1076);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, 140, 700);

    for (const r of this.rooms) {
      if (Math.abs(this.hero.x - r.x) < r.w / 2 && Math.abs(this.hero.y - r.y) < r.h / 2) {
        this.mark(r.id);
      }
    }
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.tweens.killAll();
  }
}

class Level_06_TheInstance extends Phaser.Scene {
  constructor() {
    super("Level_06_TheInstance");
  }

  create() {
    this.W = 1600;
    this.H = 1100;
    this.completed = false;
    this.inside = null;
    this.talkedDba = false;
    this.seen = {};

    this.C = {
      bg: 0x07080c,
      surface: 0x12141a,
      border: 0x2a2e38,
      teal: 0x4a9a94,
    };

    this.buildings = [
      { id: "listener", title: "Listener", sub: "Oracle Net · 1521", x: 180, y: 430, w: 220, h: 150, explain: "Front gate. Port 1521. The Listener does not run SQL. It hands the connection to a server process, then waits again." },
      { id: "instance", title: "The Instance", sub: "PGA · SGA · processes", x: 1180, y: 360, w: 280, h: 200, explain: "This hall is where SQL actually runs: dedicated server and PGA, then shared SGA — shared pool, buffer cache, redo buffer." },
      { id: "storage", title: "Datafiles", sub: "Tablespaces", x: 160, y: 760, w: 230, h: 160, explain: "The cupboard. Tablespaces are files on disk. A cache miss walks here. RAM forgets; these files remember." },
      { id: "redo", title: "Redo annex", sub: "Online logs · LGWR", x: 1180, y: 760, w: 230, h: 160, explain: "Every change is written as redo first. COMMIT waits for LGWR to flush the log buffer to these files — not for DBWn to write the table." },
      { id: "standby", title: "Data Guard", sub: "Standby · redo apply", x: 660, y: 90, w: 260, h: 150, explain: "A live second site. Redo is shipped here and applied. Failover if the primary dies. This is not a backup tape." },
      { id: "grid", title: "Grid Infrastructure", sub: "ASM · CRS · cluster", x: 520, y: 880, w: 230, h: 140, explain: "Grid starts the instance and mounts ASM disk groups. CRS is the watchdog. The database does not start itself." },
      { id: "rman", title: "RMAN vault", sub: "Backup · recover", x: 860, y: 880, w: 230, h: 140, explain: "Copies of the past: datafiles and archived redo. Restore a file, recover to a time. History, not a standby." },
    ];

    this.cameras.main.setBackgroundColor(this.C.bg);
    this.cameras.main.setBounds(0, 0, this.W, this.H);

    this.moveKeys = this.input.keyboard.addKeys({
      up: "UP",
      down: "DOWN",
      left: "LEFT",
      right: "RIGHT",
      w: "W",
      s: "S",
      a: "A",
      d: "D",
    });

    this.drawGround();
    this.drawPlaza();
    this.drawBuildings();
    this.drawHud();
    this.drawHero();
    this.cameras.main.startFollow(this.hero, true, 0.12, 0.12);

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

  drawGround() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x1a1d26, 0.9);
    for (let x = 40; x < this.W; x += 40) g.lineBetween(x, 0, x, this.H);
    for (let y = 40; y < this.H; y += 40) g.lineBetween(0, y, this.W, y);
    g.lineStyle(2, 0x2d5e5a, 0.7);
    g.beginPath();
    g.moveTo(300, 500);
    g.lineTo(800, 540);
    g.lineTo(1180, 460);
    g.moveTo(800, 540);
    g.lineTo(800, 160);
    g.moveTo(280, 840);
    g.lineTo(800, 540);
    g.lineTo(1290, 840);
    g.moveTo(630, 950);
    g.lineTo(980, 950);
    g.strokePath();
  }

  drawPlaza() {
    this.add.ellipse(800, 540, 220, 120, 0x1a1d26).setStrokeStyle(2, 0x4a9a94);
    this.add.text(800, 524, "ORACLE CAMPUS", this.mono(12, "#4a9a94")).setOrigin(0.5);
    this.add.text(800, 544, "one database · many services", this.font(12, "#8a8f9c")).setOrigin(0.5);
    this.dba = this.add.container(800, 580, [
      this.add.circle(0, 6, 16, 0xc4a574),
      this.add.text(0, 6, "DBA", this.mono(9, "#07080c")).setOrigin(0.5),
    ]);
    this.add.text(800, 610, "E  talk", this.mono(11, "#5c6170")).setOrigin(0.5);
  }

  drawBuildings() {
    this.bGfx = {};
    this.buildings.forEach((b) => {
      const box = this.add.rectangle(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h, 0x12141a).setStrokeStyle(2, 0x4a9a94);
      this.add.rectangle(b.x + b.w / 2, b.y + 5, b.w, 8, 0x2d5e5a);
      this.add.text(b.x + b.w / 2, b.y + b.h / 2 - 10, b.title, this.font(16, "#eceef2")).setOrigin(0.5);
      this.add.text(b.x + b.w / 2, b.y + b.h / 2 + 12, b.sub, this.mono(11, "#8a8f9c")).setOrigin(0.5);
      this.add.text(b.x + b.w / 2, b.y + b.h - 18, "E  enter", this.mono(10, "#5c6170")).setOrigin(0.5);
      this.bGfx[b.id] = box;
      this.seen[b.id] = false;
    });
  }

  drawHud() {
    this.hudBg = this.add.rectangle(550, 44, 1100, 88, 0x07080c, 0.92).setScrollFactor(0);
    this.add.text(36, 14, "LEVEL 06", this.mono(11, "#4a9a94")).setScrollFactor(0);
    this.add
      .text(36, 32, "Oracle Campus", {
        fontFamily: "Newsreader, Times New Roman, serif",
        fontSize: "24px",
        color: "#eceef2",
      })
      .setScrollFactor(0);
    this.explain = this.add
      .text(36, 62, "Talk to the DBA in the plaza. Then walk into a building and press E.", this.font(14, "#8a8f9c"))
      .setScrollFactor(0);
    this.explain.setWordWrapWidth(820);
    this.prompt = this.add
      .text(36, 690, "Arrows / WASD walk   ·   E enter or talk   ·   Esc menu", this.mono(12, "#5c6170"))
      .setScrollFactor(0);
    this.add.text(1064, 18, "Esc menu", this.mono(12, "#5c6170")).setOrigin(1, 0).setScrollFactor(0);
  }

  drawHero() {
    const body = this.add.circle(0, 6, 16, 0x4a9a94);
    const visor = this.add.rectangle(0, -10, 22, 8, 0xc4a574);
    const tag = this.add.text(0, 6, "YOU", this.mono(9, "#07080c")).setOrigin(0.5);
    this.hero = this.add.container(800, 640, [body, visor, tag]);
  }

  onBuilding() {
    const x = this.hero.x;
    const y = this.hero.y;
    return this.buildings.find((b) => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) || null;
  }

  nearDba() {
    return Phaser.Math.Distance.Between(this.hero.x, this.hero.y, 800, 580) < 56;
  }

  onKey(e) {
    if (e.key === "Escape") {
      if (this.inside) {
        this.leaveBuilding();
        return;
      }
      if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }
    if (this.completed && (e.key === "m" || e.key === "M")) {
      if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }
    if (e.key !== "e" && e.key !== "E" && e.key !== "Enter") return;
    if (this.inside) {
      this.leaveBuilding();
      return;
    }
    if (this.nearDba()) {
      this.talkedDba = true;
      this.explain.setColor("#eceef2");
      this.explain.setText(
        "Each building is a service. SQL runs only in the Instance. Listener is the gate. Grid starts the machine. Data Guard is a live second site. RMAN is history.",
      );
      return;
    }
    const b = this.onBuilding();
    if (b) this.enterBuilding(b);
  }

  enterBuilding(b) {
    this.inside = b.id;
    this.seen[b.id] = true;
    this.bGfx[b.id].setStrokeStyle(2, 0x8fd4a8);
    this.explain.setColor("#eceef2");
    this.explain.setText(b.title + " — " + b.explain + "  (E to return to the yard)");
    this.cameras.main.flash(180, 7, 8, 12);
    this.checkComplete();
  }

  leaveBuilding() {
    this.inside = null;
    const left = this.buildings.filter((b) => !this.seen[b.id]).length;
    this.explain.setColor("#8a8f9c");
    this.explain.setText(left ? "Yard. " + left + " building(s) still unvisited. Walk onto a hall and press E." : "Campus mapped.");
  }

  checkComplete() {
    if (this.completed) return;
    if (!this.talkedDba) return;
    if (this.buildings.some((b) => !this.seen[b.id])) return;
    this.completed = true;
    this.explain.setColor("#8fd4a8");
    this.explain.setText("Campus mapped. Listener, Instance, disk, redo, Grid, Guard, RMAN — one database, many buildings.");
    this.prompt.setText("Level 06 complete  ·  Esc or M for menu");
  }

  update() {
    if (this.inside) return;
    const speed = 5.4;
    let dx = 0;
    let dy = 0;
    if (this.moveKeys.up.isDown || this.moveKeys.w.isDown) dy -= speed;
    if (this.moveKeys.down.isDown || this.moveKeys.s.isDown) dy += speed;
    if (this.moveKeys.left.isDown || this.moveKeys.a.isDown) dx -= speed;
    if (this.moveKeys.right.isDown || this.moveKeys.d.isDown) dx += speed;
    this.hero.x = Phaser.Math.Clamp(this.hero.x + dx, 50, this.W - 50);
    this.hero.y = Phaser.Math.Clamp(this.hero.y + dy, 110, this.H - 40);
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.tweens.killAll();
  }
}

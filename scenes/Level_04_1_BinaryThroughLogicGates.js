class Level_04_1_BinaryThroughLogicGates extends Phaser.Scene {
  constructor() {
    super("Level_04_1_BinaryThroughLogicGates");
  }

  create() {
    this.completed = false;
    this.step = 0;
    this.ramOk = [false, false, false];
    this.tipShown = false;
    this.startTime = this.time.now;
    this.packets = [];

    this.C = {
      bg: 0x07080c,
      surface: 0x12141a,
      border: 0x2a2e38,
      teal: 0x4a9a94,
    };

    this.STEPS = [
      { id: "reset", title: "Reset vector", note: "CPU starts at a fixed address in firmware, not on disk." },
      { id: "firmware", title: "Firmware", note: "UEFI in flash. It owns the machine until it gives it away." },
      { id: "post", title: "POST · RAM", note: "Walk each DIMM and press E. Firmware will not boot on bad memory." },
      { id: "disk", title: "Boot disk", note: "Firmware reads the first sector: MBR or GPT." },
      { id: "loader", title: "Bootloader", note: "A small program that knows how to find the kernel." },
      { id: "kernel", title: "Kernel in RAM", note: "The OS core is copied off disk into memory." },
      { id: "run", title: "Transfer control", note: "CPU jumps to the kernel. Firmware is done." },
    ];

    this.cameras.main.setBackgroundColor(this.C.bg);
    this.drawGrid();

    this.moveKeys = this.input.keyboard.addKeys({
      up: "UP",
      down: "DOWN",
      left: "LEFT",
      right: "RIGHT",
    });

    this.pads = {
      reset: { x: 160, y: 250, w: 160, h: 88, eyebrow: "FFFF0", title: "Reset" },
      firmware: { x: 360, y: 250, w: 170, h: 88, eyebrow: "FLASH", title: "UEFI" },
      ram0: { x: 560, y: 210, w: 120, h: 64, eyebrow: "DIMM", title: "Bank 0" },
      ram1: { x: 700, y: 210, w: 120, h: 64, eyebrow: "DIMM", title: "Bank 1" },
      ram2: { x: 840, y: 210, w: 120, h: 64, eyebrow: "DIMM", title: "Bank 2" },
      disk: { x: 360, y: 430, w: 180, h: 96, eyebrow: "STORAGE", title: "First sector" },
      loader: { x: 580, y: 430, w: 170, h: 96, eyebrow: "LDR", title: "Bootloader" },
      kernel: { x: 800, y: 430, w: 170, h: 96, eyebrow: "RAM", title: "Kernel" },
      run: { x: 800, y: 580, w: 180, h: 88, eyebrow: "CPU", title: "Jump / run" },
    };

    this.drawTraces();
    this.padGfx = {};
    Object.keys(this.pads).forEach((id) => this.drawPad(id));
    this.drawHud();
    this.drawLog();
    this.drawHero();
    this.setActivePads();

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

  drawTraces() {
    const g = this.add.graphics();
    g.lineStyle(2, 0x2d5e5a, 0.75);
    const p = this.pads;
    g.beginPath();
    g.moveTo(p.reset.x, p.reset.y);
    g.lineTo(p.firmware.x, p.firmware.y);
    g.lineTo(p.ram0.x, p.ram0.y);
    g.lineTo(p.ram2.x, p.ram2.y);
    g.moveTo(p.firmware.x, p.firmware.y + 44);
    g.lineTo(p.disk.x, p.disk.y - 48);
    g.lineTo(p.loader.x, p.loader.y);
    g.lineTo(p.kernel.x, p.kernel.y);
    g.lineTo(p.run.x, p.run.y);
    g.strokePath();
  }

  drawPad(id) {
    const p = this.pads[id];
    const box = this.add.rectangle(p.x, p.y, p.w, p.h, 0x12141a).setStrokeStyle(1, 0x2a2e38);
    this.add.rectangle(p.x, p.y - p.h / 2 + 1, p.w, 2, 0x4a9a94).setAlpha(0.4);
    this.add.text(p.x - p.w / 2 + 10, p.y - p.h / 2 + 10, p.eyebrow, this.mono(10, "#5c6170"));
    const title = this.add.text(p.x - p.w / 2 + 10, p.y - p.h / 2 + 26, p.title, this.font(15, "#eceef2"));
    const state = this.add.text(p.x - p.w / 2 + 10, p.y + p.h / 2 - 22, "", this.mono(11, "#5c6170"));
    const flash = this.add.rectangle(p.x, p.y, p.w, p.h, 0x4a9a94, 0);
    this.padGfx[id] = { box, title, state, flash };
  }

  drawHud() {
    this.add.rectangle(550, 44, 1100, 88, 0x07080c, 0.92);
    this.add.text(36, 16, "LEVEL 04.1", this.mono(11, "#4a9a94"));
    this.add.text(36, 36, "Inside the boot", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "24px",
      color: "#eceef2",
    });
    this.objective = this.add.text(36, 68, "", this.font(14, "#8a8f9c"));
    this.add.text(1064, 22, "Esc menu", this.mono(12, "#5c6170")).setOrigin(1, 0);
    this.add.text(1064, 44, "E or Enter", this.mono(12, "#5c6170")).setOrigin(1, 0);
    this.refreshObjective();
  }

  drawLog() {
    this.logLines = [];
    this.logText = this.add.text(36, 560, "", {
      fontFamily: "IBM Plex Mono, ui-monospace, monospace",
      fontSize: "12px",
      color: "#8a8f9c",
      lineSpacing: 4,
    });
    this.log("waiting at reset vector");
  }

  drawHero() {
    const body = this.add.circle(0, 6, 16, 0x4a9a94);
    const visor = this.add.rectangle(0, -10, 22, 8, 0xc4a574);
    const tag = this.add.text(0, 6, "IP", this.mono(9, "#07080c")).setOrigin(0.5);
    this.hero = this.add.container(this.pads.reset.x, this.pads.reset.y, [body, visor, tag]);
  }

  log(line) {
    this.logLines.push("> " + line);
    if (this.logLines.length > 6) this.logLines.shift();
    this.logText.setText(this.logLines.join("\n"));
  }

  refreshObjective() {
    const s = this.STEPS[this.step];
    if (!s) return;
    this.objective.setColor("#eceef2");
    this.objective.setText(s.title + " — " + s.note);
  }

  setActivePads() {
    const s = this.STEPS[this.step];
    const active = [];
    if (!s) return;
    if (s.id === "reset") active.push("reset");
    if (s.id === "firmware") active.push("firmware");
    if (s.id === "post") {
      if (!this.ramOk[0]) active.push("ram0");
      if (!this.ramOk[1]) active.push("ram1");
      if (!this.ramOk[2]) active.push("ram2");
    }
    if (s.id === "disk") active.push("disk");
    if (s.id === "loader") active.push("loader");
    if (s.id === "kernel") active.push("kernel");
    if (s.id === "run") active.push("run");

    Object.keys(this.padGfx).forEach((id) => {
      const on = active.indexOf(id) !== -1;
      const done =
        (id === "reset" && this.step > 0) ||
        (id === "firmware" && this.step > 1) ||
        (id.indexOf("ram") === 0 && this.ramOk[Number(id.slice(-1))]) ||
        (id === "disk" && this.step > 3) ||
        (id === "loader" && this.step > 4) ||
        (id === "kernel" && this.step > 5) ||
        (id === "run" && this.completed);
      this.padGfx[id].box.setStrokeStyle(1, on ? 0x4a9a94 : done ? 0x2d5e5a : 0x2a2e38);
      this.padGfx[id].box.setFillStyle(on ? 0x16332f : 0x12141a);
    });
  }

  onPad(id) {
    const p = this.pads[id];
    return Math.abs(this.hero.x - p.x) < p.w / 2 && Math.abs(this.hero.y - p.y) < p.h / 2;
  }

  pulse(id) {
    const g = this.padGfx[id];
    g.flash.setFillStyle(0x4a9a94, 0.22);
    this.tweens.add({ targets: g.flash, fillAlpha: 0, duration: 280 });
  }

  send(label, fromId, toId, done) {
    const a = this.pads[fromId];
    const b = this.pads[toId];
    const wrap = this.add.container(a.x, a.y);
    const body = this.add.rectangle(0, 0, 56, 20, 0x4a9a94);
    const text = this.add.text(0, 0, label, this.mono(10, "#07080c")).setOrigin(0.5);
    wrap.add([body, text]);
    this.packets.push(wrap);
    this.tweens.add({
      targets: wrap,
      x: b.x,
      y: b.y,
      duration: 480,
      ease: "Cubic.easeInOut",
      onComplete: () => {
        wrap.destroy();
        if (done) done();
      },
    });
  }

  onKey(e) {
    if (e.key === "Escape") {
      if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }
    if (this.completed && (e.key === "6" || e.code === "Digit6")) {
      if (window.odysseyGoInstance && window.odysseyGoInstance()) return;
      this.scene.start("Level_06_TheInstance");
      return;
    }
    if (this.completed) return;
    if (e.key !== "e" && e.key !== "E" && e.key !== "Enter") return;
    this.tryStep();
  }

  tryStep() {
    const s = this.STEPS[this.step];
    if (!s) return;

    if (s.id === "reset") {
      if (!this.onPad("reset")) return this.hint("Stand on Reset.");
      this.pulse("reset");
      this.padGfx.reset.state.setText("RIP = reset").setColor("#7dfff0");
      this.log("reset vector hit");
      this.advance();
      return;
    }

    if (s.id === "firmware") {
      if (!this.onPad("firmware")) return this.hint("Walk to UEFI flash.");
      this.pulse("firmware");
      this.send("IP", "reset", "firmware");
      this.padGfx.firmware.state.setText("in control").setColor("#7dfff0");
      this.log("firmware owns the CPU");
      this.advance();
      return;
    }

    if (s.id === "post") {
      const banks = ["ram0", "ram1", "ram2"];
      const hit = banks.find((id) => this.onPad(id));
      if (!hit) return this.hint("Stand on an untested DIMM.");
      const n = Number(hit.slice(-1));
      if (this.ramOk[n]) return this.hint("That bank already passed.");
      this.ramOk[n] = true;
      this.pulse(hit);
      this.padGfx[hit].state.setText("OK").setColor("#8fd4a8");
      this.log("POST ram bank " + n + " ok");
      this.send("TEST", "firmware", hit);
      if (this.ramOk.every(Boolean)) {
        this.log("POST passed");
        this.advance();
      } else {
        this.setActivePads();
      }
      return;
    }

    if (s.id === "disk") {
      if (!this.onPad("disk")) return this.hint("Walk to the disk.");
      this.pulse("disk");
      this.send("INT13", "firmware", "disk");
      this.padGfx.disk.state.setText("MBR / GPT").setColor("#c4a574");
      this.log("first sector read");
      this.advance();
      return;
    }

    if (s.id === "loader") {
      if (!this.onPad("loader")) return this.hint("Walk to the bootloader.");
      this.pulse("loader");
      this.send("LDR", "disk", "loader");
      this.padGfx.loader.state.setText("loaded").setColor("#7dfff0");
      this.log("bootloader in memory");
      this.advance();
      return;
    }

    if (s.id === "kernel") {
      if (!this.onPad("kernel")) return this.hint("Walk to the kernel pad.");
      this.pulse("kernel");
      this.send("KERNEL", "disk", "kernel");
      this.padGfx.kernel.state.setText("image in RAM").setColor("#8fd4a8");
      this.log("kernel copied to RAM");
      this.advance();
      return;
    }

    if (s.id === "run") {
      if (!this.onPad("run")) return this.hint("Walk to Jump / run.");
      this.pulse("run");
      this.send("JMP", "kernel", "run");
      this.padGfx.run.state.setText("OS running").setColor("#8fd4a8");
      this.log("control transferred");
      this.completed = true;
      this.step = this.STEPS.length;
      this.objective.setColor("#8fd4a8");
      this.objective.setText("Firmware handed the machine to the kernel. Press 6 — now the OS can run a database.");
      this.add.text(550, 686, "Level 04.1 complete  ·  Press 6", this.mono(14, "#8fd4a8")).setOrigin(0.5);
      this.setActivePads();
    }
  }

  hint(text) {
    this.objective.setColor("#c4a574");
    this.objective.setText(text);
  }

  advance() {
    this.step += 1;
    this.refreshObjective();
    this.setActivePads();
  }

  update() {
    const speed = 5.5;
    if (this.moveKeys.up.isDown) this.hero.y -= speed;
    if (this.moveKeys.down.isDown) this.hero.y += speed;
    if (this.moveKeys.left.isDown) this.hero.x -= speed;
    if (this.moveKeys.right.isDown) this.hero.x += speed;
    this.hero.x = Phaser.Math.Clamp(this.hero.x, 28, 1072);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, 110, 700);

    if (!this.tipShown && !this.completed && (this.time.now - this.startTime) / 1000 > 12) {
      this.tipShown = true;
      this.log("tip: stand on the lit pad, press E");
    }
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.packets.forEach((p) => p.destroy());
    this.packets = [];
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

class Level_06_TheInstance extends Phaser.Scene {
  constructor() {
    super("Level_06_TheInstance");
  }

  create() {
    this.mode = "map";
    this.step = 0;
    this.typed = "";
    this.completed = false;
    this.quizUnit = null;

    this.C = {
      bg: 0x07080c,
      surface: 0x12141a,
      border: 0x2a2e38,
      teal: 0x4a9a94,
      gold: 0xc4a574,
      ok: 0x8fd4a8,
    };

    this.UNITS = [
      {
        id: "user",
        title: "User process",
        sub: "Client · SQL*Plus",
        x: 150,
        y: 250,
        w: 170,
        h: 110,
        shape: "oval",
        arrive:
          "You are the user process on a client laptop. You do not live on the database host. You send a request over Oracle Net.",
        task: {
          kind: "type",
          prompt: "Type the language of that request.",
          answers: ["SQL", "SELECT"],
          hint: "Four letters. The language of Oracle.",
        },
        deep: "A user process is usually SQL*Plus, SQL Developer, or an app. It talks Oracle Net. It cannot touch SGA or datafiles itself.",
      },
      {
        id: "listener",
        title: "Listener",
        sub: "Oracle Net · the missing piece",
        x: 360,
        y: 250,
        w: 170,
        h: 110,
        shape: "rect",
        hidden: true,
        arrive:
          "The slide hid me. I am the Listener. Remote clients knock here. I do not run SQL — I spawn or hand off a server process, then wait again.",
        task: {
          kind: "type",
          prompt: "Type my default port.",
          answers: ["1521"],
          hint: "Four digits. Classic Oracle Net.",
        },
        deep: "Default 1521. DBAs can move it. Without me, the laptop never reaches the instance. I am Oracle Net’s front door, not the engine.",
      },
      {
        id: "pga",
        title: "Server process",
        sub: "Dedicated · PGA",
        x: 150,
        y: 470,
        w: 170,
        h: 130,
        shape: "oval",
        arrive:
          "A dedicated server process now owns your session. It can touch SGA and disk. Its private memory is not shared.",
        task: {
          kind: "choice",
          prompt: "That private memory is called:",
          choices: ["SGA", "PGA", "FRA"],
          answer: 1,
          hint: "Program Global Area — one process, not the instance.",
        },
        deep: "PGA holds sorts, hash joins, session state. Other sessions cannot see it. SGA is the shared desk. PGA is your private notebook.",
      },
      {
        id: "instance",
        title: "Instance",
        sub: "Memory + processes",
        x: 700,
        y: 210,
        w: 320,
        h: 70,
        shape: "banner",
        arrive:
          "A basic Oracle system is two things: an instance (memory and processes) and a database (files on disk). They are not the same object.",
        task: {
          kind: "choice",
          prompt: "An instance is:",
          choices: ["Files on disk", "Memory + Oracle processes", "A tablespace"],
          answer: 1,
          hint: "It lives in RAM. The database lives on disk.",
        },
        deep: "Start the instance and Oracle allocates the SGA and background processes. An instance can exist without a database, and files can sit on disk with no instance.",
        dive: true,
      },
      {
        id: "sga",
        title: "SGA",
        sub: "System Global Area",
        x: 700,
        y: 310,
        w: 320,
        h: 110,
        shape: "rect",
        arrive:
          "The SGA is shared memory for this instance: cached blocks, shared SQL, the redo log buffer. Every server and background process can see it.",
        task: {
          kind: "choice",
          prompt: "Cached data blocks and shared SQL live in:",
          choices: ["PGA", "SGA", "Redo logs"],
          answer: 1,
          hint: "Shared by all processes of this instance.",
        },
        deep: "SGA components include the buffer cache, shared pool, and log buffer. A logical read is a read from here. A physical read fetches a block from a datafile into here.",
        dive: true,
      },
      {
        id: "bg",
        title: "Background processes",
        sub: "DBWn · LGWR · PMON · SMON",
        x: 700,
        y: 450,
        w: 320,
        h: 90,
        shape: "rect",
        arrive:
          "Background processes keep the instance alive: write memory to disk, flush redo, clean dead sessions, recover after a crash. Each has one job.",
        task: {
          kind: "choice",
          prompt: "COMMIT waits for which process to flush redo?",
          choices: ["DBWn", "PMON", "LGWR"],
          answer: 2,
          hint: "Log Writer. Not the database writer.",
        },
        deep: "LGWR writes the log buffer to online redo — that is COMMIT. DBWn writes dirty buffers later. PMON tidies dead sessions. SMON recovers.",
      },
      {
        id: "db",
        title: "Database",
        sub: "Control · redo · datafiles",
        x: 700,
        y: 570,
        w: 320,
        h: 110,
        shape: "rect",
        arrive:
          "The database is files on disk. Three kinds: control files (structure), redo logs (how to replay change), datafiles (user data, grouped in tablespaces).",
        task: {
          kind: "type",
          prompt: "User data lives in which files? Type the name.",
          answers: ["DATAFILES", "DATAFILE", "DATA FILES", "DATA FILE", "DATA"],
          hint: "Tablespaces are made of these.",
        },
        deep: "SQL reads a datafile into the SGA (or PGA). COMMIT does not wait for that write-back. COMMIT waits for redo. The cupboard remembers; the desk is fast.",
      },
    ];

    this.cameras.main.setBackgroundColor(this.C.bg);
    this.drawGrid();
    this.drawInstanceShell();
    this.wires = this.add.graphics();
    this.unitGfx = {};
    this.UNITS.forEach((u) => this.drawUnit(u));
    this.drawHud();
    this.drawHero();
    this.redrawWires();
    this.refreshUnits();
    this.setExplain("You are a SQL request on a client. Walk onto User process and press E. The diagram is dark until you prove each piece.");

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

  drawInstanceShell() {
    this.shell = this.add.rectangle(700, 430, 360, 490, 0x10150f, 0.35).setStrokeStyle(2, 0x2a2e38);
    this.shellLab = this.add.text(700, 168, "ORACLE SERVER", this.mono(11, "#5c6170")).setOrigin(0.5);
  }

  drawUnit(u) {
    const box = this.add.rectangle(u.x, u.y, u.w, u.h, this.C.surface).setStrokeStyle(1, this.C.border);
    const bar = this.add.rectangle(u.x, u.y - u.h / 2 + 3, u.w, 4, this.C.teal).setAlpha(0.3);
    const title = this.add.text(u.x, u.y - 12, "???", this.font(15, "#5c6170")).setOrigin(0.5);
    const sub = this.add.text(u.x, u.y + 12, "", this.mono(11, "#5c6170")).setOrigin(0.5);
    const mark = this.add.text(u.x, u.y + u.h / 2 - 14, "", this.mono(10, "#5c6170")).setOrigin(0.5);
    this.unitGfx[u.id] = { box, bar, title, sub, mark };
  }

  drawHud() {
    this.add.rectangle(550, 48, 1100, 96, 0x07080c, 0.94);
    this.add.text(36, 12, "LEVEL 06", this.mono(11, "#4a9a94"));
    this.add.text(36, 30, "Database server architecture", {
      fontFamily: "Newsreader, Times New Roman, serif",
      fontSize: "22px",
      color: "#eceef2",
    });
    this.explain = this.add.text(36, 56, "", {
      fontFamily: "IBM Plex Sans, Segoe UI, sans-serif",
      fontSize: "14px",
      color: "#8a8f9c",
      wordWrap: { width: 820 },
      lineSpacing: 3,
    });
    this.prompt = this.add.text(36, 690, "Arrows / WASD walk   ·   E  task   ·   Esc menu", this.mono(12, "#5c6170"));
    this.typedText = this.add.text(1064, 56, "", this.mono(14, "#7dfff0")).setOrigin(1, 0);
    this.dots = this.add.text(1064, 18, "", this.mono(12, "#5c6170")).setOrigin(1, 0);
    this.refreshDots();
  }

  drawHero() {
    const body = this.add.circle(0, 6, 16, 0x4a9a94);
    const visor = this.add.rectangle(0, -10, 22, 8, 0xc4a574);
    const tag = this.add.text(0, 6, "SQL", this.mono(9, "#07080c")).setOrigin(0.5);
    this.hero = this.add.container(150, 250, [body, visor, tag]);
  }

  setExplain(text, tone) {
    const colors = { mute: "#8a8f9c", teach: "#eceef2", wait: "#c4a574", ok: "#8fd4a8" };
    this.explain.setColor(colors[tone] || colors.teach);
    this.explain.setText(text);
  }

  refreshDots() {
    const parts = this.UNITS.map((u, i) => {
      if (i < this.step) return "●";
      if (i === this.step) return "◉";
      return "○";
    });
    this.dots.setText(parts.join("  "));
    this.dots.setColor(this.completed ? "#8fd4a8" : "#5c6170");
  }

  redrawWires() {
    this.wires.clear();
    const links = [
      ["user", "listener"],
      ["listener", "pga"],
      ["pga", "instance"],
      ["instance", "sga"],
      ["sga", "bg"],
      ["bg", "db"],
    ];
    links.forEach(([a, b]) => {
      const ua = this.UNITS.find((u) => u.id === a);
      const ub = this.UNITS.find((u) => u.id === b);
      const ia = this.UNITS.findIndex((u) => u.id === a);
      const on = ia < this.step;
      this.wires.lineStyle(2, on ? 0x4a9a94 : 0x2a2e38, on ? 0.85 : 0.35);
      this.wires.lineBetween(ua.x, ua.y, ub.x, ub.y);
    });
  }

  refreshUnits() {
    this.UNITS.forEach((u, i) => {
      const g = this.unitGfx[u.id];
      const done = i < this.step;
      const cur = i === this.step;
      const locked = i > this.step;
      if (u.hidden && locked) {
        g.box.setVisible(false);
        g.bar.setVisible(false);
        g.title.setVisible(false);
        g.sub.setVisible(false);
        g.mark.setVisible(false);
        return;
      }
      g.box.setVisible(true);
      g.bar.setVisible(true);
      g.title.setVisible(true);
      g.sub.setVisible(true);
      g.mark.setVisible(true);
      if (done) {
        g.box.setFillStyle(0x16332f);
        g.box.setStrokeStyle(2, this.C.ok);
        g.bar.setFillStyle(this.C.ok);
        g.title.setText(u.title).setColor("#8fd4a8");
        g.sub.setText(u.sub).setColor("#8a8f9c");
        g.mark.setText("open").setColor("#8fd4a8");
      } else if (cur) {
        g.box.setFillStyle(0x1a1d26);
        g.box.setStrokeStyle(2, this.C.gold);
        g.bar.setFillStyle(this.C.gold);
        g.title.setText(u.title).setColor("#eceef2");
        g.sub.setText(u.sub).setColor("#c4a574");
        g.mark.setText("E  task").setColor("#c4a574");
      } else {
        g.box.setFillStyle(this.C.surface);
        g.box.setStrokeStyle(1, this.C.border);
        g.bar.setFillStyle(this.C.teal).setAlpha(0.2);
        g.title.setText("???").setColor("#5c6170");
        g.sub.setText("locked").setColor("#5c6170");
        g.mark.setText("").setColor("#5c6170");
      }
    });
    this.shell.setStrokeStyle(2, this.step >= 3 ? 0x4a9a94 : 0x2a2e38);
    this.shellLab.setColor(this.step >= 3 ? "#4a9a94" : "#5c6170");
    this.refreshDots();
    this.redrawWires();
  }

  onUnit() {
    const x = this.hero.x;
    const y = this.hero.y;
    return this.UNITS.find((u, i) => {
      if (i > this.step) return false;
      if (u.hidden && i > this.step) return false;
      return Math.abs(x - u.x) < u.w / 2 && Math.abs(y - u.y) < u.h / 2;
    }) || null;
  }

  current() {
    return this.UNITS[this.step];
  }

  onKey(e) {
    if (e.key === "Escape") {
      if (this.mode !== "map") {
        this.mode = "map";
        this.typed = "";
        this.typedText.setText("");
        this.prompt.setText("Arrows / WASD walk   ·   E  task   ·   Esc menu");
        this.refreshUnits();
        return;
      }
      if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }

    if (this.mode === "quiz") {
      this.handleQuizKey(e);
      return;
    }
    if (this.mode === "deep") {
      if (this.quizUnit && this.quizUnit.dive && (e.key === "d" || e.key === "D")) {
        if (window.odysseyGoInstance && window.odysseyGoInstance()) return;
      }
      if (e.key === "e" || e.key === "E" || e.key === "Enter") this.closeDeep();
      return;
    }

    if (this.completed && (e.key === "m" || e.key === "M")) {
      if (window.odysseyGoMenu && window.odysseyGoMenu()) return;
      this.scene.start("MenuScene");
      return;
    }

    if (e.key === "d" || e.key === "D") {
      const stand = this.onUnit();
      if (this.completed || (stand && stand.dive)) {
        if (window.odysseyGoInstance && window.odysseyGoInstance()) return;
      }
      return;
    }

    if (e.key === "e" || e.key === "E" || e.key === "Enter") {
      const u = this.onUnit();
      if (!u) return;
      const i = this.UNITS.indexOf(u);
      if (i === this.step) this.openQuiz(u);
      else if (i < this.step) this.openDeep(u, false);
    }
  }

  handleQuizKey(e) {
    const u = this.quizUnit;
    if (!u) return;
    if (u.task.kind === "choice") {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= u.task.choices.length) this.tryChoice(n - 1);
      return;
    }
    if (e.key === "Backspace") {
      this.typed = this.typed.slice(0, -1);
      this.typedText.setText(this.typed);
      return;
    }
    if (e.key === "Enter") {
      this.tryType();
      return;
    }
    if (e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
      this.typed += e.key.toUpperCase();
      this.typedText.setText(this.typed);
    }
  }

  openQuiz(u) {
    this.mode = "quiz";
    this.quizUnit = u;
    this.typed = "";
    this.typedText.setText("");
    this.setExplain(u.arrive + "  " + u.task.prompt, "wait");
    if (u.task.kind === "choice") {
      this.prompt.setText(u.task.choices.map((c, i) => i + 1 + "  " + c).join("     ") + "     ·     Esc back");
    } else {
      this.prompt.setText("Type the answer, Enter to submit   ·   Esc back");
    }
  }

  tryChoice(i) {
    const u = this.quizUnit;
    if (i === u.task.answer) this.pass();
    else this.fail(u.task.hint);
  }

  tryType() {
    const u = this.quizUnit;
    const got = this.typed.replace(/\s+/g, " ").trim();
    if (u.task.answers.some((a) => a === got)) this.pass();
    else this.fail(u.task.hint);
  }

  fail(hint) {
    this.setExplain("Not that. " + hint, "wait");
    this.typed = "";
    this.typedText.setText("");
    this.cameras.main.shake(120, 0.004);
  }

  pass() {
    const u = this.quizUnit;
    this.typed = "";
    this.typedText.setText("");
    this.step = Math.min(this.UNITS.length, this.UNITS.indexOf(u) + 1);
    this.refreshUnits();
    if (this.step >= this.UNITS.length) this.completed = true;
    this.openDeep(u, true);
  }

  openDeep(u, first) {
    this.mode = "deep";
    this.quizUnit = u;
    const extra = u.dive
      ? "  D walks inside the Instance halls (Listener → PGA → SGA → disk → redo)."
      : "";
    this.setExplain(u.title + " — " + u.deep + extra, first ? "ok" : "teach");
    this.prompt.setText(u.dive ? "E  back to the map     ·     D  deeper halls" : "E  back to the map");
    this.cameras.main.flash(140, 7, 8, 12);
  }

  closeDeep() {
    this.mode = "map";
    this.typedText.setText("");
    const next = this.current();
    if (this.completed) {
      this.setExplain("The picture is complete: client → Listener → server/PGA → instance (SGA + processes) → database files.", "ok");
      this.prompt.setText("Level 06 complete  ·  Esc or M  menu  ·  D inside the Instance");
      return;
    }
    if (next) {
      this.setExplain("Next: walk to " + next.title + " (gold). Press E. Locked boxes stay dark until then.", "mute");
    }
    this.prompt.setText("Arrows / WASD walk   ·   E  task   ·   Esc menu");
  }

  finish() {
    this.completed = true;
    this.setExplain("The slide is whole. Client, Listener, PGA, instance, SGA, background processes, files. One system, two halves: memory and disk.", "ok");
    this.prompt.setText("Level 06 complete  ·  Esc or M  menu  ·  D inside the Instance");
  }

  update() {
    if (this.mode !== "map") return;
    const speed = 5.2;
    let dx = 0;
    let dy = 0;
    if (this.moveKeys.up.isDown || this.moveKeys.w.isDown) dy -= speed;
    if (this.moveKeys.down.isDown || this.moveKeys.s.isDown) dy += speed;
    if (this.moveKeys.left.isDown || this.moveKeys.a.isDown) dx -= speed;
    if (this.moveKeys.right.isDown || this.moveKeys.d.isDown) dx += speed;
    this.hero.x = Phaser.Math.Clamp(this.hero.x + dx, 40, 1060);
    this.hero.y = Phaser.Math.Clamp(this.hero.y + dy, 130, 680);

    const u = this.current();
    if (u && this.mode === "map") {
      const g = this.unitGfx[u.id];
      const pulse = 0.6 + Math.sin(this.time.now / 280) * 0.4;
      g.box.setStrokeStyle(2, this.C.gold, pulse);
    }
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
    this.tweens.killAll();
  }
}
